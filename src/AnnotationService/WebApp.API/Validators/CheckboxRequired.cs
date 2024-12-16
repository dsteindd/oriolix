using System.ComponentModel.DataAnnotations;

namespace WebApp.API.Validators;

public class CheckboxRequired : ValidationAttribute
{
    protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
    {
        if (value is not bool castValue)
            throw new InvalidOperationException($"{nameof(CheckboxRequired)} should only be used on boolean variables");

        if (!castValue)
            //if not checked the checkbox, return the error message.
            return new ValidationResult(ErrorMessage ?? "Please checked the checkbox");
        return ValidationResult.Success;
    }
}