using System.Security.Claims;
using Lighthouse.Sanctuary.Api.Data;
using Lighthouse.Sanctuary.Api.Models;
using Lighthouse.Sanctuary.Api.Models.Admin;
using Lighthouse.Sanctuary.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Lighthouse.Sanctuary.Api.Controllers;

[ApiController]
[Authorize(Roles = "Admin")]
[Route("api/admin/users")]
public class AdminUsersController(
    LighthouseContext context,
    IPasswordHasher<AppUser> passwordHasher) : ControllerBase
{
    private static readonly HashSet<string> AllowedRoles = new(StringComparer.OrdinalIgnoreCase)
    {
        "Admin",
        "Donor"
    };

    [HttpGet]
    public async Task<IActionResult> GetUsers()
    {
        var users = await context.AppUsers
            .AsNoTracking()
            .OrderBy(u => u.Username)
            .Select(u => new AdminUserListItemDto
            {
                Id = u.AppUserId,
                Username = u.Username,
                DisplayName = u.DisplayName,
                Email = u.Email,
                Role = u.Role,
                IsActive = u.IsActive,
                CreatedAt = u.CreatedAt
            })
            .ToListAsync();

        return Ok(users);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateAdminUserRequest request)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        var username = InputSanitizer.NormalizePlainText(request.Username, 64);
        var displayName = InputSanitizer.NormalizePlainText(request.DisplayName, 128);
        var email = InputSanitizer.NormalizeEmail(request.Email);
        var role = InputSanitizer.NormalizePlainText(request.Role, 16);

        if (string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(displayName) || string.IsNullOrWhiteSpace(email))
        {
            return BadRequest(new { message = "Username, display name, and email are required." });
        }

        if (!AllowedRoles.Contains(role))
        {
            return BadRequest(new { message = "Unsupported role. Allowed roles: Admin, Donor." });
        }

        var passwordPolicyError = ValidatePasswordPolicy(request.Password, username);
        if (passwordPolicyError is not null)
        {
            return BadRequest(new { message = passwordPolicyError });
        }

        var usernameExists = await context.AppUsers.AnyAsync(u => u.Username == username);
        if (usernameExists)
        {
            return Conflict(new { message = "Username already exists." });
        }

        var newUser = new AppUser
        {
            Username = username,
            DisplayName = displayName,
            Email = email,
            Role = role.Equals("Admin", StringComparison.OrdinalIgnoreCase) ? "Admin" : "Donor",
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        newUser.PasswordHash = passwordHasher.HashPassword(newUser, request.Password);
        context.AppUsers.Add(newUser);
        await context.SaveChangesAsync();

        return Ok(ToListItem(newUser));
    }

    [HttpPatch("{id:int}/role")]
    public async Task<IActionResult> UpdateRole(int id, [FromBody] UpdateUserRoleRequest request)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        var normalizedRole = InputSanitizer.NormalizePlainText(request.Role, 16);
        if (!AllowedRoles.Contains(normalizedRole))
        {
            return BadRequest(new { message = "Unsupported role. Allowed roles: Admin, Donor." });
        }

        var user = await context.AppUsers.FirstOrDefaultAsync(u => u.AppUserId == id);
        if (user is null)
        {
            return NotFound(new { message = "User not found." });
        }

        var currentUserIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var isCurrentUser = int.TryParse(currentUserIdValue, out var currentUserId) && currentUserId == id;
        var isDemotingAdmin = user.Role.Equals("Admin", StringComparison.OrdinalIgnoreCase)
            && !normalizedRole.Equals("Admin", StringComparison.OrdinalIgnoreCase);

        if (isDemotingAdmin)
        {
            var otherActiveAdmins = await context.AppUsers.CountAsync(u =>
                u.IsActive
                && u.Role == "Admin"
                && u.AppUserId != id);

            if (otherActiveAdmins == 0)
            {
                return BadRequest(new { message = "Cannot demote the last active admin account." });
            }

            if (isCurrentUser)
            {
                return BadRequest(new { message = "You cannot demote your own admin account." });
            }
        }

        user.Role = normalizedRole.Equals("Admin", StringComparison.OrdinalIgnoreCase) ? "Admin" : "Donor";
        await context.SaveChangesAsync();

        return Ok(new AdminUserListItemDto
        {
            Id = user.AppUserId,
            Username = user.Username,
            DisplayName = user.DisplayName,
            Email = user.Email,
            Role = user.Role,
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt
        });
    }

    [HttpPatch("{id:int}/active")]
    public async Task<IActionResult> SetActive(int id, [FromBody] SetUserActiveRequest request)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        var user = await context.AppUsers.FirstOrDefaultAsync(u => u.AppUserId == id);
        if (user is null)
        {
            return NotFound(new { message = "User not found." });
        }

        if (!request.IsActive
            && user.IsActive
            && user.Role.Equals("Admin", StringComparison.OrdinalIgnoreCase))
        {
            var otherActiveAdmins = await context.AppUsers.CountAsync(u =>
                u.IsActive
                && u.Role == "Admin"
                && u.AppUserId != id);

            if (otherActiveAdmins == 0)
            {
                return BadRequest(new { message = "Cannot deactivate the last active admin account." });
            }
        }

        user.IsActive = request.IsActive;
        await context.SaveChangesAsync();

        return Ok(new AdminUserListItemDto
        {
            Id = user.AppUserId,
            Username = user.Username,
            DisplayName = user.DisplayName,
            Email = user.Email,
            Role = user.Role,
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt
        });
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateAdminUserRequest request)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        var user = await context.AppUsers.FirstOrDefaultAsync(u => u.AppUserId == id);
        if (user is null)
        {
            return NotFound(new { message = "User not found." });
        }

        if (request.Username is not null)
        {
            var username = InputSanitizer.NormalizePlainText(request.Username, 64);
            if (string.IsNullOrWhiteSpace(username))
            {
                return BadRequest(new { message = "Username cannot be blank." });
            }

            var usernameExists = await context.AppUsers.AnyAsync(u => u.Username == username && u.AppUserId != id);
            if (usernameExists)
            {
                return Conflict(new { message = "Username already exists." });
            }

            user.Username = username;
        }

        if (request.DisplayName is not null)
        {
            var displayName = InputSanitizer.NormalizePlainText(request.DisplayName, 128);
            if (string.IsNullOrWhiteSpace(displayName))
            {
                return BadRequest(new { message = "Display name cannot be blank." });
            }

            user.DisplayName = displayName;
        }

        if (request.Email is not null)
        {
            var email = InputSanitizer.NormalizeEmail(request.Email);
            if (string.IsNullOrWhiteSpace(email))
            {
                return BadRequest(new { message = "Email cannot be blank." });
            }

            user.Email = email;
        }

        await context.SaveChangesAsync();
        return Ok(ToListItem(user));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var user = await context.AppUsers.FirstOrDefaultAsync(u => u.AppUserId == id);
        if (user is null)
        {
            return NotFound(new { message = "User not found." });
        }

        var currentUserIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var isCurrentUser = int.TryParse(currentUserIdValue, out var currentUserId) && currentUserId == id;
        if (isCurrentUser)
        {
            return BadRequest(new { message = "You cannot delete your own account." });
        }

        if (user.Role.Equals("Admin", StringComparison.OrdinalIgnoreCase) && user.IsActive)
        {
            var otherActiveAdmins = await context.AppUsers.CountAsync(u =>
                u.IsActive
                && u.Role == "Admin"
                && u.AppUserId != id);

            if (otherActiveAdmins == 0)
            {
                return BadRequest(new { message = "Cannot delete the last active admin account." });
            }
        }

        context.AppUsers.Remove(user);
        await context.SaveChangesAsync();
        return NoContent();
    }

    private static string? ValidatePasswordPolicy(string password, string? username = null)
    {
        if (string.IsNullOrWhiteSpace(password))
        {
            return "Password is required.";
        }

        if (password.Length < 14)
        {
            return "Password must be at least 14 characters.";
        }

        var hasUpper = password.Any(char.IsUpper);
        var hasLower = password.Any(char.IsLower);
        var hasDigit = password.Any(char.IsDigit);
        var hasSpecial = password.Any(c => !char.IsLetterOrDigit(c));

        if (!(hasUpper && hasLower && hasDigit && hasSpecial))
        {
            return "Password must include uppercase, lowercase, number, and special character.";
        }

        if (!string.IsNullOrWhiteSpace(username)
            && password.Contains(username, StringComparison.OrdinalIgnoreCase))
        {
            return "Password must not contain your username.";
        }

        return null;
    }

    private static AdminUserListItemDto ToListItem(AppUser user) => new()
    {
        Id = user.AppUserId,
        Username = user.Username,
        DisplayName = user.DisplayName,
        Email = user.Email,
        Role = user.Role,
        IsActive = user.IsActive,
        CreatedAt = user.CreatedAt
    };
}
