using Lighthouse.Sanctuary.Api.Data;
using Lighthouse.Sanctuary.Api.Models;
using Lighthouse.Sanctuary.Api.Models.Residents;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Lighthouse.Sanctuary.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ResidentsController(LighthouseContext context) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetResidents(
        [FromQuery] string? search = null,
        [FromQuery] string? status = null,
        [FromQuery] int? safehouseId = null,
        [FromQuery] string? category = null)
    {
        var query = context.Residents.AsQueryable();

        if (!string.IsNullOrWhiteSpace(status))
        {
            query = query.Where(resident => resident.CaseStatus == status);
        }

        if (safehouseId.HasValue)
        {
            query = query.Where(resident => resident.SafehouseId == safehouseId.Value);
        }

        if (!string.IsNullOrWhiteSpace(category))
        {
            query = query.Where(resident => resident.CaseCategory == category);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(resident =>
                resident.CaseControlNo.ToLower().Contains(term)
                || resident.InternalCode.ToLower().Contains(term)
                || (resident.AssignedSocialWorker != null && resident.AssignedSocialWorker.ToLower().Contains(term)));
        }

        var safehouseMap = await context.Safehouses
            .AsNoTracking()
            .ToDictionaryAsync(safehouse => safehouse.SafehouseId, safehouse => safehouse.Name);

        var residents = await query
            .AsNoTracking()
            .OrderByDescending(resident => resident.DateOfAdmission)
            .Select(resident => new
            {
                resident.ResidentId,
                resident.CaseControlNo,
                resident.InternalCode,
                resident.SafehouseId,
                resident.CaseStatus,
                resident.CaseCategory,
                resident.AssignedSocialWorker,
                resident.CurrentRiskLevel,
                resident.DateOfAdmission,
                resident.PresentAge,
                resident.SubCatTrafficked,
                resident.SubCatPhysicalAbuse,
                resident.SubCatSexualAbuse,
                resident.SubCatAtRisk
            })
            .ToListAsync();

        return Ok(residents.Select(resident => new
        {
            resident.ResidentId,
            resident.CaseControlNo,
            resident.InternalCode,
            resident.SafehouseId,
            SafehouseName = safehouseMap.GetValueOrDefault(resident.SafehouseId, "Unassigned"),
            resident.CaseStatus,
            resident.CaseCategory,
            resident.AssignedSocialWorker,
            resident.CurrentRiskLevel,
            resident.DateOfAdmission,
            resident.PresentAge,
            Tags = new[]
            {
                resident.SubCatTrafficked ? "Trafficked" : null,
                resident.SubCatPhysicalAbuse ? "Physical Abuse" : null,
                resident.SubCatSexualAbuse ? "Sexual Abuse" : null,
                resident.SubCatAtRisk ? "At Risk" : null
            }.Where(tag => tag is not null)
        }));
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetResident(int id)
    {
        var resident = await context.Residents
            .AsNoTracking()
            .FirstOrDefaultAsync(record => record.ResidentId == id);

        if (resident is null)
        {
            return NotFound();
        }

        var safehouse = await context.Safehouses
            .AsNoTracking()
            .FirstOrDefaultAsync(record => record.SafehouseId == resident.SafehouseId);

        var processRecordings = await context.ProcessRecordings
            .AsNoTracking()
            .Where(record => record.ResidentId == id)
            .OrderByDescending(record => record.SessionDate)
            .ToListAsync();

        var homeVisitations = await context.HomeVisitations
            .AsNoTracking()
            .Where(record => record.ResidentId == id)
            .OrderByDescending(record => record.VisitDate)
            .ToListAsync();

        var interventions = await context.InterventionPlans
            .AsNoTracking()
            .Where(record => record.ResidentId == id)
            .OrderByDescending(record => record.UpdatedAt)
            .ToListAsync();

        return Ok(new
        {
            resident,
            safehouseName = safehouse?.Name,
            processRecordings,
            homeVisitations,
            interventions
        });
    }

    [HttpPost]
    public async Task<IActionResult> CreateResident([FromBody] CreateResidentRequest request)
    {
        var resident = new Resident
        {
            CaseControlNo = request.CaseControlNo.Trim(),
            InternalCode = request.InternalCode.Trim(),
            SafehouseId = request.SafehouseId,
            CaseStatus = request.CaseStatus,
            Sex = request.Sex,
            DateOfBirth = request.DateOfBirth,
            DateOfAdmission = request.DateOfAdmission,
            CaseCategory = request.CaseCategory,
            AssignedSocialWorker = request.AssignedSocialWorker,
            ReferralSource = request.ReferralSource,
            CurrentRiskLevel = request.CurrentRiskLevel,
            InitialRiskLevel = request.CurrentRiskLevel,
            InitialCaseAssessment = request.InitialCaseAssessment,
            SubCatTrafficked = request.SubCatTrafficked,
            SubCatPhysicalAbuse = request.SubCatPhysicalAbuse,
            SubCatSexualAbuse = request.SubCatSexualAbuse,
            SubCatAtRisk = request.SubCatAtRisk,
            IsPwd = request.IsPwd,
            PwdType = request.PwdType,
            HasSpecialNeeds = request.HasSpecialNeeds,
            SpecialNeedsDiagnosis = request.SpecialNeedsDiagnosis,
            FamilyIs4Ps = request.FamilyIs4Ps,
            FamilySoloParent = request.FamilySoloParent,
            FamilyIndigenous = request.FamilyIndigenous,
            FamilyInformalSettler = request.FamilyInformalSettler,
            CreatedAt = DateTime.UtcNow
        };

        context.Residents.Add(resident);
        await context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetResident), new { id = resident.ResidentId }, resident);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateResident(int id, [FromBody] UpdateResidentRequest request)
    {
        var resident = await context.Residents.FirstOrDefaultAsync(record => record.ResidentId == id);
        if (resident is null)
        {
            return NotFound();
        }

        resident.CaseControlNo = request.CaseControlNo.Trim();
        resident.InternalCode = request.InternalCode.Trim();
        resident.SafehouseId = request.SafehouseId;
        resident.CaseStatus = request.CaseStatus;
        resident.Sex = request.Sex;
        resident.DateOfBirth = request.DateOfBirth;
        resident.DateOfAdmission = request.DateOfAdmission;
        resident.CaseCategory = request.CaseCategory;
        resident.AssignedSocialWorker = request.AssignedSocialWorker;
        resident.ReferralSource = request.ReferralSource;
        resident.CurrentRiskLevel = request.CurrentRiskLevel;
        resident.InitialRiskLevel = request.InitialRiskLevel ?? resident.InitialRiskLevel;
        resident.InitialCaseAssessment = request.InitialCaseAssessment;
        resident.ReintegrationStatus = request.ReintegrationStatus;
        resident.ReintegrationType = request.ReintegrationType;
        resident.NotesRestricted = request.NotesRestricted;
        resident.SubCatTrafficked = request.SubCatTrafficked;
        resident.SubCatPhysicalAbuse = request.SubCatPhysicalAbuse;
        resident.SubCatSexualAbuse = request.SubCatSexualAbuse;
        resident.SubCatAtRisk = request.SubCatAtRisk;
        resident.IsPwd = request.IsPwd;
        resident.PwdType = request.PwdType;
        resident.HasSpecialNeeds = request.HasSpecialNeeds;
        resident.SpecialNeedsDiagnosis = request.SpecialNeedsDiagnosis;
        resident.FamilyIs4Ps = request.FamilyIs4Ps;
        resident.FamilySoloParent = request.FamilySoloParent;
        resident.FamilyIndigenous = request.FamilyIndigenous;
        resident.FamilyInformalSettler = request.FamilyInformalSettler;

        await context.SaveChangesAsync();
        return Ok(resident);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteResident(int id)
    {
        var resident = await context.Residents.FirstOrDefaultAsync(record => record.ResidentId == id);
        if (resident is null)
        {
            return NotFound();
        }

        context.Residents.Remove(resident);
        await context.SaveChangesAsync();
        return NoContent();
    }
}
