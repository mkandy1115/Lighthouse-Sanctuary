using System.ComponentModel.DataAnnotations;

namespace Lighthouse.Sanctuary.Api.Models.Conferences;

public class UpdateConferenceRequest
{
    [StringLength(64)]
    public string? PlanCategory { get; set; }

    [StringLength(1000)]
    public string? PlanDescription { get; set; }

    [StringLength(200)]
    public string? ServicesProvided { get; set; }

    [Range(0, 1000000)]
    public decimal? TargetValue { get; set; }
    public DateOnly? TargetDate { get; set; }

    [StringLength(24)]
    public string? Status { get; set; }
    public DateOnly? CaseConferenceDate { get; set; }
}
