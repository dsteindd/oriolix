namespace WebApp.API.Implementations.Paging;

public class PaginationResult<T>
{
    public IEnumerable<T> Results { get; init; } = new List<T>();

    public XPaginationHeader PaginationHeader { get; init; } = null!;
}