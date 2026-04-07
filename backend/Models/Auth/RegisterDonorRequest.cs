namespace Lighthouse.Sanctuary.Api.Models.Auth;

public class RegisterDonorRequest
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Country { get; set; }
    public string? Region { get; set; }
    public string? AcquisitionChannel { get; set; }
}
