using System.ComponentModel.DataAnnotations;

namespace Lighthouse.Sanctuary.Api.Models.Admin;

public class AdminUserListItemDto
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string Role { get; set; } = "Donor";
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class UpdateUserRoleRequest
{
    [Required]
    [StringLength(16)]
    public string Role { get; set; } = string.Empty;
}

public class SetUserActiveRequest
{
    [Required]
    public bool IsActive { get; set; }
}

public class CreateAdminUserRequest
{
    [Required]
    [StringLength(64, MinimumLength = 3)]
    public string Username { get; set; } = string.Empty;

    [Required]
    [StringLength(128, MinimumLength = 2)]
    public string DisplayName { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    [StringLength(254)]
    public string Email { get; set; } = string.Empty;

    [Required]
    [StringLength(128, MinimumLength = 14)]
    public string Password { get; set; } = string.Empty;

    [Required]
    [StringLength(16)]
    public string Role { get; set; } = "Donor";
}

public class UpdateAdminUserRequest
{
    [StringLength(64, MinimumLength = 3)]
    public string? Username { get; set; }

    [StringLength(128, MinimumLength = 2)]
    public string? DisplayName { get; set; }

    [EmailAddress]
    [StringLength(254)]
    public string? Email { get; set; }
}
