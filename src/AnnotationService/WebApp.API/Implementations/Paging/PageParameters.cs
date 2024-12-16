using System.ComponentModel;
using Microsoft.AspNetCore.Mvc;

namespace WebApp.API.Implementations.Paging;

public class PageParameters
{
    [DefaultValue(1)]
    [FromQuery(Name = "pageNumber")]
    public int PageNumber { get; set; } = 1;

    [FromQuery(Name = "pageSize")]
    [DefaultValue(10)]
    public int PageSize { get; set; } = 10;
}