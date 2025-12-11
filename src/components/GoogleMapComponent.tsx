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
};

const containerStyle = {
  width: "100%",
  height: "50vh",
};

const GoogleMapComponent: React.FC<Props> = ({
  location,
  setLocation,
  setAddress,
}) => {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: GOOGLE_API_KEY,
    libraries: ["places"],
  });

  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);

  // 🧭 Fetch current location and reverse geocode on load
  useEffect(() => {
    const fetchCurrentLocation = async () => {
      try {
        setLoadingLocation(true);
        const permission = await Geolocation.requestPermissions();
        if (permission.location === "granted") {
          const coordinates = await Geolocation.getCurrentPosition();
          const lat = coordinates.coords.latitude;
          const lng = coordinates.coords.longitude;
          setLocation({ lat, lng });

          // 🧠 Reverse geocode to get address text
          const geocoder = new google.maps.Geocoder();
          geocoder.geocode({ location: { lat, lng } }, (results, status) => {
            if (status === "OK" && results && results[0]) {
              const address = results[0].formatted_address;
              if (inputRef.current) inputRef.current.value = address;

              const components = results[0].address_components || [];
              setAddress({
                street_1: components[0]?.long_name || "",
                city:
                  components.find((c) => c.types.includes("locality"))
                    ?.long_name || "",
                state:
                  components.find((c) =>
                    c.types.includes("administrative_area_level_1")
                  )?.long_name || "",
                zip:
                  components.find((c) => c.types.includes("postal_code"))
                    ?.long_name || "",
                country:
                  components.find((c) => c.types.includes("country"))
                    ?.long_name || "",
              });
            }
          });
        } else {
          alert("Location permission not granted");
        }
      } catch (error) {
        console.error("Error fetching location:", error);
      } finally {
        setLoadingLocation(false);
      }
    };

    fetchCurrentLocation();
  }, [setLocation, setAddress]);

  const handlePlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      if (place.geometry?.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        setLocation({ lat, lng });
        inputRef.current!.value = place.formatted_address || "";

        setAddress({
          street_1: place.address_components?.[0].long_name || "",
          city: place.address_components?.[1].long_name || "",
          state: place.address_components?.[2].long_name || "",
          zip: place.address_components?.[3].long_name || "",
          country: place.address_components?.[4].long_name || "",
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
