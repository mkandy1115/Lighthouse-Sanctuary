namespace Lighthouse.Sanctuary.Api.Models.Donations;

public class PublicDonationRequest
{
    public decimal Amount { get; set; }
    public bool IsRecurring { get; set; }
    public string? CampaignName { get; set; }
    public string? Email { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public bool IsAnonymous { get; set; }
    public int? SupporterId { get; set; }
}
