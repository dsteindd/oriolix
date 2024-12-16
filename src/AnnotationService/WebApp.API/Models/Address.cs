using Microsoft.AspNetCore.Identity;

namespace WebApp.API.Models;

public class Address
{
    private Address()
    {
        // Only EF
    }

    private Address(
        string street,
        int? houseNumber,
        string postalCode,
        string country
    )
    {
        Street = street;
        HouseNumber = houseNumber;
        PostalCode = postalCode;
        Country = country;
    }

    [ProtectedPersonalData] 
    public string Street { get; } = null!;
    [ProtectedPersonalData] 
    public int? HouseNumber { get; }
    [ProtectedPersonalData] 
    public string PostalCode { get; } = null!;
    [ProtectedPersonalData] 
    public string Country { get; } = null!;

    public static Address NewAddress(string street, int? houseNumber, string postalCode, string country)
    {
        return new Address(
            street,
            houseNumber,
            postalCode,
            country
        );
    }
}