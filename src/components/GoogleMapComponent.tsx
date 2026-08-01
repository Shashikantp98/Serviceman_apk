import React, { useRef, useEffect, useState } from "react";
import {
  GoogleMap,
  Marker,
  useLoadScript,
  Autocomplete,
} from "@react-google-maps/api";
import { GOOGLE_API_KEY } from "../config";
import { Geolocation } from "@capacitor/geolocation";

type Props = {
  location: { lat: number; lng: number } | null;
  setLocation: (loc: { lat: number; lng: number }) => void;
  setAddress: (address: {
    street_1: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  }) => void;
  mapHeight?: string;
};

const GoogleMapComponent: React.FC<Props> = ({
  location,
  setLocation,
  setAddress,
  mapHeight,
}) => {
  const containerStyle = {
    width: "100%",
    height: mapHeight || "50vh",
  };

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: GOOGLE_API_KEY,
    libraries: ["places"],
  });

  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);

  // 🧭 Fetch current location and reverse geocode on load — only if no location is already provided
  useEffect(() => {
    const fetchCurrentLocation = async () => {
      // If location is already passed from parent, no need to fetch again
      if (location || !isLoaded) return;

      try {
        setLoadingLocation(true);

        // Check permission state first to avoid redundant dialogs
        let permissionStatus: { location: string; coarseLocation?: string };
        try {
          permissionStatus = await Geolocation.checkPermissions();
        } catch {
          permissionStatus = { location: "prompt" };
        }

        if (permissionStatus.location !== "granted") {
          try {
            permissionStatus = await Geolocation.requestPermissions();
          } catch (err) {
            console.warn("Permission request failed:", err);
            alert("Please enable location permissions in your device settings to use this feature.");
            setLoadingLocation(false);
            return;
          }
        }

        if (permissionStatus.location !== "granted") {
          console.warn("Location permission not granted:", permissionStatus.location);
          alert("Please enable location permissions in your device settings to use this feature.");
          setLoadingLocation(false);
          return;
        }

        const coordinates = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 20000,
          maximumAge: 0,
        });
        const lat = coordinates.coords.latitude;
        const lng = coordinates.coords.longitude;
        setLocation({ lat, lng });

        // 🧠 Reverse geocode to get address text
        if (typeof google !== "undefined" && google.maps && google.maps.Geocoder) {
          const geocoder = new google.maps.Geocoder();
          geocoder.geocode({ location: { lat, lng } }, (results, status) => {
            if (status === "OK" && results && results[0]) {
              const address = results[0].formatted_address;
              if (inputRef.current) inputRef.current.value = address;

              const components = results[0].address_components || [];
              const getComponent = (types: string[]) =>
                components.find((c) => types.some((t) => c.types.includes(t)))?.long_name || "";

              setAddress({
                street_1: results[0].formatted_address || components[0]?.long_name || "",
                city:
                  getComponent(["locality"]) ||
                  getComponent(["sublocality", "sublocality_level_1"]) ||
                  getComponent(["administrative_area_level_2"]),
                state: getComponent(["administrative_area_level_1"]),
                zip: getComponent(["postal_code"]),
                country: getComponent(["country"]),
              });
            }
          });
        }
      } catch (error) {
        console.error("Error fetching location:", error);
        alert("Unable to get your current location. Please check your location settings.");
      } finally {
        setLoadingLocation(false);
      }
    };

    fetchCurrentLocation();
  }, [setLocation, setAddress, isLoaded]);

  const handlePlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      if (place.geometry?.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        setLocation({ lat, lng });
        inputRef.current!.value = place.formatted_address || "";

        const components = place.address_components || [];
        const getComponent = (types: string[]) =>
          components.find((c) => types.some((t) => c.types.includes(t)))?.long_name || "";

        setAddress({
          street_1: place.formatted_address || components[0]?.long_name || "",
          city:
            getComponent(["locality"]) ||
            getComponent(["sublocality", "sublocality_level_1"]) ||
            getComponent(["administrative_area_level_2"]),
          state: getComponent(["administrative_area_level_1"]),
          zip: getComponent(["postal_code"]),
          country: getComponent(["country"]),
        });
      }
    }
  };

  if (!isLoaded)
    return <div className="text-center py-10">Loading Google Maps...</div>;

  return (
    <div>
      <div className="mb-3">
        <Autocomplete
          onLoad={(ac) => (autocompleteRef.current = ac)}
          onPlaceChanged={handlePlaceChanged}
        >
          <input
            ref={inputRef}
            type="text"
            placeholder="Search for an address..."
            className="npt"
          />
        </Autocomplete>
      </div>

      {loadingLocation && (
        <div className="text-sm text-gray-500 mb-2">Fetching location...</div>
      )}

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={location || { lat: 28.6139, lng: 77.209 }}
        zoom={location ? 15 : 5}
        onClick={(e) => {
          if (e.latLng) {
            const lat = e.latLng.lat();
            const lng = e.latLng.lng();
            setLocation({ lat, lng });
          }
        }}
      >
        {location && (
          <Marker
            position={location}
            draggable
            onDragEnd={(e) => {
              if (e.latLng) {
                setLocation({ lat: e.latLng.lat(), lng: e.latLng.lng() });
              }
            }}
          />
        )}
      </GoogleMap>
    </div>
  );
};

export default GoogleMapComponent;
