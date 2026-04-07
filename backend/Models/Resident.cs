using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Lighthouse.Sanctuary.Api.Models;

[Table("residents")]
public class Resident
{
    [Key]
    [Column("resident_id")]
    public int ResidentId { get; set; }

    [Column("case_control_no")]
    public string CaseControlNo { get; set; } = string.Empty;

    [Column("internal_code")]
    public string InternalCode { get; set; } = string.Empty;

    [Column("safehouse_id")]
    public int SafehouseId { get; set; }

    [Column("case_status")]
    public string CaseStatus { get; set; } = string.Empty;

    [Column("sex")]
    public string Sex { get; set; } = string.Empty;

    [Column("date_of_birth")]
    public DateOnly DateOfBirth { get; set; }

    [Column("date_of_admission")]
    public DateOnly DateOfAdmission { get; set; }

    [Column("assigned_social_worker")]
    public string? AssignedSocialWorker { get; set; }

    [Column("reintegration_type")]
    public string? ReintegrationType { get; set; }

    [Column("reintegration_status")]
    public string? ReintegrationStatus { get; set; }

    [Column("initial_risk_level")]
    public string? InitialRiskLevel { get; set; }

    [Column("current_risk_level")]
    public string? CurrentRiskLevel { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }

    [Column("notes_restricted")]
    public string? NotesRestricted { get; set; }
}
