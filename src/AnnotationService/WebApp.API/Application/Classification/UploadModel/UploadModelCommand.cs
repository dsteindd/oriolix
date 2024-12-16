using MediatR;
using WebApp.API.Data;
using WebApp.API.Models.Classification;
using WebApp.API.UserContext;

namespace WebApp.API.Application.Classification.UploadModel;

public record UploadModelCommand(
    string Name,
    string Description,
    bool IsPublic,
    IFormFile ModelStream,
    IFormFile LabelStream,
    int FrameDuration = 2,
    int FrameOverlap = 1
) : IRequest<Guid>;

public class UploadModelCommandHandler : IRequestHandler<UploadModelCommand, Guid>
{
    private readonly ApplicationDbContext _context;
    private readonly INetworkModelStorage _modelStorage;
    private readonly IUserContextAccessor _userContextAccessor;

    public UploadModelCommandHandler(ApplicationDbContext context, IUserContextAccessor userContextAccessor,
        INetworkModelStorage modelStorage)
    {
        _context = context;
        _userContextAccessor = userContextAccessor;
        _modelStorage = modelStorage;
    }

    public async Task<Guid> Handle(UploadModelCommand request, CancellationToken cancellationToken)
    {
        ModelFormat format;

        if (request.ModelStream.FileName.EndsWith(".h5"))
        {
            format = ModelFormat.H5;
        }
        else
        {
            throw new InvalidCommandException("Only .h5 files currently supported");
        }


        var model = NetworkModel.New(
            format,
            request.Name,
            request.Description,
            request.FrameDuration,
            request.FrameOverlap,
            _modelStorage,
            request.ModelStream.OpenReadStream(),
            request.LabelStream.OpenReadStream(),
            request.IsPublic,
            _userContextAccessor.UserId
        );

        await _context.NetworkModels.AddAsync(model, cancellationToken);

        await _context.SaveChangesAsync(cancellationToken);

        return model.Id;
    }
}