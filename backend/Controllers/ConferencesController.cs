using Lighthouse.Sanctuary.Api.Data;
using Lighthouse.Sanctuary.Api.Models;
using Lighthouse.Sanctuary.Api.Models.Conferences;
using Lighthouse.Sanctuary.Api.Services;
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
        [FromQuery] string? status = null,
        [FromQuery] bool scheduledOnly = true)
    {
        var residentMap = await context.Residents
            .AsNoTracking()
            .ToDictionaryAsync(resident => resident.ResidentId, resident => new
            {
                resident.CaseControlNo,
                resident.InternalCode
            });

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var query = context.InterventionPlans.AsNoTracking();

        if (scheduledOnly)
        {
            query = query.Where(plan => plan.CaseConferenceDate != null);
        }

        if (residentId.HasValue)
        {
            query = query.Where(plan => plan.ResidentId == residentId.Value);
        }

        if (!string.IsNullOrWhiteSpace(status))
        {
            var normalized = status.Trim().ToLowerInvariant();
            query = query.Where(plan => plan.Status != null && plan.Status.ToLower() == normalized);
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
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        request.PlanCategory = InputSanitizer.NormalizePlainText(request.PlanCategory, 64);
        request.PlanDescription = InputSanitizer.NormalizePlainText(request.PlanDescription, 1000, allowNewLines: true);
        request.ServicesProvided = InputSanitizer.NormalizePlainText(request.ServicesProvided, 200);
        request.Status = InputSanitizer.NormalizePlainText(request.Status, 24);

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
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        var plan = await context.InterventionPlans.FirstOrDefaultAsync(record => record.PlanId == planId);
        if (plan is null)
        {
            return NotFound();
        }

        request.PlanCategory = InputSanitizer.NormalizePlainText(request.PlanCategory, 64);
        request.PlanDescription = InputSanitizer.NormalizePlainText(request.PlanDescription, 1000, allowNewLines: true);
        request.ServicesProvided = InputSanitizer.NormalizePlainText(request.ServicesProvided, 200);
        request.Status = InputSanitizer.NormalizePlainText(request.Status, 24);

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

    [HttpDelete("{planId:int}")]
    public async Task<IActionResult> DeleteConference(int planId)
    {
        var plan = await context.InterventionPlans.FirstOrDefaultAsync(p => p.PlanId == planId);
        if (plan is null)
        {
            return NotFound(new { message = "Conference plan not found." });
        }

        context.InterventionPlans.Remove(plan);
        await context.SaveChangesAsync();
        return NoContent();
    }
}
