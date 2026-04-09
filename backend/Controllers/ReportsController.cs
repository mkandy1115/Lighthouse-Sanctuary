using System.Globalization;
using Lighthouse.Sanctuary.Api.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Lighthouse.Sanctuary.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class ReportsController(LighthouseContext context) : ControllerBase
{
    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary()
    {
        var donationsByMonth = await context.Donations
            .AsNoTracking()
            .Where(d => d.Amount != null)
            .GroupBy(d => new { d.DonationDate.Year, d.DonationDate.Month })
            .OrderBy(g => g.Key.Year)
            .ThenBy(g => g.Key.Month)
            .Select(g => new
            {
                month = $"{g.Key.Year:D4}-{g.Key.Month:D2}",
                raised = g.Sum(d => d.Amount ?? 0m),
                donors = g.Select(d => d.SupporterId).Distinct().Count()
            })
            .ToListAsync();

        var residentOutcomeMetrics = await context.SafehouseMonthlyMetrics
            .AsNoTracking()
            .OrderByDescending(metric => metric.MonthStart)
            .Take(12)
            .ToListAsync();

        var safehouseComparisons = await context.SafehouseMonthlyMetrics
            .AsNoTracking()
            .GroupBy(metric => metric.SafehouseId)
            .Select(group => new
            {
                safehouseId = group.Key,
                avgEducationProgress = group.Average(metric => metric.AvgEducationProgress ?? 0),
                avgHealthScore = group.Average(metric => metric.AvgHealthScore ?? 0),
                avgActiveResidents = group.Average(metric => metric.ActiveResidents),
                totalHomeVisitations = group.Sum(metric => metric.HomeVisitationCount),
                totalProcessRecordings = group.Sum(metric => metric.ProcessRecordingCount)
            })
            .ToListAsync();

        var reintegrationSuccessRate = await context.Residents
            .AsNoTracking()
            .Where(resident => resident.ReintegrationStatus != null)
            .GroupBy(_ => 1)
            .Select(group => new
            {
                completed = group.Count(resident => resident.ReintegrationStatus == "Completed"),
                totalTracked = group.Count()
            })
            .FirstOrDefaultAsync();

        return Ok(new
        {
            donationsByMonth,
            residentOutcomeMetrics,
            safehouseComparisons,
            reintegration = new
            {
                completed = reintegrationSuccessRate?.completed ?? 0,
                totalTracked = reintegrationSuccessRate?.totalTracked ?? 0
            }
        });
    }

    /// <summary>Aggregates monetary donations by campaign name (or &quot;Direct Giving&quot; when unset).</summary>
    [HttpGet("campaigns")]
    public async Task<IActionResult> GetCampaignSummaries()
    {
        var donations = await context.Donations
            .AsNoTracking()
            .Where(d => d.Amount != null)
            .ToListAsync();

        var culture = CultureInfo.InvariantCulture;
        var result = donations
            .GroupBy(d => string.IsNullOrWhiteSpace(d.CampaignName) ? "Direct Giving" : d.CampaignName!.Trim())
            .Select(group =>
            {
                var monthly = group
                    .GroupBy(d => new { d.DonationDate.Year, d.DonationDate.Month })
                    .OrderBy(g => g.Key.Year)
                    .ThenBy(g => g.Key.Month)
                    .Select(mg => new
                    {
                        month = culture.DateTimeFormat.GetAbbreviatedMonthName(mg.Key.Month),
                        amount = mg.Sum(d => d.Amount ?? 0m)
                    })
                    .ToList();

                return new
                {
                    name = group.Key,
                    raised = group.Sum(d => d.Amount ?? 0m),
                    donorCount = group.Select(d => d.SupporterId).Distinct().Count(),
                    donationCount = group.Count(),
                    firstDonationDate = group.Min(d => d.DonationDate).ToString("yyyy-MM-dd", culture),
                    lastDonationDate = group.Max(d => d.DonationDate).ToString("yyyy-MM-dd", culture),
                    monthlyData = monthly
                };
            })
            .OrderByDescending(c => c.raised)
            .ToList();

        return Ok(result);
    }
}
