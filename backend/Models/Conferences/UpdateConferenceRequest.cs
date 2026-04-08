namespace Lighthouse.Sanctuary.Api.Models.Conferences;

public class UpdateConferenceRequest
{
    public string? PlanCategory { get; set; }
    public string? PlanDescription { get; set; }
    public string? ServicesProvided { get; set; }
    public decimal? TargetValue { get; set; }
    public DateOnly? TargetDate { get; set; }
    public string? Status { get; set; }
    public DateOnly? CaseConferenceDate { get; set; }
}
