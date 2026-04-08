using System.ComponentModel.DataAnnotations;

namespace Lighthouse.Sanctuary.Api.Models.Donations;

public class CreateStaffDonationRequest
{
    [Range(1, int.MaxValue)]
    public int SupporterId { get; set; }

    [Required]
    [StringLength(40)]
    public string DonationType { get; set; } = "Monetary";
    public DateOnly DonationDate { get; set; }
    public bool IsRecurring { get; set; }

    [StringLength(120)]
    public string? CampaignName { get; set; }

    [StringLength(64)]
    public string? ChannelSource { get; set; }

    [StringLength(12)]
    public string? CurrencyCode { get; set; }

    [Range(0, 10_000_000)]
    public decimal? Amount { get; set; }

    [Range(0, 10_000_000)]
    public decimal? EstimatedValue { get; set; }

    [StringLength(32)]
    public string? ImpactUnit { get; set; }

    [StringLength(1000)]
    public string? Notes { get; set; }

    [Range(1, int.MaxValue)]
    public int SafehouseId { get; set; }

    [Required]
    [StringLength(40)]
    public string ProgramArea { get; set; } = string.Empty;

    [Range(0, 10_000_000)]
    public decimal AmountAllocated { get; set; }

    [StringLength(1000)]
    public string? AllocationNotes { get; set; }
}
