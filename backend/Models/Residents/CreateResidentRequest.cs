using System.ComponentModel.DataAnnotations;

namespace Lighthouse.Sanctuary.Api.Models.Residents;

public class CreateResidentRequest
{
    [Required]
    [StringLength(32)]
    public string CaseControlNo { get; set; } = string.Empty;

    [Required]
    [StringLength(32)]
    public string InternalCode { get; set; } = string.Empty;

    [Range(1, int.MaxValue)]
    public int SafehouseId { get; set; }

    [Required]
    [StringLength(24)]
    public string CaseStatus { get; set; } = "Active";

    [Required]
    [StringLength(8)]
    public string Sex { get; set; } = "F";
    public DateOnly DateOfBirth { get; set; }
    public DateOnly DateOfAdmission { get; set; }

    [StringLength(64)]
    public string? CaseCategory { get; set; }

    [StringLength(120)]
    public string? AssignedSocialWorker { get; set; }

    [StringLength(80)]
    public string? ReferralSource { get; set; }

    [StringLength(24)]
    public string? CurrentRiskLevel { get; set; }

    [StringLength(500)]
    public string? InitialCaseAssessment { get; set; }
    public bool SubCatTrafficked { get; set; }
    public bool SubCatPhysicalAbuse { get; set; }
    public bool SubCatSexualAbuse { get; set; }
    public bool SubCatAtRisk { get; set; }
    public bool IsPwd { get; set; }
    [StringLength(80)]
    public string? PwdType { get; set; }
    public bool HasSpecialNeeds { get; set; }
    [StringLength(200)]
    public string? SpecialNeedsDiagnosis { get; set; }
    public bool FamilyIs4Ps { get; set; }
    public bool FamilySoloParent { get; set; }
    public bool FamilyIndigenous { get; set; }
    public bool FamilyInformalSettler { get; set; }
}
