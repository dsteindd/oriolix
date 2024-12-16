using AutoMapper;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using WebApp.API.Application.Users.GetUsers;
using WebApp.API.Data;
using WebApp.API.Models;
using WebApp.API.Models.Annotations;
using WebApp.API.UserContext;

namespace WebApp.API.Application.Annotations.GetFileAnnotations;

public record GetFileAnnotationsQuery(
    Guid ProjectId,
    Guid FileId,
    string? SpeciesQuery = null,
    Guid? AnnotatorId = null
) : IRequest<List<AnnotationDto>>;

public class GetFileAnnotationsQueryHandler : IRequestHandler<GetFileAnnotationsQuery, List<AnnotationDto>>
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;
    private readonly IUserContextAccessor _userContextAccessor;
    private readonly UserManager<ApplicationUser> _userManager;

    public GetFileAnnotationsQueryHandler(
        ApplicationDbContext context,
        IMapper mapper,
        IUserContextAccessor userContextAccessor,
        UserManager<ApplicationUser> userManager
    )
    {
        _context = context;
        _mapper = mapper;
        _userContextAccessor = userContextAccessor;
        _userManager = userManager;
    }

    public async Task<List<AnnotationDto>> Handle(GetFileAnnotationsQuery request, CancellationToken cancellationToken)
    {
        var project = await _context.Projects
            .Include(p => p.Files)
            .FirstOrDefaultAsync(p => p.Id == request.ProjectId, cancellationToken);

        if (project == null)
        {
            throw new InvalidCommandException($"Project with id {request.ProjectId} not found");
        }

        var file = project.Files.FirstOrDefault(f => f.Id == request.FileId);

        if (file == null)
        {
            throw new InvalidCommandException($"File with id {request.FileId} not found");
        }

        Func<Annotation, bool> filterPredicate = a => true;


        if (request.AnnotatorId.HasValue && request.SpeciesQuery != null)
            filterPredicate = a => a.AnnotatorId == request.AnnotatorId &&
                                   a.Primary.Name.StartsWith(request.SpeciesQuery);
        else if (request.AnnotatorId.HasValue)
            filterPredicate = a => a.AnnotatorId == request.AnnotatorId;
        else if (request.SpeciesQuery != null) filterPredicate = a => a.Primary.Name.StartsWith(request.SpeciesQuery);


        var annotations = file.Annotations.Where(filterPredicate);

        var annotationDtos = await annotations
            .ToAsyncEnumerable()
            .SelectAwait(async (a) =>
            {
                var dto = _mapper.Map<AnnotationDto>(a);

                var user = await _userManager.FindByIdAsync(a.AnnotatorId.ToString());
                
                dto.AnnotatorFullName = user.FullName;

                dto.IsOwned = _userContextAccessor.UserId == a.AnnotatorId;

                return dto;
            })
            .ToListAsync(cancellationToken);

        return annotationDtos;
    }
}