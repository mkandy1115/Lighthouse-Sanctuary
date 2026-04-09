using Lighthouse.Sanctuary.Api.Data;
using Lighthouse.Sanctuary.Api.Models;
using Lighthouse.Sanctuary.Api.Models.SocialMedia;
using Lighthouse.Sanctuary.Api.Services;
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

    [HttpPost]
    public async Task<IActionResult> CreatePost([FromBody] CreateSocialMediaPostRequest request)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        var platform = InputSanitizer.NormalizePlainText(request.Platform, 64);
        if (string.IsNullOrWhiteSpace(platform))
        {
            return BadRequest(new { message = "Platform is required." });
        }

        var platformPostId = InputSanitizer.NormalizePlainText(request.PlatformPostId, 120);
        if (string.IsNullOrWhiteSpace(platformPostId))
        {
            platformPostId = $"manual-{Guid.NewGuid():N}";
        }

        var post = new SocialMediaPost
        {
            Platform = platform,
            PlatformPostId = platformPostId,
            CreatedAt = DateTime.UtcNow,
            PostType = InputSanitizer.NormalizePlainText(request.PostType, 64),
            Caption = InputSanitizer.NormalizePlainText(request.Caption, 8000, allowNewLines: true),
            Reach = request.Reach,
        };

        context.SocialMediaPosts.Add(post);
        await context.SaveChangesAsync();
        return Ok(post);
    }

    [HttpPut("{postId:int}")]
    public async Task<IActionResult> UpdatePost(int postId, [FromBody] CreateSocialMediaPostRequest request)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        var post = await context.SocialMediaPosts.FirstOrDefaultAsync(p => p.PostId == postId);
        if (post is null)
        {
            return NotFound(new { message = "Post not found." });
        }

        var platform = InputSanitizer.NormalizePlainText(request.Platform, 64);
        if (string.IsNullOrWhiteSpace(platform))
        {
            return BadRequest(new { message = "Platform is required." });
        }

        post.Platform = platform;
        var platformPostId = InputSanitizer.NormalizePlainText(request.PlatformPostId, 120);
        if (!string.IsNullOrWhiteSpace(platformPostId))
        {
            post.PlatformPostId = platformPostId;
        }

        post.PostType = InputSanitizer.NormalizePlainText(request.PostType, 64);
        post.Caption = InputSanitizer.NormalizePlainText(request.Caption, 8000, allowNewLines: true);
        post.Reach = request.Reach;

        await context.SaveChangesAsync();
        return Ok(post);
    }

    [HttpDelete("{postId:int}")]
    public async Task<IActionResult> DeletePost(int postId)
    {
        var post = await context.SocialMediaPosts.FirstOrDefaultAsync(p => p.PostId == postId);
        if (post is null)
        {
            return NotFound(new { message = "Post not found." });
        }

        context.SocialMediaPosts.Remove(post);
        await context.SaveChangesAsync();
        return NoContent();
    }
}
