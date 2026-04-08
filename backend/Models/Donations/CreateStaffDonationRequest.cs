namespace Lighthouse.Sanctuary.Api.Models.Donations;

public class CreateStaffDonationRequest
{
    public int SupporterId { get; set; }
    public string DonationType { get; set; } = "Monetary";
    public DateOnly DonationDate { get; set; }
    public bool IsRecurring { get; set; }
    public string? CampaignName { get; set; }
    public string? ChannelSource { get; set; }
    public string? CurrencyCode { get; set; }
    public decimal? Amount { get; set; }
    public decimal? EstimatedValue { get; set; }
    public string? ImpactUnit { get; set; }
    public string? Notes { get; set; }

    public int SafehouseId { get; set; }
    public string ProgramArea { get; set; } = string.Empty;
    public decimal AmountAllocated { get; set; }
    public string? AllocationNotes { get; set; }
}
