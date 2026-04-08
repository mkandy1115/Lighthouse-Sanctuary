namespace Lighthouse.Sanctuary.Api.Models.Conferences;

public class CreateConferenceRequest
{
    public int ResidentId { get; set; }
    public string? PlanCategory { get; set; }
    public string PlanDescription { get; set; } = string.Empty;
    public string? ServicesProvided { get; set; }
    public decimal? TargetValue { get; set; }
    public DateOnly? TargetDate { get; set; }
    public string? Status { get; set; }
    public DateOnly CaseConferenceDate { get; set; }
}
