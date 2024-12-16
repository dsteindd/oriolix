export type MarkerLocation = {
    latitude: number,
    longitude: number
}

export type MapInputProps = {
    marker?: MarkerLocation,
    handleClick: (latitude: number, longitude: number) => void
}