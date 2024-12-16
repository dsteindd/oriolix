using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using WebApp.API.Application.Classification.IntegrationEvents;
using WebApp.API.Data;
using WebApp.API.EventBus;
using WebApp.API.EventBus.Abstractions;
using WebApp.API.Models.AudioFiles;
using WebApp.API.Models.Classification;

namespace WebApp.API.Application.Classification.ClassifyFile;

public record ClassifyFileCommand(Guid FileId, Guid NetworkModelId) : IRequest<ClassificationReportDto>;

public class ClassifyFileCommandHandler : IRequestHandler<ClassifyFileCommand, ClassificationReportDto>
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;
    private readonly IEventBus _eventBus;
    private readonly INetworkModelStorage _networkModelStorage;
    private readonly IAudioFileStorage _audioFileStorage;


    public ClassifyFileCommandHandler(
        ApplicationDbContext context,
        IMapper mapper, IEventBus eventBus,
        INetworkModelStorage networkModelStorage,
        IAudioFileStorage audioFileStorage
    )
    {
        _context = context;
        _mapper = mapper;
        _eventBus = eventBus;
        _networkModelStorage = networkModelStorage;
        _audioFileStorage = audioFileStorage;
    }

    public async Task<ClassificationReportDto> Handle(ClassifyFileCommand request, CancellationToken cancellationToken)
    {
        var network = await _context.NetworkModels.FirstOrDefaultAsync(
            m => m.Id == request.NetworkModelId,
            cancellationToken
        );

        if (network == null)
        {
            throw new InvalidCommandException($"Network Model with id {request.NetworkModelId} not found");
        }

        var file = await _context.AudioFiles.FirstOrDefaultAsync(
            f => f.Id == request.FileId,
            cancellationToken);

        if (file == null)
        {
            throw new InvalidCommandException($"Audio file with id {request.FileId} not found");
        }

        var existingReport = await _context.ClassificationReports.SingleOrDefaultAsync(
            cp => cp.ClassifierId == request.NetworkModelId &&
                  cp.FileId == request.FileId,
            cancellationToken);

        if (existingReport != null)
        {
            var existingReportDto = _mapper.Map<ClassificationReportDto>(existingReport);
            return existingReportDto;
        }

        _eventBus.Publish(new ClassificationRequestedIntegrationEvent(
            network.Id,
            _networkModelStorage.GetModelUri(network.Id, network.Format),
            file.Id,
            _audioFileStorage.GetAudioFileUri(file.Id, file.Format),
            network.FrameDuration,
            network.FrameOverlap
        ));

        var report = new ClassificationReport(network.Id, file.Id);

        await _context.ClassificationReports.AddAsync(report, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);


        return _mapper.Map<ClassificationReportDto>(report);
    }
}