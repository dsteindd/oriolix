using System.IO.Compression;
using AutoMapper;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using WebApp.API.Application.Annotations.DownloadAnnotationsOfFileZip;
using WebApp.API.Data;
using WebApp.API.Extensions;
using WebApp.API.Models;
using WebApp.API.Models.AudioFiles;

namespace WebApp.API.Application.Annotations.DownloadAnnotationsZip;

public record DownloadAnnotationsOfProjectZipQuery(
    Guid ProjectId
) : IRequest<ZipResult?>;

public class DownloadAnnotationsOfProjectZipQueryHandler : IRequestHandler<DownloadAnnotationsOfProjectZipQuery, ZipResult?>
{
    private readonly ApplicationDbContext _context;
    private readonly IAudioFileStorage _audioFileStorage;
    private readonly IMapper _mapper;
    private readonly UserManager<ApplicationUser> _userManager;

    public DownloadAnnotationsOfProjectZipQueryHandler(
        ApplicationDbContext context,
        IMapper mapper,
        IAudioFileStorage audioFileStorage,
        UserManager<ApplicationUser> userManager
    )
    {
        _context = context;
        _mapper = mapper;
        _audioFileStorage = audioFileStorage;
        _userManager = userManager;
    }


    public async Task<ZipResult?> Handle(DownloadAnnotationsOfProjectZipQuery request, CancellationToken cancellationToken)
    {
        var project = await _context.Projects
            .Include(p => p.Files)
            .FirstOrDefaultAsync(p => p.Id == request.ProjectId, cancellationToken);

        if (project == null)
        {
            throw new InvalidCommandException($"Project with id {request.ProjectId} does not exist");
        }

        var annotations = project.Files
            .SelectMany(af => af.Annotations)
            .ToList();


        // var annotations = await _context.AudioFiles
        //     .Where(af => af.ProjectId == request.ProjectId)
        //     .SelectMany(af => af.Annotations)
        //     .Include(annotation => annotation.File)
        //     .Include(annotation => annotation.Species)
        //     .ThenInclude(s => s.Family)
        //     .AsNoTrackingWithIdentityResolution()
        //     .AsSplitQuery()
        //     .ToListAsync(cancellationToken);

        if (!annotations.Any())
        {
            return null;
        }

        // group by file id
        var fileGroupings = annotations.GroupBy(
            a => a.File,
            a => a,
            new AudioFileComparer()
        );

        var zipStream = new MemoryStream();

        using (var zip = new ZipArchive(zipStream, ZipArchiveMode.Create, true))
        {
            foreach (var fileAnnotationGroup in fileGroupings)
            {
                var file = fileAnnotationGroup.Key;
                var annotationDtos = await _mapper.Map<List<AnnotationExportDto>>(fileAnnotationGroup)
                    .ToAsyncEnumerable()
                    .SelectAwait(async (dto) =>
                    {
                        var user = await _userManager.FindByIdAsync(dto.AnnotatorId.ToString());
                        dto.AnnotatorName = user.FullName;

                        return dto;
                    })
                    .ToListAsync(cancellationToken);

                await zip.AddAudioFileEntry(
                    file,
                    annotationDtos,
                    _audioFileStorage,
                    cancellationToken,
                    shouldAppendAudioFile: false,
                    baseKey: $"{fileAnnotationGroup.Key.Name}"
                );
            }
        }

        zipStream.Seek(0, SeekOrigin.Begin);

        return new ZipResult(zipStream, $"{project.Name}_annotations.zip");
    }

    private sealed class AudioFileComparer : IEqualityComparer<AudioFile>
    {
        public bool Equals(AudioFile? x, AudioFile? y)
        {
            if (ReferenceEquals(x, y)) return true;
            if (ReferenceEquals(x, null)) return false;
            if (ReferenceEquals(y, null)) return false;
            if (x.GetType() != y.GetType()) return false;
            return x.Id.Equals(y.Id);
        }

        public int GetHashCode(AudioFile obj)
        {
            return obj.Id.GetHashCode();
        }
    }
}