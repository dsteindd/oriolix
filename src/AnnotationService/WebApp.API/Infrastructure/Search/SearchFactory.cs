using WebApp.API.Contracts;

namespace WebApp.API.Infrastructure.Search;

public static class SearchFactory
{
    public static ISearch GetSpeciesSearch(SearchType searchType)
    {
        if (searchType == SearchType.Contains) return GetContainsSearch();

        if (searchType == SearchType.Fuzzy) return GetFuzzySearch();

        throw new ArgumentOutOfRangeException(nameof(searchType));
    }

    private static ISearch GetContainsSearch()
    {
        return new ContainsSearch();
    }

    private static ISearch GetFuzzySearch()
    {
        return new FuzzySearch();
    }
}