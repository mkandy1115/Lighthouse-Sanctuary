namespace Lighthouse.Sanctuary.Api.Models.Donor;

public class CreateDonorDonationRequest
{
    public decimal Amount { get; set; }
    public bool IsRecurring { get; set; }
    public string? CampaignName { get; set; }
}
