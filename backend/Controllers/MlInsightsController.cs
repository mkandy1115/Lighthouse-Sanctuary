using Lighthouse.Sanctuary.Api.Data;
using Lighthouse.Sanctuary.Api.Models.Admin;
using Lighthouse.Sanctuary.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Lighthouse.Sanctuary.Api.Controllers;

[ApiController]
[Route("api/admin/ml-insights")]
public class MlInsightsController(LighthouseContext context, MlScoringService scoringService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var donorRisks = await (
            from score in context.MlDonorChurnScores.AsNoTracking()
            join supporter in context.Supporters.AsNoTracking() on score.SupporterId equals supporter.SupporterId
            orderby score.ChurnScore descending
            select new MlDonorRiskItemDto
            {
                SupporterId = score.SupporterId,
                DonorName = supporter.DisplayName,
                ChurnScore = score.ChurnScore,
                ChurnTier = score.ChurnTier,
                ModelVersion = score.ModelVersion,
                ScoredAtUtc = score.ScoredAtUtc.ToString("O")
            }
        ).ToListAsync();

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

        var latest = donorRisks.Select(r => DateTime.TryParse(r.ScoredAtUtc, out var dt) ? dt : DateTime.MinValue)
            .Concat(socialScores.Select(r => DateTime.TryParse(r.ScoredAtUtc, out var dt) ? dt : DateTime.MinValue))
            .Concat(readiness.Select(r => DateTime.TryParse(r.ScoredAtUtc, out var dt) ? dt : DateTime.MinValue))
            .DefaultIfEmpty(DateTime.MinValue)
            .Max();

        return Ok(new MlInsightsResponse
        {
            LastRefreshedAtUtc = latest == DateTime.MinValue ? null : latest.ToString("O"),
            DonorRisks = donorRisks,
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
