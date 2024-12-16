using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using WebApp.API.Data;
using WebApp.API.UserContext;

namespace WebApp.API.Application.LabelSets.GetLabelSets;

public record GetLabelSetsQuery : IRequest<List<LabelSetDTO>>;


public class GetLabelSetsQueryHandler : IRequestHandler<GetLabelSetsQuery, List<LabelSetDTO>>
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;
    private readonly IUserContextAccessor _userContextAccessor;
    
    public GetLabelSetsQueryHandler(
        ApplicationDbContext context, 
        IMapper mapper, 
        IUserContextAccessor userContextAccessor
    )
    {
        _context = context;
        _mapper = mapper;
        _userContextAccessor = userContextAccessor;
    }

    public async Task<List<LabelSetDTO>> Handle(GetLabelSetsQuery request, CancellationToken cancellationToken)
    {
        var labelSets = await _context.LabelSets
            .Include(l => l.Labels)
            .Where(ls => ls.IsPublic || ls.CreatorId == _userContextAccessor.UserId)
            .ToListAsync(cancellationToken);

        return _mapper.Map<List<LabelSetDTO>>(labelSets, opt =>
        {
            opt.AfterMap((source, labelSetDtos) =>
            {
                foreach (var dto in labelSetDtos)
                {
                    dto.IsOwner = dto.CreatorId == _userContextAccessor.UserId;
                }
            });
        });
    }
}