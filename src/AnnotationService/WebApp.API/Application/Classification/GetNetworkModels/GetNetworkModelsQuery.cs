using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using WebApp.API.Data;
using WebApp.API.UserContext;

namespace WebApp.API.Application.Classification.GetNetworkModels;

public record GetNetworkModelsQuery : IRequest<List<NetworkModelDto>>;


public class GetNetworkModelsQueryHandler : IRequestHandler<GetNetworkModelsQuery, List<NetworkModelDto>>
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;
    private readonly IUserContextAccessor _userContextAccessor;
    
    
    public GetNetworkModelsQueryHandler(ApplicationDbContext context, IMapper mapper, IUserContextAccessor userContextAccessor)
    {
        _context = context;
        _mapper = mapper;
        _userContextAccessor = userContextAccessor;
    }

    public async Task<List<NetworkModelDto>> Handle(GetNetworkModelsQuery request, CancellationToken cancellationToken)
    {
        var models = await _context.NetworkModels
            .Where(nm => nm.CreatorId == _userContextAccessor.UserId || nm.IsPublic)
            .ToListAsync(cancellationToken);

        return _mapper.Map<List<NetworkModelDto>>(models, opt => 
            opt.AfterMap((source, modelDtos) =>
            {
                foreach (var modelDto in modelDtos)
                {
                    modelDto.IsOwner = modelDto.CreatorId == _userContextAccessor.UserId;
                }
            }));
    }
}