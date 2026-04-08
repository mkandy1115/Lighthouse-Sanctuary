using System.ComponentModel.DataAnnotations;

namespace Lighthouse.Sanctuary.Api.Models.Auth;

public class RegisterDonorRequest
{
    [Required]
    [StringLength(80, MinimumLength = 1)]
    public string FirstName { get; set; } = string.Empty;

    [Required]
    [StringLength(80, MinimumLength = 1)]
    public string LastName { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    [StringLength(254)]
    public string Email { get; set; } = string.Empty;

    [Required]
    [StringLength(64, MinimumLength = 3)]
    public string Username { get; set; } = string.Empty;

    [Required]
    [StringLength(128, MinimumLength = 14)]
    public string Password { get; set; } = string.Empty;

    [Phone]
    [StringLength(40)]
    public string? Phone { get; set; }

    [StringLength(80)]
    public string? Country { get; set; }

    [StringLength(80)]
    public string? Region { get; set; }

    [StringLength(64)]
    public string? AcquisitionChannel { get; set; }
}
