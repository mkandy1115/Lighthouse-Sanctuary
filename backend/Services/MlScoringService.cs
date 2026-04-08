using System.Diagnostics;
using System.ComponentModel;
using System.Text.Json;
using Lighthouse.Sanctuary.Api.Data;
using Lighthouse.Sanctuary.Api.Models;
using Lighthouse.Sanctuary.Api.Models.Admin;
using Microsoft.EntityFrameworkCore;

namespace Lighthouse.Sanctuary.Api.Services;

public class MlScoringService(
    LighthouseContext context,
    IConfiguration configuration,
    IWebHostEnvironment environment)
{
    public async Task<MlRefreshResult> RefreshAllAsync()
    {
        var now = DateTime.UtcNow;

        var runContext = BuildRunContext();
        var p1 = await RunPipeline(runContext, "ML_Pipeline_1");
        var p2 = await RunPipeline(runContext, "ML_Pipeline_2");
        var p3 = await RunPipeline(runContext, "ML_Pipeline_3");
        var p4 = await RunPipeline(runContext, "ML_Pipeline_4");
        var p5 = await RunPipeline(runContext, "ML_Pipeline_5");

        var donorScores = ParseDonorChurnScores(p1);
        var socialScores = ParseSocialScores(p2);
        var readinessScores = ParseReadinessScores(p3);
        var donorUplift = ParseDonorUpliftScores(p4);
        var impactPredictions = ParseImpactPredictions(p5);

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

    private (string pythonExe, string pipelineRoot, int timeoutMs, string profile) BuildRunContext()
    {
        var pythonExe = configuration["MlRuntime:PythonExecutable"];
        if (string.IsNullOrWhiteSpace(pythonExe))
        {
            pythonExe = "python3";
        }

        var configuredRoot = configuration["MlRuntime:PipelineRoot"];
        var pipelineRoot = string.IsNullOrWhiteSpace(configuredRoot)
            ? Path.GetFullPath(Path.Combine(environment.ContentRootPath, ".."))
            : configuredRoot;

        var timeoutMs = int.TryParse(configuration["MlRuntime:TimeoutMs"], out var parsedTimeout)
            ? parsedTimeout
            : 120000;

        var profile = configuration["MlRuntime:DbProfile"] ?? "local";
        return (pythonExe, pipelineRoot, timeoutMs, profile);
    }

    private async Task<JsonDocument> RunPipeline((string pythonExe, string pipelineRoot, int timeoutMs, string profile) ctx, string pipelineFolder)
    {
        var folder = Path.Combine(ctx.pipelineRoot, pipelineFolder);
        var script = Path.Combine(folder, "run_pipeline.py");
        if (!File.Exists(script))
        {
            throw new InvalidOperationException($"Pipeline script not found: {script}");
        }

        var tempOutput = Path.GetTempFileName();
        try
        {
            await ExecutePython(ctx.pythonExe, script, folder, tempOutput, ctx.profile, ctx.timeoutMs, pipelineFolder);

            if (!File.Exists(tempOutput))
            {
                throw new InvalidOperationException($"Pipeline output file missing for {pipelineFolder}.");
            }

            using var fs = File.OpenRead(tempOutput);
            return await JsonDocument.ParseAsync(fs);
        }
        catch (Win32Exception ex)
        {
            if (ctx.pythonExe == "python3")
            {
                await ExecutePython("python", script, folder, tempOutput, ctx.profile, ctx.timeoutMs, pipelineFolder);
                using var fs = File.OpenRead(tempOutput);
                return await JsonDocument.ParseAsync(fs);
            }
            throw new InvalidOperationException($"Python executable not found or not runnable ({ctx.pythonExe}).", ex);
        }
        finally
        {
            if (File.Exists(tempOutput))
            {
                File.Delete(tempOutput);
            }
        }
    }

    private static async Task ExecutePython(
        string pythonExe,
        string script,
        string folder,
        string outputPath,
        string profile,
        int timeoutMs,
        string pipelineFolder)
    {
        var args = $"\"{script}\" --profile {profile} --output \"{outputPath}\"";
        var startInfo = new ProcessStartInfo
        {
            FileName = pythonExe,
            Arguments = args,
            WorkingDirectory = folder,
            RedirectStandardOutput = true,
            RedirectStandardError = true,
            UseShellExecute = false,
            CreateNoWindow = true
        };

        using var process = new Process { StartInfo = startInfo };
        process.Start();

        var stdOutTask = process.StandardOutput.ReadToEndAsync();
        var stdErrTask = process.StandardError.ReadToEndAsync();

        var completed = await Task.Run(() => process.WaitForExit(timeoutMs));
        if (!completed)
        {
            try { process.Kill(true); } catch { }
            throw new InvalidOperationException($"Pipeline timed out ({pipelineFolder}) after {timeoutMs}ms.");
        }

        var stdOut = await stdOutTask;
        var stdErr = await stdErrTask;

        if (process.ExitCode != 0)
        {
            throw new InvalidOperationException(
                $"Pipeline failed ({pipelineFolder}) with exit code {process.ExitCode}. stderr: {stdErr} stdout: {stdOut}");
        }
    }

    private static List<MlDonorChurnScore> ParseDonorChurnScores(JsonDocument doc)
    {
        var records = ReadRecords(doc);
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

    private static List<MlSocialPostScore> ParseSocialScores(JsonDocument doc)
    {
        var records = ReadRecords(doc);
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

    private static List<(int SupporterId, decimal UpliftScore)> ParseDonorUpliftScores(JsonDocument doc)
    {
        var records = ReadRecords(doc);
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

    private static List<MlResidentReadinessScore> ParseReadinessScores(JsonDocument doc)
    {
        var records = ReadRecords(doc);
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

    private static List<MlDonorImpactPrediction> ParseImpactPredictions(JsonDocument doc)
    {
        var records = ReadRecords(doc);
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

    private static JsonElement.ArrayEnumerator ReadRecords(JsonDocument doc)
    {
        if (!doc.RootElement.TryGetProperty("records", out var records) || records.ValueKind != JsonValueKind.Array)
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
