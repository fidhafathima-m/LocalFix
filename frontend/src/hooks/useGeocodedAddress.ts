import { useState, useEffect } from 'react';

interface Address {
  street: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
}

interface GeocodedCoordinates {
  lat: number;
  lng: number;
}

export const useGeocodedAddress = (address: Address | null) => {
  const [coordinates, setCoordinates] = useState<GeocodedCoordinates | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const geocodeAddress = async () => {
      if (!address) {
        setCoordinates(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const formattedAddress = `${address.street}, ${address.city}, ${address.state} ${address.pincode}`;
        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

        if (!apiKey) {
          throw new Error('Google Maps API key is missing');
        }

        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
            formattedAddress
          )}&key=${apiKey}`
        );
        
        const data = await response.json();
        
        if (data.results && data.results.length > 0) {
          const location = data.results[0].geometry.location;
          setCoordinates({
            lat: location.lat,
            lng: location.lng
          });
        } else {
          setError('Could not find coordinates for this address');
        }
      } catch (err) {
        console.error('Geocoding error:', err);
        setError('Failed to geocode address');
      } finally {
        setLoading(false);
      }
    };

    geocodeAddress();
  }, [address]);

  return { coordinates, loading, error };
};