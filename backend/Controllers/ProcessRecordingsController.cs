using Lighthouse.Sanctuary.Api.Data;
using Lighthouse.Sanctuary.Api.Models;
using Lighthouse.Sanctuary.Api.Models.ProcessRecordings;
using Lighthouse.Sanctuary.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Lighthouse.Sanctuary.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class ProcessRecordingsController(LighthouseContext context) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetProcessRecordings([FromQuery] int? residentId = null)
    {
        var residentMap = await context.Residents
            .AsNoTracking()
            .ToDictionaryAsync(resident => resident.ResidentId, resident => new { resident.CaseControlNo, resident.InternalCode });

        var query = context.ProcessRecordings.AsQueryable();
        if (residentId.HasValue)
        {
            query = query.Where(record => record.ResidentId == residentId.Value);
        }

        var recordings = await query
            .AsNoTracking()
            .OrderByDescending(record => record.SessionDate)
            .ToListAsync();

        return Ok(recordings.Select(record => new
        {
            record.RecordingId,
            record.ResidentId,
            ResidentCaseControlNo = residentMap.GetValueOrDefault(record.ResidentId)?.CaseControlNo,
            ResidentInternalCode = residentMap.GetValueOrDefault(record.ResidentId)?.InternalCode,
            record.SessionDate,
            record.SocialWorker,
            record.SessionType,
            record.SessionDurationMinutes,
            record.EmotionalStateObserved,
            record.EmotionalStateEnd,
            record.SessionNarrative,
            record.InterventionsApplied,
            record.FollowUpActions,
            record.ProgressNoted,
            record.ConcernsFlagged,
            record.ReferralMade
        }));
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetProcessRecording(int id)
    {
        var record = await context.ProcessRecordings
            .AsNoTracking()
            .FirstOrDefaultAsync(recording => recording.RecordingId == id);
        if (record is null)
        {
            return NotFound();
        }

        var resident = await context.Residents
            .AsNoTracking()
            .Where(res => res.ResidentId == record.ResidentId)
            .Select(res => new { res.ResidentId, res.CaseControlNo, res.InternalCode })
            .FirstOrDefaultAsync();

        return Ok(new
        {
            record.RecordingId,
            record.ResidentId,
            ResidentCaseControlNo = resident?.CaseControlNo,
            ResidentInternalCode = resident?.InternalCode,
            record.SessionDate,
            record.SocialWorker,
            record.SessionType,
            record.SessionDurationMinutes,
            record.EmotionalStateObserved,
            record.EmotionalStateEnd,
            record.SessionNarrative,
            record.InterventionsApplied,
            record.FollowUpActions,
            record.ProgressNoted,
            record.ConcernsFlagged,
            record.ReferralMade
        });
    }

    [HttpPost]
    public async Task<IActionResult> CreateProcessRecording([FromBody] CreateProcessRecordingRequest request)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        request.SocialWorker = InputSanitizer.NormalizePlainText(request.SocialWorker, 120);
        request.SessionType = InputSanitizer.NormalizePlainText(request.SessionType, 24);
        request.EmotionalStateObserved = InputSanitizer.NormalizePlainText(request.EmotionalStateObserved, 32);
        request.EmotionalStateEnd = InputSanitizer.NormalizePlainText(request.EmotionalStateEnd, 32);
        request.SessionNarrative = InputSanitizer.NormalizePlainText(request.SessionNarrative, 4000, allowNewLines: true);
        request.InterventionsApplied = InputSanitizer.NormalizePlainText(request.InterventionsApplied, 2000, allowNewLines: true);
        request.FollowUpActions = InputSanitizer.NormalizePlainText(request.FollowUpActions, 2000, allowNewLines: true);

        var residentExists = await context.Residents.AnyAsync(record => record.ResidentId == request.ResidentId);
        if (!residentExists)
        {
            return BadRequest(new { message = "Resident not found." });
        }

        var recording = new ProcessRecording
        {
            ResidentId = request.ResidentId,
            SessionDate = request.SessionDate,
            SocialWorker = request.SocialWorker,
            SessionType = request.SessionType,
            SessionDurationMinutes = request.SessionDurationMinutes,
            EmotionalStateObserved = request.EmotionalStateObserved,
            EmotionalStateEnd = request.EmotionalStateEnd,
            SessionNarrative = request.SessionNarrative,
            InterventionsApplied = request.InterventionsApplied,
            FollowUpActions = request.FollowUpActions,
            ProgressNoted = request.ProgressNoted,
            ConcernsFlagged = request.ConcernsFlagged,
            ReferralMade = request.ReferralMade
        };

        context.ProcessRecordings.Add(recording);
        await context.SaveChangesAsync();
        return Ok(recording);
    }
}
