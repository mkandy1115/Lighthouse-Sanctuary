using Lighthouse.Sanctuary.Api.Data;
using Lighthouse.Sanctuary.Api.Models.Admin;
using Lighthouse.Sanctuary.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Lighthouse.Sanctuary.Api.Controllers;

[ApiController]
[Route("api/admin/ml-insights")]
[Authorize(Roles = "Admin")]
public class MlInsightsController(LighthouseContext context, MlScoringService scoringService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var churnById = await context.MlDonorChurnScores.AsNoTracking().ToDictionaryAsync(c => c.SupporterId);
        var upliftById = await context.MlDonorUpliftScores.AsNoTracking().ToDictionaryAsync(u => u.SupporterId);
        var supporterIds = churnById.Keys.Union(upliftById.Keys).Distinct().ToList();

        var names = await context.Supporters
            .AsNoTracking()
            .Where(s => supporterIds.Contains(s.SupporterId))
            .ToDictionaryAsync(s => s.SupporterId, s => s.DisplayName);

        var donorPipeline = supporterIds
            .Select(id =>
            {
                churnById.TryGetValue(id, out var churn);
                upliftById.TryGetValue(id, out var uplift);
                return new MlDonorPipelineItemDto
                {
                    SupporterId = id,
                    DonorName = names.GetValueOrDefault(id) ?? $"Supporter {id}",
                    ChurnScore = churn?.ChurnScore,
                    ChurnTier = churn?.ChurnTier,
                    ChurnModelVersion = churn?.ModelVersion,
                    ChurnScoredAtUtc = churn != null ? churn.ScoredAtUtc.ToString("O") : null,
                    DonorUpliftScore = uplift?.UpliftScore,
                    UpliftModelVersion = uplift?.ModelVersion,
                    UpliftScoredAtUtc = uplift != null ? uplift.ScoredAtUtc.ToString("O") : null,
                };
            })
            .OrderByDescending(row => row.ChurnScore ?? 0m)
            .ToList();

        var socialScores = await (
            from score in context.MlSocialPostScores.AsNoTracking()
            join post in context.SocialMediaPosts.AsNoTracking() on score.PostId equals post.PostId
            orderby score.UpliftScore descending
            select new MlSocialPostScoreItemDto
            {
                PostId = score.PostId,
                Platform = post.Platform,
                PostType = post.PostType,
                Caption = post.Caption,
                ChurnScore = score.ChurnScore,
                UpliftScore = score.UpliftScore,
                ModelVersion = score.ModelVersion,
                ScoredAtUtc = score.ScoredAtUtc.ToString("O")
            }
        ).ToListAsync();

        var readiness = await (
            from score in context.MlResidentReadinessScores.AsNoTracking()
            join resident in context.Residents.AsNoTracking() on score.ResidentId equals resident.ResidentId
            orderby score.ReadinessScore descending
            select new MlResidentReadinessItemDto
            {
                ResidentId = score.ResidentId,
                CaseControlNo = resident.CaseControlNo,
                InternalCode = resident.InternalCode,
                ReadinessScore = score.ReadinessScore,
                ReadinessTier = score.ReadinessTier,
                ModelVersion = score.ModelVersion,
                ScoredAtUtc = score.ScoredAtUtc.ToString("O")
            }
        ).ToListAsync();

        var latest = donorPipeline
            .SelectMany(row => new[]
            {
                DateTime.TryParse(row.ChurnScoredAtUtc, out var c) ? c : DateTime.MinValue,
                DateTime.TryParse(row.UpliftScoredAtUtc, out var u) ? u : DateTime.MinValue,
            })
            .Concat(socialScores.Select(r => DateTime.TryParse(r.ScoredAtUtc, out var dt) ? dt : DateTime.MinValue))
            .Concat(readiness.Select(r => DateTime.TryParse(r.ScoredAtUtc, out var dt) ? dt : DateTime.MinValue))
            .DefaultIfEmpty(DateTime.MinValue)
            .Max();

        return Ok(new MlInsightsResponse
        {
            LastRefreshedAtUtc = latest == DateTime.MinValue ? null : latest.ToString("O"),
            DonorPipeline = donorPipeline,
            SocialPostScores = socialScores,
            ResidentReadiness = readiness
        });
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh()
    {
        var result = await scoringService.RefreshAllAsync();
        return Ok(result);
    }
}
