using System.Globalization;

namespace WebApp.API.Services;

public static class CountryListProvider
{
    public static IList<RegionInfo> GetRegionInfos()
    {
        return CultureInfo.GetCultures(CultureTypes.AllCultures & ~CultureTypes.NeutralCultures)
            .Select(c => new RegionInfo(c.Name))
            .DistinctBy(r => r.EnglishName)
            .OrderBy(r => r.EnglishName)
            .ToList();
    }
}