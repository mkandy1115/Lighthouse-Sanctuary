using Lighthouse.Sanctuary.Api.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Lighthouse.Sanctuary.Api.Controllers;

[ApiController]
[Route("api/site-metrics")]
public class SiteMetricsController(LighthouseContext context) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var girlsSupported = await context.Residents.CountAsync(r => r.Sex == "F");
        var reintegrationCompleted = await context.Residents.CountAsync(r => r.ReintegrationStatus == "Completed");
        var reintegrationTracked = await context.Residents.CountAsync(r => r.ReintegrationStatus != null);
        var totalImpactPhp = await context.DonationAllocations.SumAsync(a => a.AmountAllocated);

        var latestEducationPerResident = await context.EducationRecords
            .AsNoTracking()
            .GroupBy(record => record.ResidentId)
            .Select(group => group.OrderByDescending(record => record.RecordDate).First())
            .ToListAsync();

        var programCompletionPct = latestEducationPerResident.Count > 0
            ? (decimal)latestEducationPerResident.Count(record => record.CompletionStatus == "Completed") * 100m / latestEducationPerResident.Count
            : 0m;

        var educationProgressPct = latestEducationPerResident.Count > 0
            ? (decimal)latestEducationPerResident.Count(record => record.ProgressPercent >= 67m) * 100m / latestEducationPerResident.Count
            : 0m;

        var attendanceEngagementPct = latestEducationPerResident.Count > 0
            ? (decimal)latestEducationPerResident.Count(record => record.AttendanceRate >= 0.71m) * 100m / latestEducationPerResident.Count
            : 0m;

        var latestHealthPerResident = await context.HealthWellbeingRecords
            .AsNoTracking()
            .GroupBy(record => record.ResidentId)
            .Select(group => group.OrderByDescending(record => record.RecordDate).First())
            .ToListAsync();

        var wellbeingPct = latestHealthPerResident.Count > 0
            ? (decimal)latestHealthPerResident.Count(record => record.GeneralHealthScore >= 3.0m) * 100m / latestHealthPerResident.Count
            : 0m;

        var postPlacement = await context.HomeVisitations
            .AsNoTracking()
            .Where(v => v.VisitType == "Post-Placement Monitoring")
            .ToListAsync();
        var stableHousingVisitPct = postPlacement.Count > 0
            ? (decimal)postPlacement.Count(v => v.VisitOutcome == "Favorable") * 100m / postPlacement.Count
            : 0m;

        var monthStart = new DateOnly(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1);
        var fundsRaisedMtd = await context.Donations
            .AsNoTracking()
            .Where(d => d.Amount != null && d.DonationDate >= monthStart)
            .SumAsync(d => d.Amount ?? 0m);

        var weekStart = DateOnly.FromDateTime(DateTime.UtcNow.Date.AddDays(-(int)DateTime.UtcNow.DayOfWeek));
        var sessionsThisWeek = await context.ProcessRecordings
            .AsNoTracking()
            .CountAsync(r => r.SessionDate >= weekStart);

        var homeVisitsDue = await context.HomeVisitations
            .AsNoTracking()
            .CountAsync(v => v.FollowUpNeeded);

        var activeCases = await context.Residents.CountAsync(r => r.CaseStatus == "Active");

        var allocationByProgram = await context.DonationAllocations
            .AsNoTracking()
            .GroupBy(a => a.ProgramArea)
            .Select(group => new
            {
                programArea = group.Key,
                amount = group.Sum(a => a.AmountAllocated)
            })
            .ToListAsync();

        var allocationTotal = allocationByProgram.Sum(row => row.amount);

        return Ok(new
        {
            aggregates = new
            {
                girlsSupported,
                reintegrationCompleted,
                reintegrationTracked,
                reintegrationSuccessPct = reintegrationTracked > 0 ? (decimal)reintegrationCompleted * 100m / reintegrationTracked : 0m,
                totalImpactPhp,
                programCompletionPct,
                stableHousingVisitPct,
                educationProgressPct,
                attendanceEngagementPct,
                wellbeingPct,
                activeCases,
                sessionsThisWeek,
                homeVisitsDue,
                fundsRaisedMtd
            },
            allocations = new
            {
                total = allocationTotal,
                byProgram = allocationByProgram
            }
        });
    }
}
