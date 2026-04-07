using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Lighthouse.Sanctuary.Api.Models;

[Table("app_users")]
public class AppUser
{
    [Key]
    [Column("app_user_id")]
    public int AppUserId { get; set; }

    [Column("username")]
    public string Username { get; set; } = string.Empty;

    [Column("display_name")]
    public string DisplayName { get; set; } = string.Empty;

    [Column("email")]
    public string? Email { get; set; }

    [Column("password_hash")]
    public string PasswordHash { get; set; } = string.Empty;

    [Column("role")]
    public string Role { get; set; } = string.Empty;

    [Column("is_active")]
    public bool IsActive { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }
}
