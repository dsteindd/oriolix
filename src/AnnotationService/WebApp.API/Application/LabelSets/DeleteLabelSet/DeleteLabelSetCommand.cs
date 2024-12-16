using MediatR;
using Microsoft.EntityFrameworkCore;
using WebApp.API.Data;
using WebApp.API.UserContext;

namespace WebApp.API.Application.LabelSets.DeleteLabelSet;

public record DeleteLabelSetCommand(Guid LabelSetId) : IRequest;


public class DeleteLabelSetCommandHandler : IRequestHandler<DeleteLabelSetCommand>
{
    private readonly ApplicationDbContext _context;
    private readonly IUserContextAccessor _userContextAccessor;

    public DeleteLabelSetCommandHandler(ApplicationDbContext context, IUserContextAccessor userContextAccessor)
    {
        _context = context;
        _userContextAccessor = userContextAccessor;
    }

    public async Task<Unit> Handle(DeleteLabelSetCommand request, CancellationToken cancellationToken)
    {
        var labelSet = await _context.LabelSets.FirstOrDefaultAsync(
            ls => ls.Id == request.LabelSetId,
            cancellationToken
        );

        if (labelSet == null)
        {
            throw new InvalidCommandException($"Label Set with id {request.LabelSetId} does not exist");
        }

        labelSet.Delete(_userContextAccessor.UserId);

        _context.Remove(labelSet);

        await _context.SaveChangesAsync(cancellationToken);

        return Unit.Value;

    }
}