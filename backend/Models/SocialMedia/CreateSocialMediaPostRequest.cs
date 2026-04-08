using System.ComponentModel.DataAnnotations;

namespace Lighthouse.Sanctuary.Api.Models.SocialMedia;

public class CreateSocialMediaPostRequest
{
    [Required]
    [StringLength(64)]
    public string Platform { get; set; } = string.Empty;

    [StringLength(120)]
    public string? PlatformPostId { get; set; }

    [StringLength(64)]
    public string? PostType { get; set; }

    [StringLength(8000)]
    public string? Caption { get; set; }

    public int? Reach { get; set; }
}
