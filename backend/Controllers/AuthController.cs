using System.Security.Claims;
using Lighthouse.Sanctuary.Api.Data;
using Lighthouse.Sanctuary.Api.Models;
using Lighthouse.Sanctuary.Api.Models.Auth;
using Lighthouse.Sanctuary.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Lighthouse.Sanctuary.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(
    LighthouseContext context,
    IPasswordHasher<AppUser> passwordHasher,
    JwtTokenService jwtTokenService) : ControllerBase
{
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var username = request.Username.Trim();
        if (string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(new { message = "Username and password are required." });
        }

        var user = await context.AppUsers
            .FirstOrDefaultAsync(appUser => appUser.Username.ToLower() == username.ToLower() && appUser.IsActive);

        if (user is null)
        {
            return Unauthorized(new { message = "Invalid username or password." });
        }

        var result = passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.Password);
        if (result == PasswordVerificationResult.Failed)
        {
            return Unauthorized(new { message = "Invalid username or password." });
        }

        var (token, expiresAtUtc) = jwtTokenService.CreateToken(user);

        return Ok(new LoginResponse
        {
            Token = token,
            ExpiresAtUtc = expiresAtUtc,
            User = new AuthUserDto
            {
                Id = user.AppUserId,
                Username = user.Username,
                DisplayName = user.DisplayName,
                Role = user.Role
            }
        });
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> Me()
    {
        var userIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!int.TryParse(userIdValue, out var userId))
        {
            return Unauthorized();
        }

        var user = await context.AppUsers.FindAsync(userId);
        if (user is null)
        {
            return Unauthorized();
        }

        return Ok(new AuthUserDto
        {
            Id = user.AppUserId,
            Username = user.Username,
            DisplayName = user.DisplayName,
            Role = user.Role
        });
    }
}
