using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using WebApp.API.Data;

namespace WebApp.API.Application.Classification.GetClassificationReport;

public record GetClassificationReportQuery(Guid reportId) : IRequest<ClassificationReportDto>;

public class GetClassificationReportQueryHandler : IRequestHandler<GetClassificationReportQuery, ClassificationReportDto>
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    public GetClassificationReportQueryHandler(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<ClassificationReportDto> Handle(
        GetClassificationReportQuery request, 
        CancellationToken cancellationToken)
    {
        var report = await _context
            .ClassificationReports
            .FirstOrDefaultAsync(r => r.Id == request.reportId, cancellationToken);

        if (report == null)
        {
            throw new InvalidCommandException($"Report with id {request.reportId} not found");
        }

        return _mapper.Map<ClassificationReportDto>(report);
    }
}
