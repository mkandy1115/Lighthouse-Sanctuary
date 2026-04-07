using System.Text.RegularExpressions;
using Npgsql;

namespace Lighthouse.Sanctuary.Api.Services;

public class DatabaseBootstrapper(
    IConfiguration configuration,
    IWebHostEnvironment environment,
    ILogger<DatabaseBootstrapper> logger)
{
    public async Task InitializeAsync()
    {
        var connectionString = configuration.GetConnectionString("LighthouseConnection")
            ?? throw new InvalidOperationException("Missing connection string: LighthouseConnection");

        var appBuilder = new NpgsqlConnectionStringBuilder(connectionString);
        var databaseName = appBuilder.Database;

        if (string.IsNullOrWhiteSpace(databaseName))
        {
            throw new InvalidOperationException("Database name is missing from the connection string.");
        }

        var adminBuilder = new NpgsqlConnectionStringBuilder(connectionString)
        {
            Database = "postgres"
        };

        await EnsureDatabaseExistsAsync(adminBuilder.ConnectionString, databaseName);

        var schemaPath = ResolveSqlPath(configuration["DatabaseBootstrap:SchemaFile"] ?? "../schema_postgres_supabase.sql");
        var seedPath = ResolveSqlPath(configuration["DatabaseBootstrap:SeedFile"] ?? "../seed_sample_data.sql");

        await using var connection = new NpgsqlConnection(connectionString);
        await connection.OpenAsync();

        logger.LogInformation("Applying schema from {SchemaPath}", schemaPath);
        await ExecuteSqlScriptAsync(connection, SanitizeSchemaSql(await File.ReadAllTextAsync(schemaPath)));

        logger.LogInformation("Applying seed data from {SeedPath}", seedPath);
        await ExecuteSqlScriptAsync(connection, SanitizeSeedSql(await File.ReadAllTextAsync(seedPath)));
    }

    private async Task EnsureDatabaseExistsAsync(string adminConnectionString, string databaseName)
    {
        await using var adminConnection = new NpgsqlConnection(adminConnectionString);
        await adminConnection.OpenAsync();

        await using var existsCommand = new NpgsqlCommand(
            "select 1 from pg_database where datname = @databaseName",
            adminConnection);
        existsCommand.Parameters.AddWithValue("databaseName", databaseName);

        var exists = await existsCommand.ExecuteScalarAsync();
        if (exists is not null)
        {
            logger.LogInformation("Database {DatabaseName} already exists.", databaseName);
            return;
        }

        logger.LogInformation("Creating database {DatabaseName}", databaseName);
        await using var createCommand = new NpgsqlCommand($"create database \"{databaseName}\"", adminConnection);
        await createCommand.ExecuteNonQueryAsync();
    }

    private string ResolveSqlPath(string configuredPath)
    {
        return Path.GetFullPath(Path.Combine(environment.ContentRootPath, configuredPath));
    }

    private static string SanitizeSchemaSql(string sql)
    {
        var lines = sql
            .Split('\n')
            .Where(line =>
            {
                var trimmed = line.Trim();
                return !trimmed.Equals("begin;", StringComparison.OrdinalIgnoreCase)
                       && !trimmed.Equals("commit;", StringComparison.OrdinalIgnoreCase)
                       && !trimmed.StartsWith("create database ", StringComparison.OrdinalIgnoreCase);
            });

        return string.Join('\n', lines);
    }

    private static string SanitizeSeedSql(string sql)
    {
        var lines = sql
            .Split('\n')
            .Where(line =>
            {
                var trimmed = line.Trim();
                return !trimmed.Equals("begin;", StringComparison.OrdinalIgnoreCase)
                       && !trimmed.Equals("commit;", StringComparison.OrdinalIgnoreCase);
            });

        return string.Join('\n', lines);
    }

    private static async Task ExecuteSqlScriptAsync(NpgsqlConnection connection, string sql)
    {
        var statements = Regex
            .Split(sql, @"(?<=;)\s*(?:\r?\n)+")
            .Select(statement => statement.Trim())
            .Where(statement => !string.IsNullOrWhiteSpace(statement));

        foreach (var statement in statements)
        {
            await using var command = new NpgsqlCommand(statement, connection);
            await command.ExecuteNonQueryAsync();
        }
    }
}
