namespace Lighthouse.Sanctuary.Api.Models.Auth;

public class LoginResponse
{
    public string Token { get; set; } = string.Empty;
    public DateTime ExpiresAtUtc { get; set; }
    public AuthUserDto User { get; set; } = new();
}
