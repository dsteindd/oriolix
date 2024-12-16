namespace WebApp.API.Contracts;

public interface ISearch
{
    IEnumerable<T> Search<T>(IEnumerable<T> elements, string searchQuery, List<Func<T, string?>> querySelector);
}