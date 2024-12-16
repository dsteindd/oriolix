using MediatR;
using Microsoft.EntityFrameworkCore;
using WebApp.API.Data;
using WebApp.API.Models.Classification;
using WebApp.API.UserContext;

namespace WebApp.API.Application.Classification.DeleteNetwork;

public record DeleteNetworkCommand(Guid NetworkId) : IRequest;

public class DeleteNetworkCommandHandler : IRequestHandler<DeleteNetworkCommand>
{
    private readonly ApplicationDbContext _context;
    private readonly INetworkModelStorage _storage;
    private readonly IUserContextAccessor _userContextAccessor;

    public DeleteNetworkCommandHandler(
        ApplicationDbContext context,
        INetworkModelStorage storage,
        IUserContextAccessor userContextAccessor
    )
    {
        _context = context;
        _storage = storage;
        _userContextAccessor = userContextAccessor;
    }

    public async Task<Unit> Handle(DeleteNetworkCommand request, CancellationToken cancellationToken)
    {
        var network = await _context.NetworkModels.FirstOrDefaultAsync(
            n => n.Id == request.NetworkId,
            cancellationToken
        );

        if (network == null)
        {
            throw new InvalidCommandException($"Network with id {request.NetworkId} not found");
        }

        network.Delete(_storage, _userContextAccessor.UserId);

        _context.NetworkModels.Remove(network);

        await _context.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}