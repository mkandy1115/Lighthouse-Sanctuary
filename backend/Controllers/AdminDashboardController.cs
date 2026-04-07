using Lighthouse.Sanctuary.Api.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Lighthouse.Sanctuary.Api.Controllers;

[ApiController]
[Route("api/admin/dashboard")]
public class AdminDashboardController(LighthouseContext context) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var activeResidents = await context.Residents.CountAsync(r => r.CaseStatus == "Active");
        var activeSafehouses = await context.Safehouses.CountAsync(s => s.Status == "Active");
        var recentDonations = await context.Donations
            .AsNoTracking()
            .Where(d => d.Amount != null)
            .OrderByDescending(d => d.DonationDate)
            .Take(5)
            .ToListAsync();

        var safehouseMetrics = await context.SafehouseMonthlyMetrics
            .AsNoTracking()
            .OrderByDescending(m => m.MonthStart)
            .Take(6)
            .ToListAsync();

        var upcomingCaseConferences = await context.InterventionPlans
            .AsNoTracking()
            .Where(p => p.CaseConferenceDate != null)
            .OrderByDescending(p => p.CaseConferenceDate)
            .Take(5)
            .Select(p => new
            {
                p.PlanId,
                p.ResidentId,
                p.PlanCategory,
                p.Status,
                p.CaseConferenceDate
            })
            .ToListAsync();

        return Ok(new
        {
            activeResidents,
            activeSafehouses,
            recentDonations,
            safehouseMetrics,
            upcomingCaseConferences
        });
    }
}
