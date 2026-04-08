using System.Text.RegularExpressions;

namespace Lighthouse.Sanctuary.Api.Services;

public static class InputSanitizer
{
    private static readonly Regex MultiWhitespace = new(@"\s{2,}", RegexOptions.Compiled);
    private static readonly Regex HtmlLike = new(@"<[^>]+>", RegexOptions.Compiled | RegexOptions.IgnoreCase);
    private static readonly Regex ScriptLike = new(@"(javascript:|on\w+\s*=|<\s*script|</\s*script)", RegexOptions.Compiled | RegexOptions.IgnoreCase);
    private static readonly Regex ControlChars = new(@"[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]", RegexOptions.Compiled);

    public static string NormalizePlainText(string? value, int maxLength, bool allowNewLines = false)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return string.Empty;
        }

        var trimmed = value.Trim();
        trimmed = ControlChars.Replace(trimmed, string.Empty);

        if (!allowNewLines)
        {
            trimmed = trimmed.Replace('\r', ' ').Replace('\n', ' ');
            trimmed = MultiWhitespace.Replace(trimmed, " ");
        }

        if (trimmed.Length > maxLength)
        {
            trimmed = trimmed[..maxLength];
        }

        return trimmed;
    }

    public static string NormalizeEmail(string? email)
    {
        return NormalizePlainText(email, 254).ToLowerInvariant();
    }

    public static bool LooksUnsafe(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return false;
        }

        return HtmlLike.IsMatch(value) || ScriptLike.IsMatch(value);
    }

    public static bool IsAllowedValue(string? value, params string[] allowed)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return false;
        }

        return allowed.Any(item => item.Equals(value, StringComparison.OrdinalIgnoreCase));
    }
}
