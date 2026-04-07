namespace Lighthouse.Sanctuary.Api.Models.Supporters;

public class TopDonorDto
{
    public int SupporterId { get; set; }
    public string DisplayName { get; set; } = string.Empty;
    public string? Email { get; set; }
    public decimal TotalGiven { get; set; }
    public int DonationCount { get; set; }
}
