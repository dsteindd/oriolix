using MediatR;
using WebApp.API.Data;

namespace WebApp.API.Application.Classification.ClassifyOnline;

public record ClassifyOnlineCommand(Guid NetworkModelId, Stream AudioStream) : IRequest<ClassificationReportDto>;


public class ClassifyOnlineCommandHandler : IRequestHandler<ClassifyOnlineCommand, ClassificationReportDto>
{
    private readonly ApplicationDbContext _context;


    public ClassifyOnlineCommandHandler(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<ClassificationReportDto> Handle(ClassifyOnlineCommand request, CancellationToken cancellationToken)
    {
        throw new NotImplementedException("Classify online is not yet implemented");
    }
}