using System.Globalization;
using CsvHelper.Configuration;
using WebApp.API.Application.Annotations;

namespace WebApp.API.Configuration.CsvConfiguration;

public sealed class AnnotationMap : ClassMap<AnnotationDto>
{
    public AnnotationMap()
    {
        var config = new CsvHelper.Configuration.CsvConfiguration(CultureInfo.InvariantCulture)
        {
            IgnoreReferences = true
        };

        AutoMap(config);
        Map(a => a.Points).Ignore();
    }
}