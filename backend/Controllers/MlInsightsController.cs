using Lighthouse.Sanctuary.Api.Data;
using Lighthouse.Sanctuary.Api.Models.Admin;
using Lighthouse.Sanctuary.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace Lighthouse.Sanctuary.Api.Controllers;

[ApiController]
[Route("api/admin/ml-insights")]
[Authorize(Roles = "Admin")]
public class MlInsightsController(
    LighthouseContext context,
    MlScoringService scoringService,
    ILogger<MlInsightsController> logger) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Get()
    {
        try
        {
            var dbName = await context.Database.SqlQueryRaw<string>("select current_database()").SingleAsync();
            var dbUser = await context.Database.SqlQueryRaw<string>("select current_user").SingleAsync();
            var searchPath = await context.Database.SqlQueryRaw<string>("select current_setting('search_path')").SingleAsync();
            logger.LogInformation("MlInsights query context: db={DbName}, user={DbUser}, search_path={SearchPath}", dbName, dbUser, searchPath);

            var churnById = await context.MlDonorChurnScores
                .AsNoTracking()
                .ToDictionaryAsync(c => c.SupporterId);
            var upliftById = await context.MlDonorUpliftScores
                .AsNoTracking()
                .ToDictionaryAsync(u => u.SupporterId);
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
                        ChurnScoredAtUtc = churn?.ScoredAtUtc.ToString("O"),
                        DonorUpliftScore = uplift?.UpliftScore,
                        UpliftModelVersion = uplift?.ModelVersion,
                        UpliftScoredAtUtc = uplift?.ScoredAtUtc.ToString("O")
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
                    DateTime.TryParse(row.UpliftScoredAtUtc, out var u) ? u : DateTime.MinValue
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
        catch (Exception ex)
        {
            if (ex is PostgresException pg)
            {
                logger.LogError(pg,
                    "MlInsights PostgreSQL failure: sqlstate={SqlState}, message={MessageText}, detail={Detail}, where={Where}",
                    pg.SqlState, pg.MessageText, pg.Detail, pg.Where);
            }
            else
            {
                logger.LogError(ex, "MlInsights failed with non-Postgres exception.");
            }

            return Problem(
                title: "Unable to load ML insights.",
                detail: "See server logs for details.",
                statusCode: StatusCodes.Status500InternalServerError);
        }
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh()
    {
        var result = await scoringService.RefreshAllAsync();
        return Ok(result);
    }
}
