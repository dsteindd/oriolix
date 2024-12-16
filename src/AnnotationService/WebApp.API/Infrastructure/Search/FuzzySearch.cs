using FuzzySharp;
using FuzzySharp.Extractor;
using FuzzySharp.PreProcess;
using WebApp.API.Contracts;

namespace WebApp.API.Infrastructure.Search;

public class FuzzySearch : ISearch
{
    private const int CutOff = 75;

    public IEnumerable<T> Search<T>(IEnumerable<T> elements, string searchQuery, List<Func<T, string?>> querySelectors)
    {
        var ranked = elements
            .Select((e, index) =>
            {
                var highestScore = GetMaxScore(e, querySelectors, searchQuery);

                return new ExtractedResult<T>(e, highestScore, index);
            })
            .Where(result => result.Score >= CutOff)
            .OrderByDescending(result => result.Score)
            .Select(result => result.Value);
        return ranked;
    }

    private int GetMaxScore<T>(T element, List<Func<T, string?>> selectors, string searchQuery)
    {
        var highestScore = selectors
            .Select(selector => Fuzz.WeightedRatio(selector(element) ?? "", searchQuery, PreprocessMode.Full))
            .Max();

        return highestScore;
    }
}