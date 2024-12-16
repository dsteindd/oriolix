using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using WebApp.API.Data;

namespace WebApp.API.Application.Classification.GetNetworkModel;

public record GetNetworkModelQuery(Guid ModelId) : IRequest<NetworkModelDto>;


public class GetNetworkModelQueryHandler : IRequestHandler<GetNetworkModelQuery, NetworkModelDto>
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    public GetNetworkModelQueryHandler(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<NetworkModelDto> Handle(GetNetworkModelQuery request, CancellationToken cancellationToken)
    {
        var model = await _context.NetworkModels.SingleOrDefaultAsync(
            nm => nm.Id == request.ModelId,
            cancellationToken
        );

        if (model == null)
        {
            throw new InvalidCommandException($"Network Model with id {request.ModelId} not found");
        }

        return _mapper.Map<NetworkModelDto>(model);
    }
}