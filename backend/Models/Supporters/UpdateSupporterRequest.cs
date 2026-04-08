using System.ComponentModel.DataAnnotations;

namespace Lighthouse.Sanctuary.Api.Models.Supporters;

public class UpdateSupporterRequest
{
    [Required]
    [StringLength(160)]
    public string DisplayName { get; set; } = string.Empty;

    [EmailAddress]
    [StringLength(254)]
    public string? Email { get; set; }

    [Phone]
    [StringLength(40)]
    public string? Phone { get; set; }

    [Required]
    [StringLength(20)]
    public string Status { get; set; } = string.Empty;

    [StringLength(40)]
    public string? SupporterType { get; set; }

    [StringLength(40)]
    public string? RelationshipType { get; set; }
}
