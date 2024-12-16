namespace WebApp.API.Implementations.Paging;

public class XPaginationHeader
{
    public const string HeaderName = "X-Pagination";


    public XPaginationHeader(int currentPage, int totalPages, int pageSize, int totalCount, bool hasPrevious,
        bool hasNext)
    {
        CurrentPage = currentPage;
        TotalPages = totalPages;
        PageSize = pageSize;
        TotalCount = totalCount;
        HasPrevious = hasPrevious;
        HasNext = hasNext;
    }

    public int CurrentPage { get; }
    public int TotalPages { get; }
    public int PageSize { get; }
    public int TotalCount { get; }
    public bool HasPrevious { get; }
    public bool HasNext { get; }

    public static XPaginationHeader FromPagedList<T>(PagedList<T> list)
    {
        return new XPaginationHeader(
            list.CurrentPage,
            list.TotalPages,
            list.PageSize,
            list.TotalCount,
            list.HasPrevious,
            list.HasNext);
    }
}