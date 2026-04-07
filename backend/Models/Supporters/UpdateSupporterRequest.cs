namespace Lighthouse.Sanctuary.Api.Models.Supporters;

public class UpdateSupporterRequest
{
    public string DisplayName { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? SupporterType { get; set; }
    public string? RelationshipType { get; set; }
}
