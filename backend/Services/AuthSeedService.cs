using Lighthouse.Sanctuary.Api.Data;
using Lighthouse.Sanctuary.Api.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Lighthouse.Sanctuary.Api.Services;

public class AuthSeedService(
    IConfiguration configuration,
    LighthouseContext context,
    IPasswordHasher<AppUser> passwordHasher,
    ILogger<AuthSeedService> logger)
{
    public async Task SeedAsync()
    {
        var enabled = configuration.GetValue<bool?>("AuthSeed:Enabled") ?? true;
        if (!enabled)
        {
            logger.LogInformation("Auth user seeding disabled.");
            return;
        }

        var users = configuration.GetSection("AuthSeed:Users").Get<List<SeedUser>>() ?? [];
        if (users.Count == 0)
        {
            logger.LogInformation("No auth seed users configured.");
            return;
        }

        foreach (var seedUser in users)
        {
            var existingUser = await context.AppUsers
                .FirstOrDefaultAsync(user => user.Username.ToLower() == seedUser.Username.ToLower());

            if (existingUser is not null)
            {
                continue;
            }

            int? supporterId = null;
            if (seedUser.Role.Equals("Donor", StringComparison.OrdinalIgnoreCase)
                && !string.IsNullOrWhiteSpace(seedUser.Email))
            {
                supporterId = await context.Supporters
                    .Where(supporter => supporter.Email != null && supporter.Email.ToLower() == seedUser.Email.ToLower())
                    .Select(supporter => (int?)supporter.SupporterId)
                    .FirstOrDefaultAsync();
            }

            var appUser = new AppUser
            {
                Username = seedUser.Username,
                DisplayName = seedUser.DisplayName,
                Email = seedUser.Email,
                SupporterId = supporterId,
                Role = seedUser.Role,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            appUser.PasswordHash = passwordHasher.HashPassword(appUser, seedUser.Password);

            context.AppUsers.Add(appUser);
            logger.LogInformation("Seeding auth user {Username} with role {Role}.", seedUser.Username, seedUser.Role);
        }

        await context.SaveChangesAsync();
    }

    private sealed class SeedUser
    {
        public string Username { get; set; } = string.Empty;
        public string DisplayName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
    }
}
