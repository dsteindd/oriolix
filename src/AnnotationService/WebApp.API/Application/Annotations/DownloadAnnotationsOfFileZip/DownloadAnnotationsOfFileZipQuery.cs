using System.IO.Compression;
using AutoMapper;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using WebApp.API.Application.Annotations.DownloadAnnotationsZip;
using WebApp.API.Data;
using WebApp.API.Extensions;
using WebApp.API.Models;
using WebApp.API.Models.AudioFiles;

namespace WebApp.API.Application.Annotations.DownloadAnnotationsOfFileZip;

public record DownloadAnnotationsOfFileZipQuery(Guid FileId) : IRequest<ZipResult?>;

public class DownloadAnnotationsOfFileZipQueryHandler : IRequestHandler<DownloadAnnotationsOfFileZipQuery, ZipResult?>
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;
    private readonly IAudioFileStorage _audioFileStorage;
    private readonly UserManager<ApplicationUser> _userManager;

    public DownloadAnnotationsOfFileZipQueryHandler(
        ApplicationDbContext context,
        IMapper mapper,
        IAudioFileStorage audioFileStorage, UserManager<ApplicationUser> userManager)
    {
        _context = context;
        _mapper = mapper;
        _audioFileStorage = audioFileStorage;
        _userManager = userManager;
    }

    public async Task<ZipResult?> Handle(DownloadAnnotationsOfFileZipQuery request, CancellationToken cancellationToken)
    {
        var audioFile = await _context.AudioFiles
            .Include(af => af.Annotations)
            .AsNoTracking()
            .AsSplitQuery()
            .SingleOrDefaultAsync(
                af => af.Id == request.FileId,
                cancellationToken
            );

        if (audioFile == null) throw new InvalidCommandException($"Audio File with id {request.FileId} not found");

        if (audioFile.Annotations.Count == 0)
        {
            return null;
        }

        var annotationDtos = await _mapper.Map<List<AnnotationExportDto>>(audioFile.Annotations)
            .ToAsyncEnumerable()
            .SelectAwait(async (dto) =>
            {
                dto.FileName = audioFile.Name;
                var user = await _userManager.FindByIdAsync(dto.AnnotatorId.ToString());
                dto.AnnotatorName = user.FullName;
                return dto;
            })
            .ToListAsync(cancellationToken);

        var zipStream = new MemoryStream();

        using (var zip = new ZipArchive(zipStream, ZipArchiveMode.Create, true))
        {

            await zip.AddAudioFileEntry(
                audioFile,
                annotationDtos,
                _audioFileStorage,
                cancellationToken,
                shouldAppendAudioFile:true
            );
        }

        zipStream.Position = 0;

        return new ZipResult(zipStream, GetZipFileName(audioFile.Name));
    }

    private string GetZipFileName(string audioFileName)
    {
        var audioFileNameWithoutExt = audioFileName.Split(".")[0];

        return audioFileNameWithoutExt + "_annotations.zip";
    }
}