using Lighthouse.Sanctuary.Api.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Lighthouse.Sanctuary.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SupportersController(LighthouseContext context) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetSupporters(
        [FromQuery] string? type = null,
        [FromQuery] string? search = null)
    {
        var query = context.Supporters.AsQueryable();

        if (!string.IsNullOrWhiteSpace(type))
        {
            query = query.Where(s => s.SupporterType == type);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(s =>
                s.DisplayName.ToLower().Contains(term) ||
                (s.Email != null && s.Email.ToLower().Contains(term)));
        }

        var supporters = await query
            .OrderBy(s => s.DisplayName)
            .ToListAsync();

        return Ok(supporters);
    }

    [HttpGet("{id:int}/donations")]
    public async Task<IActionResult> GetSupporterDonations(int id)
    {
        var supporterExists = await context.Supporters.AnyAsync(s => s.SupporterId == id);
        if (!supporterExists)
        {
            return NotFound();
        }

        var donations = await context.Donations
            .Where(d => d.SupporterId == id)
            .OrderByDescending(d => d.DonationDate)
            .ToListAsync();

        return Ok(donations);
    }
}
