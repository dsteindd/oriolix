export const interpolate = (value: number, minValue: number, maxValue: number, newMinValue: number, newMaxValue: number) => {
    return (newMaxValue - newMinValue) * (value - minValue) / (maxValue - minValue) + newMinValue;
}