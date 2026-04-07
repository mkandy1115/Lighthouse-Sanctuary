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
                Role = user.Role,
                SupporterId = user.SupporterId
            }
        });
    }

    [HttpPost("register-donor")]
    public async Task<IActionResult> RegisterDonor([FromBody] RegisterDonorRequest request)
    {
        var firstName = request.FirstName.Trim();
        var lastName = request.LastName.Trim();
        var email = request.Email.Trim().ToLowerInvariant();
        var username = request.Username.Trim();

        if (string.IsNullOrWhiteSpace(firstName)
            || string.IsNullOrWhiteSpace(lastName)
            || string.IsNullOrWhiteSpace(email)
            || string.IsNullOrWhiteSpace(username)
            || string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(new { message = "First name, last name, email, username, and password are required." });
        }

        if (request.Password.Length < 8)
        {
            return BadRequest(new { message = "Password must be at least 8 characters." });
        }

        var usernameExists = await context.AppUsers.AnyAsync(user =>
            user.Username.ToLower() == username.ToLower());
        if (usernameExists)
        {
            return Conflict(new { message = "That username is already in use." });
        }

        var emailExists = await context.AppUsers.AnyAsync(user =>
            user.Email != null && user.Email.ToLower() == email);
        if (emailExists)
        {
            return Conflict(new { message = "That email is already connected to an account." });
        }

        var supporter = new Supporter
        {
            SupporterType = "MonetaryDonor",
            DisplayName = $"{firstName} {lastName}",
            FirstName = firstName,
            LastName = lastName,
            Email = email,
            Phone = string.IsNullOrWhiteSpace(request.Phone) ? null : request.Phone.Trim(),
            Country = string.IsNullOrWhiteSpace(request.Country) ? "Ghana" : request.Country.Trim(),
            Region = string.IsNullOrWhiteSpace(request.Region) ? null : request.Region.Trim(),
            RelationshipType = "International",
            Status = "Active",
            CreatedAt = DateTime.UtcNow,
            AcquisitionChannel = string.IsNullOrWhiteSpace(request.AcquisitionChannel)
                ? "Website"
                : request.AcquisitionChannel.Trim()
        };

        context.Supporters.Add(supporter);
        await context.SaveChangesAsync();

        var user = new AppUser
        {
            Username = username,
            DisplayName = supporter.DisplayName,
            Email = email,
            SupporterId = supporter.SupporterId,
            Role = "Donor",
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };
        user.PasswordHash = passwordHasher.HashPassword(user, request.Password);

        context.AppUsers.Add(user);
        await context.SaveChangesAsync();

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
                Role = user.Role,
                SupporterId = user.SupporterId
            }
        });
    }

    [HttpPost("register-existing-donor")]
    public async Task<IActionResult> RegisterExistingDonor([FromBody] RegisterExistingDonorRequest request)
    {
        var username = request.Username.Trim();
        if (request.SupporterId <= 0 || string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(new { message = "Supporter ID, username, and password are required." });
        }

        if (request.Password.Length < 8)
        {
            return BadRequest(new { message = "Password must be at least 8 characters." });
        }

        var usernameExists = await context.AppUsers.AnyAsync(user =>
            user.Username.ToLower() == username.ToLower());
        if (usernameExists)
        {
            return Conflict(new { message = "That username is already in use." });
        }

        var supporter = await context.Supporters
            .FirstOrDefaultAsync(record => record.SupporterId == request.SupporterId);
        if (supporter is null)
        {
            return NotFound(new { message = "Supporter record not found." });
        }

        var existingLinkedUser = await context.AppUsers
            .AnyAsync(user => user.SupporterId == request.SupporterId);
        if (existingLinkedUser)
        {
            return Conflict(new { message = "That donor already has a login account." });
        }

        var fallbackEmail = !string.IsNullOrWhiteSpace(supporter.Email)
            ? supporter.Email.Trim().ToLowerInvariant()
            : $"{username}@imari.local";

        var emailExists = await context.AppUsers.AnyAsync(user =>
            user.Email != null && user.Email.ToLower() == fallbackEmail.ToLower());
        if (emailExists)
        {
            fallbackEmail = $"{username}+donor@imari.local";
        }

        var user = new AppUser
        {
            Username = username,
            DisplayName = supporter.DisplayName,
            Email = fallbackEmail,
            SupporterId = supporter.SupporterId,
            Role = "Donor",
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };
        user.PasswordHash = passwordHasher.HashPassword(user, request.Password);

        context.AppUsers.Add(user);
        await context.SaveChangesAsync();

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
                Role = user.Role,
                SupporterId = user.SupporterId
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
            Role = user.Role,
            SupporterId = user.SupporterId
        });
    }
}
