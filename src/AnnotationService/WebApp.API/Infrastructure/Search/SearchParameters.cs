using System.ComponentModel;
using Microsoft.AspNetCore.Mvc;

namespace WebApp.API.Infrastructure.Search;

public class SearchParameters
{
    [DefaultValue(null)]
    [FromQuery(Name = "searchQuery")]
    public string? SearchQuery { get; set; }

    [DefaultValue(nameof(SearchType.Contains))]
    [FromQuery(Name = "searchType")]
    public SearchType SearchType { get; set; } = SearchType.Contains;
}

public enum SearchType
{
    Contains,
    Fuzzy
}