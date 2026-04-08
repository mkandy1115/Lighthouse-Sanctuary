using System.ComponentModel.DataAnnotations;

namespace Lighthouse.Sanctuary.Api.Models.Donations;

public class PublicDonationRequest
{
    [Range(1, 10_000_000)]
    public decimal Amount { get; set; }
    public bool IsRecurring { get; set; }

    [StringLength(120)]
    public string? CampaignName { get; set; }

    [EmailAddress]
    [StringLength(254)]
    public string? Email { get; set; }

    [StringLength(80)]
    public string? FirstName { get; set; }

    [StringLength(80)]
    public string? LastName { get; set; }
    public bool IsAnonymous { get; set; }

    [Range(1, int.MaxValue)]
    public int? SupporterId { get; set; }
}
