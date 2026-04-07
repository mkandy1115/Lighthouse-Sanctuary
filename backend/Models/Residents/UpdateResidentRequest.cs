namespace Lighthouse.Sanctuary.Api.Models.Residents;

public class UpdateResidentRequest
{
    public string CaseControlNo { get; set; } = string.Empty;
    public string InternalCode { get; set; } = string.Empty;
    public int SafehouseId { get; set; }
    public string CaseStatus { get; set; } = string.Empty;
    public string Sex { get; set; } = "F";
    public DateOnly DateOfBirth { get; set; }
    public DateOnly DateOfAdmission { get; set; }
    public string? CaseCategory { get; set; }
    public string? AssignedSocialWorker { get; set; }
    public string? ReferralSource { get; set; }
    public string? CurrentRiskLevel { get; set; }
    public string? InitialRiskLevel { get; set; }
    public string? InitialCaseAssessment { get; set; }
    public string? ReintegrationStatus { get; set; }
    public string? ReintegrationType { get; set; }
    public string? NotesRestricted { get; set; }
}
