namespace Lighthouse.Sanctuary.Api.Models.Donations;

public class PublicDonationResponse
{
    public int DonationId { get; set; }
    public int SupporterId { get; set; }
    public bool IsAnonymous { get; set; }
    public string Message { get; set; } = string.Empty;
}
