using AutoMapper;
using WebApp.API.Application.Annotations;
using WebApp.API.Application.Annotations.DownloadAnnotationsZip;
using WebApp.API.Application.Classification;
using WebApp.API.Application.Files.GetAudioFiles;
using WebApp.API.Application.LabelSets;
using WebApp.API.Application.Projects;
using WebApp.API.Application.Users.GetUsers;
using WebApp.API.CsvModels;
using WebApp.API.Models;
using WebApp.API.Models.Annotations;
using WebApp.API.Models.AudioFiles;
using WebApp.API.Models.Classification;
using WebApp.API.Models.LabelSets;
using WebApp.API.Models.Projects;

namespace WebApp.API.Infrastructure.Mapping.Mapping;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<AudioFile, AudioFileDto>()
            .ForMember(dto => dto.NumAnnotations, opt => opt.MapFrom(e => e.Annotations.Count));
        
        CreateMap<Annotation, AnnotationDto>()
            .ForMember(a => a.Points, opt =>
                opt.MapFrom(a => a.Points.OrderBy(p => p.Index)))
            .ForMember(a => a.PrimaryLabel, opt => 
                opt.MapFrom(a => a.Primary))
            .ForMember(a => a.SecondaryLabel, opt => 
                opt.MapFrom(a => a.Secondary));

        CreateMap<Annotation, AnnotationExportDto>()
            .ForMember(a => a.Times, opt =>
                opt.MapFrom(a => a.Points.OrderBy(p => p.Index).Select(p => p.Time)))
            .ForMember(a => a.Frequencies, opt =>
                opt.MapFrom(a => a.Points.OrderBy(p => p.Index).Select(p => p.Frequency)));
        CreateMap<AnnotationLabel, AnnotationLabelDTO>();
        
        CreateMap<PolygonPoint, PolygonPointDto>();

        CreateMap<PolygonPoint, CsvPolygonPointModel>();

        CreateMap<ApplicationUser, UserDto>()
            .ForMember(dto => dto.Mail, opt => opt.MapFrom(u => u.Email));

        CreateMap<NetworkModel, NetworkModelDto>()
            .ForMember(n => n.NumberOfLabels, opt => 
                opt.MapFrom(n => n.Labels.Count));

        CreateMap<ClassificationReport, ClassificationReportDto>();
        CreateMap<Classification, ClassificationDto>();

        CreateMap<Project, ProjectDTO>();

        CreateMap<LabelSet, LabelSetDTO>();
        CreateMap<Label, LabelDTO>();
        CreateMap<Project, ProjectLabelsDTO>()
            .ForMember(dto => dto.Primary, opt =>
                opt.MapFrom(p => p.PrimaryLabelSet.Labels))
            .ForMember(dto => dto.Secondary, opt =>
                opt.MapFrom(p => p.SecondaryLabelSet.Labels));
    }
}