using Lighthouse.Sanctuary.Api.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Lighthouse.Sanctuary.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class SocialMediaPostsController(LighthouseContext context) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetPosts([FromQuery] string? platform = null)
    {
        var query = context.SocialMediaPosts.AsQueryable();

        if (!string.IsNullOrWhiteSpace(platform))
        {
            query = query.Where(post => post.Platform == platform);
        }

        var posts = await query
            .OrderByDescending(post => post.CreatedAt)
            .ToListAsync();

        return Ok(posts);
    }
}
