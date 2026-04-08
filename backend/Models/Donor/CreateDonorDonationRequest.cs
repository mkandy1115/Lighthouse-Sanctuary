using System.ComponentModel.DataAnnotations;

namespace Lighthouse.Sanctuary.Api.Models.Donor;

public class CreateDonorDonationRequest
{
    [Range(1, 10_000_000)]
    public decimal Amount { get; set; }
    public bool IsRecurring { get; set; }

    [StringLength(120)]
    public string? CampaignName { get; set; }
}
