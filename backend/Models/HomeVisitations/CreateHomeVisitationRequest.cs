using System.ComponentModel.DataAnnotations;

namespace Lighthouse.Sanctuary.Api.Models.HomeVisitations;

public class CreateHomeVisitationRequest
{
    [Range(1, int.MaxValue)]
    public int ResidentId { get; set; }
    public DateOnly VisitDate { get; set; }

    [StringLength(120)]
    public string? SocialWorker { get; set; }

    [StringLength(64)]
    public string? VisitType { get; set; }

    [StringLength(240)]
    public string? LocationVisited { get; set; }

    [StringLength(240)]
    public string? FamilyMembersPresent { get; set; }

    [StringLength(500)]
    public string? Purpose { get; set; }

    [StringLength(4000)]
    public string? Observations { get; set; }

    [StringLength(40)]
    public string? FamilyCooperationLevel { get; set; }
    public bool SafetyConcernsNoted { get; set; }
    public bool FollowUpNeeded { get; set; }
    [StringLength(2000)]
    public string? FollowUpNotes { get; set; }

    [StringLength(40)]
    public string? VisitOutcome { get; set; }
}
