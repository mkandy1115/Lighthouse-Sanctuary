namespace Lighthouse.Sanctuary.Api.Models.Residents;

public class UpdateResidentRequest
{
    public string CaseStatus { get; set; } = string.Empty;
    public string? AssignedSocialWorker { get; set; }
    public string? CurrentRiskLevel { get; set; }
    public string? ReintegrationStatus { get; set; }
    public string? ReintegrationType { get; set; }
    public string? InitialCaseAssessment { get; set; }
    public string? NotesRestricted { get; set; }
}
