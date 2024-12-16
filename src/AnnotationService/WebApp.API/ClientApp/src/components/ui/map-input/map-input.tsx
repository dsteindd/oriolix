import {LeafletMouseEvent} from "leaflet";
import React from "react";
import {MapContainer, Marker, TileLayer, useMapEvents} from "react-leaflet";
import {MapInputProps} from "./map-input.types";
import {defaultCoordinates} from "./map-input.constants";


export const MapInput: React.FC<MapInputProps> = ({
                                                      marker,
                                                      handleClick
}) => {
    function LocationMarker() {
        return !marker ? null : (
            <Marker position={[marker.latitude, marker.longitude!]}/>
        )
    }

    function MapHandlers(): null {
        useMapEvents({
            click(event: LeafletMouseEvent) {
                handleClick(event.latlng.lat, event.latlng.lng)
            },
        })
        return null;
    }

    return (
        <MapContainer id="map" center={defaultCoordinates} zoom={13} scrollWheelZoom={true}>
            <TileLayer
                eventHandlers={{
                    click(event: LeafletMouseEvent) {
                        handleClick(event.latlng.lat, event.latlng.lng)
                    }
                }}
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapHandlers/>
            <LocationMarker/>
        </MapContainer>
    );
}