using MediatR;
using Microsoft.EntityFrameworkCore;
using WebApp.API.Data;

namespace WebApp.API.Application.Classification.EditNetworkModel;

public record EditNetworkModelCommand(
    Guid Id,
    string Name,
    string Description,
    bool IsPublic
) : IRequest;


public class EditNetworkModelCommandHandler : IRequestHandler<EditNetworkModelCommand>
{
    private ApplicationDbContext _context;

    public EditNetworkModelCommandHandler(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Unit> Handle(EditNetworkModelCommand request, CancellationToken cancellationToken)
    {
        var model = await _context.NetworkModels.SingleOrDefaultAsync(nm => nm.Id == request.Id, cancellationToken);

        if (model == null)
        {
            throw new InvalidCommandException($"Network Model with id {request.Id} not found");
        }

        model.Edit(
            request.Name,
            request.Description,
            request.IsPublic
        );

        await _context.SaveChangesAsync(cancellationToken);
        
        return Unit.Value;
    }
}