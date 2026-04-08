using System.ComponentModel.DataAnnotations;

namespace Lighthouse.Sanctuary.Api.Models.Conferences;

public class CreateConferenceRequest
{
    [Range(1, int.MaxValue)]
    public int ResidentId { get; set; }

    [StringLength(64)]
    public string? PlanCategory { get; set; }

    [Required]
    [StringLength(1000)]
    public string PlanDescription { get; set; } = string.Empty;

    [StringLength(200)]
    public string? ServicesProvided { get; set; }

    [Range(0, 1000000)]
    public decimal? TargetValue { get; set; }
    public DateOnly? TargetDate { get; set; }

    [StringLength(24)]
    public string? Status { get; set; }
    public DateOnly CaseConferenceDate { get; set; }
}
