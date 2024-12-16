using MediatR;
using Microsoft.EntityFrameworkCore;
using WebApp.API.Data;
using WebApp.API.UserContext;

namespace WebApp.API.Application.Annotations.ChangeAnnotationConfidence;

public record ChangeAnnotationConfidenceCommand(Guid FileId, Guid AnnotationId, int NewConfidence) : IRequest;

public class ChangeAnnotationConfidenceCommandHandler : IRequestHandler<ChangeAnnotationConfidenceCommand>
{
    private readonly ApplicationDbContext _context;
    private readonly IUserContextAccessor _userContextAccessor;

    public ChangeAnnotationConfidenceCommandHandler(
        ApplicationDbContext context,
        IUserContextAccessor userContextAccessor
    )
    {
        _context = context;
        _userContextAccessor = userContextAccessor;
    }

    public async Task<Unit> Handle(ChangeAnnotationConfidenceCommand request, CancellationToken cancellationToken)
    {
        var file = await _context.AudioFiles.FirstOrDefaultAsync(f => f.Id == request.FileId, cancellationToken);

        if (file == null)
        {
            throw new InvalidCommandException($"File with id {request.FileId} not found");
        }

        file.ChangeAnnotationConfidence(request.AnnotationId, request.NewConfidence, _userContextAccessor.UserId);

        await _context.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}