using AutoMapper;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using WebApp.API.Application.Users.GetUsers;
using WebApp.API.Data;
using WebApp.API.Implementations.Paging;
using WebApp.API.Infrastructure.Search;
using WebApp.API.Models;

namespace WebApp.API.Application.Annotations.GetFileAnnotators;

public record GetFileAnnotatorsQuery(
    Guid FileId,
    SearchParameters? SearchParameters = null,
    PageParameters? PageParameters = null
) : IRequest<PagedList<UserDto>>;


public class GetFileAnnotatorsQueryHandler : IRequestHandler<GetFileAnnotatorsQuery, PagedList<UserDto>>
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;
    private readonly UserManager<ApplicationUser> _userManager;

    public GetFileAnnotatorsQueryHandler(ApplicationDbContext context, IMapper mapper, UserManager<ApplicationUser> userManager)
    {
        _context = context;
        _mapper = mapper;
        _userManager = userManager;
    }

    public async Task<PagedList<UserDto>> Handle(GetFileAnnotatorsQuery request, CancellationToken cancellationToken)
    {
        var annotators = _context.AudioFiles
            .AsQueryable()
            .Where(af => af.Id == request.FileId)
            .SelectMany(af => af.Annotations)
            .Select(a => a.AnnotatorId)
            .Distinct()
            .ToAsyncEnumerable()
            .SelectAwait(
                async (annotatorId) =>
                {
                    if (annotatorId.HasValue)
                    {
                        return await _userManager.FindByIdAsync(annotatorId.Value.ToString());
                    }

                    return null;
                }
            )
            .OfType<ApplicationUser>()
            .ToEnumerable();

        annotators = PerformSearch(annotators, request.SearchParameters);

        var pagedAnnotators = PerformPagination(annotators, request.PageParameters);

        return pagedAnnotators.SelectPagedList(user => _mapper.Map<UserDto>(user));
    }

    private IEnumerable<ApplicationUser> PerformSearch(IEnumerable<ApplicationUser> users,
        SearchParameters searchParameters)
    {
        if (searchParameters.SearchQuery == null) return users;

        var searchMethod = SearchFactory.GetSpeciesSearch(searchParameters.SearchType);
        var rankedBirds = searchMethod.Search(
            users,
            searchParameters.SearchQuery,
            new List<Func<ApplicationUser, string?>>
            {
                user => user?.Email
            }
        );
        return rankedBirds;
    }

    private PagedList<ApplicationUser> PerformPagination(IEnumerable<ApplicationUser> users,
        PageParameters pageParameters)
    {
        var pagedUsers = users.ToPagedList(
            pageParameters.PageNumber,
            pageParameters.PageSize
        );

        return pagedUsers;
    }
}