using System.Text.Json;
using System.Net.Http.Json;
using Lighthouse.Sanctuary.Api.Data;
using Lighthouse.Sanctuary.Api.Models;
using Lighthouse.Sanctuary.Api.Models.Admin;
using Microsoft.EntityFrameworkCore;

namespace Lighthouse.Sanctuary.Api.Services;

public class MlScoringService(
    LighthouseContext context,
    IConfiguration configuration,
    IHttpClientFactory httpClientFactory)
{
    public async Task<MlRefreshResult> RefreshAllAsync()
    {
        var now = DateTime.UtcNow;
        var runContext = BuildRunContext();
        using var payload = await RunFunctionApp(runContext);
        var root = payload.RootElement;

        var donorScores = ParseDonorChurnScores(root.GetProperty("pipeline1"));
        var socialScores = ParseSocialScores(root.GetProperty("pipeline2"));
        var readinessScores = ParseReadinessScores(root.GetProperty("pipeline3"));
        var donorUplift = ParseDonorUpliftScores(root.GetProperty("pipeline4"));
        var impactPredictions = ParseImpactPredictions(root.GetProperty("pipeline5"));

        // Pipeline 4 is donor-level uplift; blend average uplift into post-level outputs for dashboard comparability.
        if (socialScores.Count > 0 && donorUplift.Count > 0)
        {
            var upliftAverage = donorUplift.Average(s => s.UpliftScore);
            foreach (var score in socialScores)
            {
                score.UpliftScore = Clamp01((score.UpliftScore + upliftAverage) / 2m);
                score.ModelVersion = "pipeline2-4-v1";
            }
        }

        await UpsertDonorScores(donorScores);
        await UpsertSocialScores(socialScores);
        await UpsertReadinessScores(readinessScores);
        await UpsertImpactPredictions(impactPredictions);

        await context.SaveChangesAsync();

        return new MlRefreshResult
        {
            RefreshedAtUtc = now.ToString("O"),
            DonorChurnUpdated = donorScores.Count,
            SocialPostScoresUpdated = socialScores.Count,
            ResidentReadinessUpdated = readinessScores.Count,
            DonorImpactUpdated = impactPredictions.Count
        };
    }

    private (string functionUrl, string? functionKey, int timeoutMs, string profile) BuildRunContext()
    {
        var functionUrl = configuration["MlRuntime:FunctionAppUrl"];
        if (string.IsNullOrWhiteSpace(functionUrl))
        {
            throw new InvalidOperationException("Missing MlRuntime:FunctionAppUrl configuration.");
        }

        var functionKey = configuration["MlRuntime:FunctionKey"];

        var timeoutMs = int.TryParse(configuration["MlRuntime:TimeoutMs"], out var parsedTimeout)
            ? parsedTimeout
            : 180000;

        var profile = configuration["MlRuntime:DbProfile"] ?? "azure";
        return (functionUrl.TrimEnd('/'), functionKey, timeoutMs, profile);
    }

    private async Task<JsonDocument> RunFunctionApp((string functionUrl, string? functionKey, int timeoutMs, string profile) ctx)
    {
        var url = $"{ctx.functionUrl}/api/refresh-all";
        if (!string.IsNullOrWhiteSpace(ctx.functionKey))
        {
            url = $"{url}?code={Uri.EscapeDataString(ctx.functionKey)}";
        }

        using var client = httpClientFactory.CreateClient();
        client.Timeout = TimeSpan.FromMilliseconds(ctx.timeoutMs);
        using var request = new HttpRequestMessage(HttpMethod.Post, url)
        {
            Content = JsonContent.Create(new
            {
                profile = ctx.profile,
                timeoutSeconds = Math.Max(30, ctx.timeoutMs / 1000)
            })
        };

        using var response = await client.SendAsync(request);
        var body = await response.Content.ReadAsStringAsync();
        if (!response.IsSuccessStatusCode)
        {
            throw new InvalidOperationException(
                $"Function App refresh failed ({(int)response.StatusCode} {response.ReasonPhrase}). Body: {body}");
        }
        return JsonDocument.Parse(body);
    }

    private static List<MlDonorChurnScore> ParseDonorChurnScores(JsonElement pipelineResult)
    {
        var records = ReadRecords(pipelineResult);
        var output = new List<MlDonorChurnScore>();
        foreach (var row in records)
        {
            output.Add(new MlDonorChurnScore
            {
                SupporterId = row.GetProperty("supporter_id").GetInt32(),
                ChurnScore = ToDecimal01(row.GetProperty("churn_score")),
                ChurnTier = row.GetProperty("churn_tier").GetString() ?? "Medium",
                ModelVersion = row.GetProperty("model_version").GetString() ?? "pipeline1-v1",
                ScoredAtUtc = ToDateTime(row.GetProperty("scored_at_utc"))
            });
        }
        return output;
    }

    private static List<MlSocialPostScore> ParseSocialScores(JsonElement pipelineResult)
    {
        var records = ReadRecords(pipelineResult);
        var output = new List<MlSocialPostScore>();
        foreach (var row in records)
        {
            output.Add(new MlSocialPostScore
            {
                PostId = row.GetProperty("post_id").GetInt32(),
                ChurnScore = ToDecimal01(row.GetProperty("churn_score")),
                UpliftScore = ToDecimal01(row.GetProperty("uplift_score")),
                ModelVersion = row.GetProperty("model_version").GetString() ?? "pipeline2-v1",
                ScoredAtUtc = ToDateTime(row.GetProperty("scored_at_utc"))
            });
        }
        return output;
    }

    private static List<(int SupporterId, decimal UpliftScore)> ParseDonorUpliftScores(JsonElement pipelineResult)
    {
        var records = ReadRecords(pipelineResult);
        var output = new List<(int SupporterId, decimal UpliftScore)>();
        foreach (var row in records)
        {
            output.Add((
                row.GetProperty("supporter_id").GetInt32(),
                ToDecimal01(row.GetProperty("uplift_score"))
            ));
        }
        return output;
    }

    private static List<MlResidentReadinessScore> ParseReadinessScores(JsonElement pipelineResult)
    {
        var records = ReadRecords(pipelineResult);
        var output = new List<MlResidentReadinessScore>();
        foreach (var row in records)
        {
            output.Add(new MlResidentReadinessScore
            {
                ResidentId = row.GetProperty("resident_id").GetInt32(),
                ReadinessScore = ToDecimal01(row.GetProperty("readiness_score")),
                ReadinessTier = row.GetProperty("readiness_tier").GetString() ?? "Developing",
                ModelVersion = row.GetProperty("model_version").GetString() ?? "pipeline3-v1",
                ScoredAtUtc = ToDateTime(row.GetProperty("scored_at_utc"))
            });
        }
        return output;
    }

    private static List<MlDonorImpactPrediction> ParseImpactPredictions(JsonElement pipelineResult)
    {
        var records = ReadRecords(pipelineResult);
        var output = new List<MlDonorImpactPrediction>();
        foreach (var row in records)
        {
            output.Add(new MlDonorImpactPrediction
            {
                SupporterId = row.GetProperty("supporter_id").GetInt32(),
                ImpactScore = ToDecimal01(row.GetProperty("impact_score")),
                PredictedTopProgramArea = row.GetProperty("predicted_top_program_area").GetString() ?? "Education",
                PredictedEducationShare = ToDecimal01(row.GetProperty("predicted_education_share")),
                ModelVersion = row.GetProperty("model_version").GetString() ?? "pipeline5-v1",
                ScoredAtUtc = ToDateTime(row.GetProperty("scored_at_utc"))
            });
        }
        return output;
    }

    private static JsonElement.ArrayEnumerator ReadRecords(JsonElement pipelineResult)
    {
        if (!pipelineResult.TryGetProperty("records", out var records) || records.ValueKind != JsonValueKind.Array)
        {
            throw new InvalidOperationException("Pipeline output schema invalid: expected top-level 'records' array.");
        }
        return records.EnumerateArray();
    }

    private static DateTime ToDateTime(JsonElement value)
    {
        if (!DateTime.TryParse(value.GetString(), out var parsed))
        {
            return DateTime.UtcNow;
        }
        return parsed.Kind == DateTimeKind.Unspecified ? DateTime.SpecifyKind(parsed, DateTimeKind.Utc) : parsed.ToUniversalTime();
    }

    private static decimal ToDecimal01(JsonElement value)
    {
        decimal parsed = value.ValueKind switch
        {
            JsonValueKind.Number => value.GetDecimal(),
            JsonValueKind.String when decimal.TryParse(value.GetString(), out var asString) => asString,
            _ => 0m
        };
        return Clamp01(parsed);
    }

    private async Task UpsertDonorScores(List<MlDonorChurnScore> scores)
    {
        scores = scores
            .GroupBy(s => s.SupporterId)
            .Select(group => group.OrderByDescending(item => item.ScoredAtUtc).First())
            .ToList();
        var validSupporterIds = await context.Supporters
            .Select(s => s.SupporterId)
            .ToHashSetAsync();
        scores = scores.Where(score => validSupporterIds.Contains(score.SupporterId)).ToList();
        var ids = scores.Select(s => s.SupporterId).ToList();
        var existing = await context.MlDonorChurnScores.Where(s => ids.Contains(s.SupporterId)).ToDictionaryAsync(s => s.SupporterId);
        foreach (var score in scores)
        {
            if (existing.TryGetValue(score.SupporterId, out var row))
            {
                row.ChurnScore = score.ChurnScore;
                row.ChurnTier = score.ChurnTier;
                row.ModelVersion = score.ModelVersion;
                row.ScoredAtUtc = score.ScoredAtUtc;
            }
            else
            {
                context.MlDonorChurnScores.Add(score);
            }
        }
    }

    private async Task UpsertSocialScores(List<MlSocialPostScore> scores)
    {
        scores = scores
            .GroupBy(s => s.PostId)
            .Select(group => group.OrderByDescending(item => item.ScoredAtUtc).First())
            .ToList();
        var validPostIds = await context.SocialMediaPosts
            .Select(p => p.PostId)
            .ToHashSetAsync();
        scores = scores.Where(score => validPostIds.Contains(score.PostId)).ToList();
        var ids = scores.Select(s => s.PostId).ToList();
        var existing = await context.MlSocialPostScores.Where(s => ids.Contains(s.PostId)).ToDictionaryAsync(s => s.PostId);
        foreach (var score in scores)
        {
            if (existing.TryGetValue(score.PostId, out var row))
            {
                row.ChurnScore = score.ChurnScore;
                row.UpliftScore = score.UpliftScore;
                row.ModelVersion = score.ModelVersion;
                row.ScoredAtUtc = score.ScoredAtUtc;
            }
            else
            {
                context.MlSocialPostScores.Add(score);
            }
        }
    }

    private async Task UpsertReadinessScores(List<MlResidentReadinessScore> scores)
    {
        scores = scores
            .GroupBy(s => s.ResidentId)
            .Select(group => group.OrderByDescending(item => item.ScoredAtUtc).First())
            .ToList();
        var validResidentIds = await context.Residents
            .Select(r => r.ResidentId)
            .ToHashSetAsync();
        scores = scores.Where(score => validResidentIds.Contains(score.ResidentId)).ToList();
        var ids = scores.Select(s => s.ResidentId).ToList();
        var existing = await context.MlResidentReadinessScores.Where(s => ids.Contains(s.ResidentId)).ToDictionaryAsync(s => s.ResidentId);
        foreach (var score in scores)
        {
            if (existing.TryGetValue(score.ResidentId, out var row))
            {
                row.ReadinessScore = score.ReadinessScore;
                row.ReadinessTier = score.ReadinessTier;
                row.ModelVersion = score.ModelVersion;
                row.ScoredAtUtc = score.ScoredAtUtc;
            }
            else
            {
                context.MlResidentReadinessScores.Add(score);
            }
        }
    }

    private async Task UpsertImpactPredictions(List<MlDonorImpactPrediction> scores)
    {
        scores = scores
            .GroupBy(s => s.SupporterId)
            .Select(group => group.OrderByDescending(item => item.ScoredAtUtc).First())
            .ToList();
        var validSupporterIds = await context.Supporters
            .Select(s => s.SupporterId)
            .ToHashSetAsync();
        scores = scores.Where(score => validSupporterIds.Contains(score.SupporterId)).ToList();
        var ids = scores.Select(s => s.SupporterId).ToList();
        var existing = await context.MlDonorImpactPredictions.Where(s => ids.Contains(s.SupporterId)).ToDictionaryAsync(s => s.SupporterId);
        foreach (var score in scores)
        {
            if (existing.TryGetValue(score.SupporterId, out var row))
            {
                row.ImpactScore = score.ImpactScore;
                row.PredictedTopProgramArea = score.PredictedTopProgramArea;
                row.PredictedEducationShare = score.PredictedEducationShare;
                row.ModelVersion = score.ModelVersion;
                row.ScoredAtUtc = score.ScoredAtUtc;
            }
            else
            {
                context.MlDonorImpactPredictions.Add(score);
            }
        }
    }

    private static decimal Clamp01(decimal value) => Math.Max(0m, Math.Min(1m, value));
}
