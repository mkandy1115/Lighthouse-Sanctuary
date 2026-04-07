namespace Lighthouse.Sanctuary.Api.Models.Auth;

public class RegisterExistingDonorRequest
{
    public int SupporterId { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}
