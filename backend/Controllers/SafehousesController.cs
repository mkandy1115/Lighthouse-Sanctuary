using Lighthouse.Sanctuary.Api.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Lighthouse.Sanctuary.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class SafehousesController(LighthouseContext context) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetSafehouses()
    {
        var safehouses = await context.Safehouses
            .OrderBy(s => s.SafehouseCode)
            .ToListAsync();

        return Ok(safehouses);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetSafehouse(int id)
    {
        var safehouse = await context.Safehouses.FindAsync(id);
        return safehouse is null ? NotFound() : Ok(safehouse);
    }
}
