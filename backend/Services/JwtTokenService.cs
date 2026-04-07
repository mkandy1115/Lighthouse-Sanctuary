using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Lighthouse.Sanctuary.Api.Models;
using Microsoft.IdentityModel.Tokens;

namespace Lighthouse.Sanctuary.Api.Services;

public class JwtTokenService(IConfiguration configuration)
{
    public (string token, DateTime expiresAtUtc) CreateToken(AppUser user)
    {
        var issuer = configuration["Jwt:Issuer"] ?? "Lighthouse.Sanctuary.Api";
        var audience = configuration["Jwt:Audience"] ?? "Lighthouse.Frontend";
        var key = configuration["Jwt:Key"]
                  ?? throw new InvalidOperationException("JWT signing key is missing.");
        var lifetimeMinutes = configuration.GetValue<int?>("Jwt:TokenLifetimeMinutes") ?? 120;

        var expiresAtUtc = DateTime.UtcNow.AddMinutes(lifetimeMinutes);

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.AppUserId.ToString()),
            new(JwtRegisteredClaimNames.UniqueName, user.Username),
            new(ClaimTypes.NameIdentifier, user.AppUserId.ToString()),
            new(ClaimTypes.Name, user.Username),
            new(ClaimTypes.Role, user.Role)
        };

        var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));
        var credentials = new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: expiresAtUtc,
            signingCredentials: credentials);

        return (new JwtSecurityTokenHandler().WriteToken(token), expiresAtUtc);
    }
}
