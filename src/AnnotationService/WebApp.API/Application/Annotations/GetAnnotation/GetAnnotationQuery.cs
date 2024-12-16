using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using WebApp.API.Data;

namespace WebApp.API.Application.Annotations.GetAnnotation;

public record GetAnnotationQuery(Guid AnnotationId, Guid FileId) : IRequest<AnnotationDto>;


public class GetAnnotationQueryHandler : IRequestHandler<GetAnnotationQuery, AnnotationDto>
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    public GetAnnotationQueryHandler(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<AnnotationDto> Handle(GetAnnotationQuery request, CancellationToken cancellationToken)
    {
        var audioFile =
            await _context.AudioFiles
                .FirstOrDefaultAsync(af => af.Id == request.FileId, cancellationToken);

        if (audioFile == null) throw new InvalidOperationException($"File with id {request.FileId} not found");

        var annotation = audioFile.Annotations.AsQueryable()
            .SingleOrDefault(a => a.Id == request.AnnotationId);

        return _mapper.Map<AnnotationDto>(annotation);
    }
}