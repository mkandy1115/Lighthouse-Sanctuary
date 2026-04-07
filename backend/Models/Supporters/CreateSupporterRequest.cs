namespace Lighthouse.Sanctuary.Api.Models.Supporters;

public class CreateSupporterRequest
{
    public string SupporterType { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string? OrganizationName { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? RelationshipType { get; set; }
    public string? Region { get; set; }
    public string? Country { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string Status { get; set; } = "Active";
    public string? AcquisitionChannel { get; set; }
}
