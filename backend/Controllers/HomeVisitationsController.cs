using Lighthouse.Sanctuary.Api.Data;
using Lighthouse.Sanctuary.Api.Models;
using Lighthouse.Sanctuary.Api.Models.HomeVisitations;
using Lighthouse.Sanctuary.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Lighthouse.Sanctuary.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class HomeVisitationsController(LighthouseContext context) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetHomeVisitations([FromQuery] int? residentId = null)
    {
        var residentMap = await context.Residents
            .AsNoTracking()
            .ToDictionaryAsync(resident => resident.ResidentId, resident => new { resident.CaseControlNo, resident.InternalCode });

        var query = context.HomeVisitations.AsQueryable();
        if (residentId.HasValue)
        {
            query = query.Where(record => record.ResidentId == residentId.Value);
        }

        var visits = await query
            .AsNoTracking()
            .OrderByDescending(record => record.VisitDate)
            .ToListAsync();

        return Ok(visits.Select(visit => new
        {
            visit.VisitationId,
            visit.ResidentId,
            ResidentCaseControlNo = residentMap.GetValueOrDefault(visit.ResidentId)?.CaseControlNo,
            ResidentInternalCode = residentMap.GetValueOrDefault(visit.ResidentId)?.InternalCode,
            visit.VisitDate,
            visit.SocialWorker,
            visit.VisitType,
            visit.LocationVisited,
            visit.FamilyMembersPresent,
            visit.Purpose,
            visit.Observations,
            visit.FamilyCooperationLevel,
            visit.SafetyConcernsNoted,
            visit.FollowUpNeeded,
            visit.FollowUpNotes,
            visit.VisitOutcome
        }));
    }

    [HttpPost]
    public async Task<IActionResult> CreateHomeVisitation([FromBody] CreateHomeVisitationRequest request)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        request.SocialWorker = InputSanitizer.NormalizePlainText(request.SocialWorker, 120);
        request.VisitType = InputSanitizer.NormalizePlainText(request.VisitType, 64);
        request.LocationVisited = InputSanitizer.NormalizePlainText(request.LocationVisited, 240);
        request.FamilyMembersPresent = InputSanitizer.NormalizePlainText(request.FamilyMembersPresent, 240);
        request.Purpose = InputSanitizer.NormalizePlainText(request.Purpose, 500);
        request.Observations = InputSanitizer.NormalizePlainText(request.Observations, 4000, allowNewLines: true);
        request.FamilyCooperationLevel = InputSanitizer.NormalizePlainText(request.FamilyCooperationLevel, 40);
        request.FollowUpNotes = InputSanitizer.NormalizePlainText(request.FollowUpNotes, 2000, allowNewLines: true);
        request.VisitOutcome = InputSanitizer.NormalizePlainText(request.VisitOutcome, 40);

        var residentExists = await context.Residents.AnyAsync(record => record.ResidentId == request.ResidentId);
        if (!residentExists)
        {
            return BadRequest(new { message = "Resident not found." });
        }

        var visit = new HomeVisitation
        {
            ResidentId = request.ResidentId,
            VisitDate = request.VisitDate,
            SocialWorker = request.SocialWorker,
            VisitType = request.VisitType,
            LocationVisited = request.LocationVisited,
            FamilyMembersPresent = request.FamilyMembersPresent,
            Purpose = request.Purpose,
            Observations = request.Observations,
            FamilyCooperationLevel = request.FamilyCooperationLevel,
            SafetyConcernsNoted = request.SafetyConcernsNoted,
            FollowUpNeeded = request.FollowUpNeeded,
            FollowUpNotes = request.FollowUpNotes,
            VisitOutcome = request.VisitOutcome
        };

        context.HomeVisitations.Add(visit);
        await context.SaveChangesAsync();
        return Ok(visit);
    }
}
