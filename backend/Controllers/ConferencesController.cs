using Lighthouse.Sanctuary.Api.Data;
using Lighthouse.Sanctuary.Api.Models;
using Lighthouse.Sanctuary.Api.Models.Conferences;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Lighthouse.Sanctuary.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class ConferencesController(LighthouseContext context) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetConferences(
        [FromQuery] bool? upcoming = null,
        [FromQuery] int? residentId = null,
        [FromQuery] string? status = null)
    {
        var residentMap = await context.Residents
            .AsNoTracking()
            .ToDictionaryAsync(resident => resident.ResidentId, resident => new
            {
                resident.CaseControlNo,
                resident.InternalCode
            });

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var query = context.InterventionPlans
            .AsNoTracking()
            .Where(plan => plan.CaseConferenceDate != null);

        if (residentId.HasValue)
        {
            query = query.Where(plan => plan.ResidentId == residentId.Value);
        }

        if (!string.IsNullOrWhiteSpace(status))
        {
            query = query.Where(plan => plan.Status == status);
        }

        if (upcoming == true)
        {
            query = query.Where(plan => plan.CaseConferenceDate >= today);
        }
        else if (upcoming == false)
        {
            query = query.Where(plan => plan.CaseConferenceDate < today);
        }

        var plans = await query
            .OrderBy(plan => plan.CaseConferenceDate)
            .ThenByDescending(plan => plan.UpdatedAt)
            .ToListAsync();

        return Ok(plans.Select(plan => new
        {
            plan.PlanId,
            plan.ResidentId,
            ResidentCaseControlNo = residentMap.GetValueOrDefault(plan.ResidentId)?.CaseControlNo,
            ResidentInternalCode = residentMap.GetValueOrDefault(plan.ResidentId)?.InternalCode,
            plan.PlanCategory,
            plan.PlanDescription,
            plan.ServicesProvided,
            plan.TargetValue,
            plan.TargetDate,
            plan.Status,
            plan.CaseConferenceDate,
            plan.CreatedAt,
            plan.UpdatedAt
        }));
    }

    [HttpPost]
    public async Task<IActionResult> CreateConference([FromBody] CreateConferenceRequest request)
    {
        var residentExists = await context.Residents.AnyAsync(record => record.ResidentId == request.ResidentId);
        if (!residentExists)
        {
            return BadRequest(new { message = "Resident not found." });
        }

        if (string.IsNullOrWhiteSpace(request.PlanDescription))
        {
            return BadRequest(new { message = "Plan description is required." });
        }

        var now = DateTime.UtcNow;
        var plan = new InterventionPlan
        {
            ResidentId = request.ResidentId,
            PlanCategory = request.PlanCategory,
            PlanDescription = request.PlanDescription.Trim(),
            ServicesProvided = request.ServicesProvided,
            TargetValue = request.TargetValue,
            TargetDate = request.TargetDate,
            Status = string.IsNullOrWhiteSpace(request.Status) ? "Scheduled" : request.Status,
            CaseConferenceDate = request.CaseConferenceDate,
            CreatedAt = now,
            UpdatedAt = now
        };

        context.InterventionPlans.Add(plan);
        await context.SaveChangesAsync();
        return Ok(plan);
    }

    [HttpPut("{planId:int}")]
    public async Task<IActionResult> UpdateConference(int planId, [FromBody] UpdateConferenceRequest request)
    {
        var plan = await context.InterventionPlans.FirstOrDefaultAsync(record => record.PlanId == planId);
        if (plan is null)
        {
            return NotFound();
        }

        if (!string.IsNullOrWhiteSpace(request.PlanCategory))
        {
            plan.PlanCategory = request.PlanCategory;
        }

        if (!string.IsNullOrWhiteSpace(request.PlanDescription))
        {
            plan.PlanDescription = request.PlanDescription.Trim();
        }

        if (request.ServicesProvided is not null)
        {
            plan.ServicesProvided = request.ServicesProvided;
        }

        if (request.TargetValue.HasValue)
        {
            plan.TargetValue = request.TargetValue;
        }

        if (request.TargetDate.HasValue)
        {
            plan.TargetDate = request.TargetDate;
        }

        if (request.CaseConferenceDate.HasValue)
        {
            plan.CaseConferenceDate = request.CaseConferenceDate;
        }

        if (!string.IsNullOrWhiteSpace(request.Status))
        {
            plan.Status = request.Status;
        }

        plan.UpdatedAt = DateTime.UtcNow;
        await context.SaveChangesAsync();
        return Ok(plan);
    }
}
