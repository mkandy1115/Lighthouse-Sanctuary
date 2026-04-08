using System.ComponentModel.DataAnnotations;

namespace Lighthouse.Sanctuary.Api.Models.Auth;

public class RegisterExistingDonorRequest
{
    [Range(1, int.MaxValue)]
    public int SupporterId { get; set; }

    [Required]
    [StringLength(64, MinimumLength = 3)]
    public string Username { get; set; } = string.Empty;

    [Required]
    [StringLength(128, MinimumLength = 14)]
    public string Password { get; set; } = string.Empty;
}
