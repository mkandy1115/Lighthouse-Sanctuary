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
    private const int MinimumPasswordLength = 8;

    private static string? ValidatePasswordPolicy(string password, string? username = null)
    {
        if (string.IsNullOrWhiteSpace(password))
        {
            return "Password is required.";
        }

        if (password.Length < MinimumPasswordLength)
        {
            return $"Password must be at least {MinimumPasswordLength} characters.";
        }

        return null;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        var username = InputSanitizer.NormalizePlainText(request.Username, 64);
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
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        var firstName = InputSanitizer.NormalizePlainText(request.FirstName, 80);
        var lastName = InputSanitizer.NormalizePlainText(request.LastName, 80);
        var email = InputSanitizer.NormalizeEmail(request.Email);
        var username = InputSanitizer.NormalizePlainText(request.Username, 64);
        var phone = InputSanitizer.NormalizePlainText(request.Phone, 40);
        var country = InputSanitizer.NormalizePlainText(request.Country, 80);
        var region = InputSanitizer.NormalizePlainText(request.Region, 80);
        var acquisitionChannel = InputSanitizer.NormalizePlainText(request.AcquisitionChannel, 64);

        if (string.IsNullOrWhiteSpace(firstName)
            || string.IsNullOrWhiteSpace(lastName)
            || string.IsNullOrWhiteSpace(email)
            || string.IsNullOrWhiteSpace(username)
            || string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(new { message = "First name, last name, email, username, and password are required." });
        }

        if (InputSanitizer.LooksUnsafe(firstName)
            || InputSanitizer.LooksUnsafe(lastName)
            || InputSanitizer.LooksUnsafe(username)
            || InputSanitizer.LooksUnsafe(phone)
            || InputSanitizer.LooksUnsafe(country)
            || InputSanitizer.LooksUnsafe(region)
            || InputSanitizer.LooksUnsafe(acquisitionChannel))
        {
            return BadRequest(new { message = "One or more fields contains unsafe input." });
        }

        var passwordError = ValidatePasswordPolicy(request.Password, username);
        if (passwordError is not null)
        {
            return BadRequest(new { message = passwordError });
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
            Phone = string.IsNullOrWhiteSpace(phone) ? null : phone,
            Country = string.IsNullOrWhiteSpace(country) ? "Ghana" : country,
            Region = string.IsNullOrWhiteSpace(region) ? null : region,
            RelationshipType = "International",
            Status = "Active",
            CreatedAt = DateTime.UtcNow,
            AcquisitionChannel = string.IsNullOrWhiteSpace(acquisitionChannel)
                ? "Website"
                : acquisitionChannel
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
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        var username = InputSanitizer.NormalizePlainText(request.Username, 64);
        if (request.SupporterId <= 0 || string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(new { message = "Supporter ID, username, and password are required." });
        }
        if (InputSanitizer.LooksUnsafe(username))
        {
            return BadRequest(new { message = "Username contains unsafe input." });
        }

        var passwordError = ValidatePasswordPolicy(request.Password, username);
        if (passwordError is not null)
        {
            return BadRequest(new { message = passwordError });
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
    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        if (string.IsNullOrWhiteSpace(request.CurrentPassword) || string.IsNullOrWhiteSpace(request.NewPassword))
        {
            return BadRequest(new { message = "Current password and new password are required." });
        }

        if (request.NewPassword == request.CurrentPassword)
        {
            return BadRequest(new { message = "New password must be different from your current password." });
        }

        var userIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!int.TryParse(userIdValue, out var userId))
        {
            return Unauthorized();
        }

        var user = await context.AppUsers.FindAsync(userId);
        if (user is null || !user.IsActive)
        {
            return Unauthorized();
        }

        var passwordError = ValidatePasswordPolicy(request.NewPassword, user.Username);
        if (passwordError is not null)
        {
            return BadRequest(new { message = passwordError });
        }

        var currentCheck = passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.CurrentPassword);
        if (currentCheck == PasswordVerificationResult.Failed)
        {
            return BadRequest(new { message = "Current password is incorrect." });
        }

        user.PasswordHash = passwordHasher.HashPassword(user, request.NewPassword);
        await context.SaveChangesAsync();

        return Ok(new { message = "Password updated successfully." });
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
