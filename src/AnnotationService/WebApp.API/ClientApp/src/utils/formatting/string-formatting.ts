export const formatSeconds: (seconds: number | undefined) => string = (seconds) => {
    if (seconds !== 0 && !seconds) return "-"

    const remainingSeconds = seconds % 60;
    const fullMinutes = (seconds - remainingSeconds) / 60;

    if (fullMinutes === 0) {
        return `${remainingSeconds.toFixed(2)}s`;
    } else {
        return `${fullMinutes}min ${remainingSeconds.toFixed(2)}s`
    }
}

export const formatFrequency: (frequency: number | undefined) => string = (frequency) => {
    if (frequency !== 0 && !frequency) return "-";

    const kiloHertz = frequency / 1000;

    return `${kiloHertz.toFixed(3)}kHz`


}