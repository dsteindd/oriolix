using MediatR;
using Microsoft.EntityFrameworkCore;
using WebApp.API.Data;
using WebApp.API.Models.Annotations;
using WebApp.API.UserContext;

namespace WebApp.API.Application.Annotations.CreateAnnotation;

public record CreateAnnotationCommand(
    Guid FileId, 
    List<PolygonPointDto> Points, 
    Guid PrimaryLabelId, 
    Guid? SecondaryLabelId,
    int Confidence
    ) : IRequest;


public class CreateAnnotationCommandHandler : IRequestHandler<CreateAnnotationCommand>
{
    private readonly ApplicationDbContext _context;
    private readonly IUserContextAccessor _contextAccessor;

    public CreateAnnotationCommandHandler(ApplicationDbContext context, IUserContextAccessor contextAccessor)
    {
        _context = context;
        _contextAccessor = contextAccessor;
    }

    public async Task<Unit> Handle(CreateAnnotationCommand request, CancellationToken cancellationToken)
    {
        var file = await _context.AudioFiles.SingleOrDefaultAsync(af => af.Id == request.FileId, cancellationToken);

        if (file == null) throw new InvalidOperationException($"File with id {request.FileId} not found");

        var primary =
            await _context.Labels.SingleOrDefaultAsync(l => l.Id == request.PrimaryLabelId, cancellationToken);

        if (primary == null)
        {
            throw new InvalidCommandException($"Label with id {request.PrimaryLabelId} not found");
        }

        var primaryLabel = AnnotationLabel.New(primary.Name, primary.AltName);


        AnnotationLabel? secondaryLabel = null;
        var secondary =
            await _context.Labels.SingleOrDefaultAsync(l => l.Id == request.SecondaryLabelId, cancellationToken);

        if (secondary != null)
        {
            secondaryLabel = AnnotationLabel.New(secondary.Name, secondary.AltName);
        }
        
        file.AddAnnotation(_contextAccessor.UserId, 
            primaryLabel, 
            secondaryLabel, 
            request.Points,
            request.Confidence
            );

        await _context.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}