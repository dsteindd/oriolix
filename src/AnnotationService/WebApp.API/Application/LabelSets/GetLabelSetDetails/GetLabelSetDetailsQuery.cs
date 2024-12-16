using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using WebApp.API.Data;
using WebApp.API.UserContext;

namespace WebApp.API.Application.LabelSets.GetLabelSetDetails;

public record GetLabelSetDetailsQuery(Guid LabelSetId): IRequest<LabelSetDTO>;


public class GetLabelSetDetailsQueryHandler : IRequestHandler<GetLabelSetDetailsQuery, LabelSetDTO>
{
    private readonly ApplicationDbContext _context;
    private readonly IUserContextAccessor _userContextAccessor;
    private readonly IMapper _mapper;

    public GetLabelSetDetailsQueryHandler(
        ApplicationDbContext context,
        IUserContextAccessor userContextAccessor, IMapper mapper)
    {
        _context = context;
        _userContextAccessor = userContextAccessor;
        _mapper = mapper;
    }

    public async Task<LabelSetDTO> Handle(GetLabelSetDetailsQuery request, CancellationToken cancellationToken)
    {
        var labelSet = await _context.LabelSets.FirstOrDefaultAsync(ls => ls.Id == request.LabelSetId, cancellationToken);

        if (labelSet == null)
        {
            throw new InvalidCommandException($"Label Set with id {request.LabelSetId} not found");
        }

        if (_userContextAccessor.IsAdmin || labelSet.IsPublic || (labelSet.CreatorId == _userContextAccessor.UserId))
        {
            return _mapper.Map<LabelSetDTO>(labelSet);
        }
        
        throw new InvalidCommandException("You are not allowed to access this label set");
    }
}