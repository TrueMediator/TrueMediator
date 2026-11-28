#!/usr/bin/env -S dotnet --
#:property TargetFramework=net10.0
#:property PublishAot=false

using System.Globalization;
using System.Text.Json;

if (args.Length == 1 && args[0] is "-h" or "--help")
{
    Console.WriteLine("Turn a BenchmarkDotNet full JSON export into pairwise comparisons.");
    Console.WriteLine("Usage: dotnet run --file benchmarks/compare.cs -- <report-full.json>");
    return 0;
}
if (args.Length != 1)
{
    Console.Error.WriteLine("Usage: dotnet run --file benchmarks/compare.cs -- <report-full.json>");
    return 1;
}

try
{
    using var report = JsonDocument.Parse(File.ReadAllText(args[0]));
    var groups = new Dictionary<string, List<Measurement>>(StringComparer.Ordinal);
    foreach (var row in report.RootElement.GetProperty("Benchmarks").EnumerateArray())
    {
        if (!row.TryGetProperty("Statistics", out var statistics) || statistics.ValueKind != JsonValueKind.Object ||
            !statistics.TryGetProperty("Mean", out var mean) ||
            !row.TryGetProperty("Memory", out var memory) || memory.ValueKind != JsonValueKind.Object ||
            !memory.TryGetProperty("BytesAllocatedPerOperation", out var allocated))
            throw new InvalidOperationException("Report contains failed or missing measurements; rerun the suite.");

        var method = row.GetProperty("Method").GetString() ?? "";
        var separator = method.IndexOf('_');
        if (separator < 0)
            throw new InvalidOperationException($"Expected a library_scenario method name; found '{method}'.");
        var library = method[..separator];
        var scenario = method[(separator + 1)..];
        if (!groups.TryGetValue(scenario, out var rows))
            groups[scenario] = rows = [];
        rows.Add(new Measurement(library, mean.GetDouble(), allocated.GetDouble()));
    }

    foreach (var (scenario, rows) in groups)
        if (rows.Count != 3)
            throw new InvalidOperationException($"Expected all three libraries for {scenario}; found {rows.Count}.");

    Console.WriteLine("# Pairwise benchmark comparisons\n");
    Console.WriteLine("A/B refer to the libraries in each row. Speed is inverse mean elapsed time.\n");
    Console.WriteLine("These are point estimates; inspect the original report errors before drawing conclusions.\n");
    Console.WriteLine("| Scenario | A | B | Speed | Allocations per operation |");
    Console.WriteLine("| --- | --- | --- | --- | --- |");
    foreach (var (scenario, rows) in groups)
    {
        for (var i = 0; i < rows.Count; i++)
        for (var j = i + 1; j < rows.Count; j++)
        {
            var a = rows[i];
            var b = rows[j];
            Console.WriteLine($"| {scenario} | {a.Library} | {b.Library} | {Comparison(a.Mean, b.Mean, "ns")} | {Comparison(a.Allocated, b.Allocated, "B")} |");
        }
    }
    return 0;
}
catch (Exception error)
{
    Console.Error.WriteLine(error.Message);
    return 1;
}

static string Comparison(double left, double right, string unit)
{
    if (left == right)
        return string.Create(CultureInfo.InvariantCulture, $"equal ({left:N2} {unit})");
    var winner = left < right ? "A" : "B";
    var low = Math.Min(left, right);
    var high = Math.Max(left, right);
    if (low == 0)
        return string.Create(CultureInfo.InvariantCulture, $"{winner} allocates 0 {unit}; other allocates {high:N2} {unit}");
    if (unit == "ns")
        return string.Create(CultureInfo.InvariantCulture, $"{winner}: {high / low:F2}x speed, {(1 - low / high) * 100:F1}% less time");
    return string.Create(CultureInfo.InvariantCulture, $"{winner}: {(1 - low / high) * 100:F1}% fewer bytes ({high - low:N2} B saved)");
}

record Measurement(string Library, double Mean, double Allocated);
