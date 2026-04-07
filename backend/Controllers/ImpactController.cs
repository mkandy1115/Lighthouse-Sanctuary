using Lighthouse.Sanctuary.Api.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Lighthouse.Sanctuary.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ImpactController(LighthouseContext context) : ControllerBase
{
    [HttpGet("latest")]
    public async Task<IActionResult> GetLatestSnapshot()
    {
        var snapshot = await context.PublicImpactSnapshots
            .OrderByDescending(snapshot => snapshot.SnapshotDate)
            .FirstOrDefaultAsync();

        return snapshot is null ? NotFound() : Ok(snapshot);
    }

    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary()
    {
        var activeResidents = await context.Residents.CountAsync(r => r.CaseStatus == "Active");
        var activeSafehouses = await context.Safehouses.CountAsync(s => s.Status == "Active");
        var totalSupporters = await context.Supporters.CountAsync(s => s.Status == "Active");
        var totalDonationValue = await context.Donations.SumAsync(d => d.Amount ?? d.EstimatedValue ?? 0m);

        return Ok(new
        {
            activeResidents,
            activeSafehouses,
            totalSupporters,
            totalDonationValue
        });
    }
}
