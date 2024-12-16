namespace WebApp.API.Implementations.Paging;

public static class PagingExtensions
{
    public static PagedList<T> ToPagedList<T>(this IEnumerable<T> source, int pageNumber, int pageSize)
    {
        var count = source.Count();
        var items = source.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToList();
        return new PagedList<T>(items, count, pageNumber, pageSize);
    }

    public static PagedList<U> SelectPagedList<T, U>(this PagedList<T> source, Func<T, U> selector)
    {
        return new PagedList<U>(source.Select(selector), source.TotalCount, source.CurrentPage, source.PageSize);
    }
}