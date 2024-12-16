export const _padRange = (min: number, max: number, minWidth: number) => {
    const difference = minWidth - max + min;
    if (difference > 0) {
        const padding = difference / 2
        return {
            min: min - padding,
            max: max + padding
        }
    }
    return {
        min: min,
        max: max
    }
}