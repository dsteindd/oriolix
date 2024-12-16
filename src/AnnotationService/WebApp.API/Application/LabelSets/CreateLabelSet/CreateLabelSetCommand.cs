using MediatR;
using WebApp.API.Data;
using WebApp.API.Models.LabelSets;
using WebApp.API.UserContext;

namespace WebApp.API.Application.LabelSets.CreateLabelSet;

public record CreateLabelSetCommand(
    string Name,
    string Description,
    bool IsPublic,
    List<string> LabelNames,
    List<string> LabelAltNames
) : IRequest<Guid>;


public class CreateLabelSetCommandHandler : IRequestHandler<CreateLabelSetCommand, Guid>
{
    private readonly ApplicationDbContext _context;
    private readonly IUserContextAccessor _userContextAccessor;

    public CreateLabelSetCommandHandler(ApplicationDbContext context, IUserContextAccessor userContextAccessor)
    {
        _context = context;
        _userContextAccessor = userContextAccessor;
    }

    public async Task<Guid> Handle(CreateLabelSetCommand request, CancellationToken cancellationToken)
    {
        var labelSet = LabelSet.New(request.Name, request.Description, request.IsPublic, _userContextAccessor.UserId);

        for (var index = 0; index < request.LabelNames.Count; index++)
        {
            var labelName = request.LabelNames[index];
            var labelAltName = request.LabelAltNames.ElementAtOrDefault(index);
            if (string.IsNullOrEmpty(labelAltName))
            {
                labelAltName = null;
            }
            labelSet.AddLabel(labelName, labelAltName);
        }

        await _context.LabelSets.AddAsync(labelSet, cancellationToken);

        await _context.SaveChangesAsync(cancellationToken);
        
        return labelSet.Id;
    }
}