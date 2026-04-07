using Lighthouse.Sanctuary.Api.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Lighthouse.Sanctuary.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ResidentsController(LighthouseContext context) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetResidents(
        [FromQuery] int pageNum = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? status = null,
        [FromQuery] string? risk = null,
        [FromQuery] int? safehouseId = null,
        [FromQuery] string? search = null)
    {
        var query = context.Residents.AsQueryable();

        if (!string.IsNullOrWhiteSpace(status))
        {
            query = query.Where(r => r.CaseStatus == status);
        }

        if (!string.IsNullOrWhiteSpace(risk))
        {
            query = query.Where(r => r.CurrentRiskLevel == risk);
        }

        if (safehouseId.HasValue)
        {
            query = query.Where(r => r.SafehouseId == safehouseId.Value);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(r =>
                r.CaseControlNo.ToLower().Contains(term) ||
                r.InternalCode.ToLower().Contains(term) ||
                (r.AssignedSocialWorker != null && r.AssignedSocialWorker.ToLower().Contains(term)));
        }

        var totalCount = await query.CountAsync();

        var residents = await query
            .OrderByDescending(r => r.CreatedAt)
            .Skip((pageNum - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return Ok(new { residents, totalCount });
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetResident(int id)
    {
        var resident = await context.Residents.FindAsync(id);
        return resident is null ? NotFound() : Ok(resident);
    }
}
