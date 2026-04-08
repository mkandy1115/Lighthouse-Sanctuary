using System.ComponentModel.DataAnnotations;

namespace Lighthouse.Sanctuary.Api.Models.Supporters;

public class CreateSupporterRequest
{
    [Required]
    [StringLength(40)]
    public string SupporterType { get; set; } = string.Empty;

    [Required]
    [StringLength(160)]
    public string DisplayName { get; set; } = string.Empty;

    [StringLength(160)]
    public string? OrganizationName { get; set; }

    [StringLength(80)]
    public string? FirstName { get; set; }

    [StringLength(80)]
    public string? LastName { get; set; }

    [StringLength(40)]
    public string? RelationshipType { get; set; }

    [StringLength(80)]
    public string? Region { get; set; }

    [StringLength(80)]
    public string? Country { get; set; }

    [EmailAddress]
    [StringLength(254)]
    public string? Email { get; set; }

    [Phone]
    [StringLength(40)]
    public string? Phone { get; set; }

    [Required]
    [StringLength(20)]
    public string Status { get; set; } = "Active";

    [StringLength(64)]
    public string? AcquisitionChannel { get; set; }
}
