namespace Lighthouse.Sanctuary.Api.Models.Auth;

public class AuthUserDto
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public int? SupporterId { get; set; }
}
