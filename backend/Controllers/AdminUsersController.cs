using System.Security.Claims;
using Lighthouse.Sanctuary.Api.Data;
using Lighthouse.Sanctuary.Api.Models.Admin;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Lighthouse.Sanctuary.Api.Controllers;

[ApiController]
[Authorize(Roles = "Admin")]
[Route("api/admin/users")]
public class AdminUsersController(LighthouseContext context) : ControllerBase
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

    [HttpPatch("{id:int}/role")]
    public async Task<IActionResult> UpdateRole(int id, [FromBody] UpdateUserRoleRequest request)
    {
        var normalizedRole = (request.Role ?? string.Empty).Trim();
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
}
