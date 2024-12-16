using MediatR;
using Microsoft.EntityFrameworkCore;
using WebApp.API.Data;
using WebApp.API.UserContext;

namespace WebApp.API.Application.Annotations.DeleteAnnotation;

public record DeleteAnnotationByIdCommand(
    Guid AnnotationId,
    Guid FileId
) : IRequest;

public class DeleteAnnotationByIdCommandHandler : IRequestHandler<DeleteAnnotationByIdCommand>
{
    private readonly ApplicationDbContext _context;
    private readonly IUserContextAccessor _userContextAccessor;

    public DeleteAnnotationByIdCommandHandler(ApplicationDbContext context, IUserContextAccessor userContextAccessor)
    {
        _context = context;
        _userContextAccessor = userContextAccessor;
    }

    public async Task<Unit> Handle(DeleteAnnotationByIdCommand request, CancellationToken cancellationToken)
    {
        var file = await _context.AudioFiles.FirstOrDefaultAsync(af => af.Id == request.FileId, cancellationToken);

        if (file == null) return Unit.Value;

        file.RemoveAnnotation(request.AnnotationId, _userContextAccessor.UserId);

        await _context.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}