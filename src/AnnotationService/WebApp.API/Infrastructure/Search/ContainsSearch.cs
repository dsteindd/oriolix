using WebApp.API.Contracts;

namespace WebApp.API.Infrastructure.Search;

public class ContainsSearch : ISearch
{
    public IEnumerable<T> Search<T>(IEnumerable<T> elements, string searchQuery,
        List<Func<T, string?>> querySelector)
    {
        return elements.Where(e =>
            querySelector.Any(selector => selector(e)?.Contains(searchQuery) ?? false));
    }
}