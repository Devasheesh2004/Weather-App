import { useState, useEffect } from 'react';
import axios from 'axios';

export interface LocationState {
  lat: number | null;
  lon: number | null;
  city: string | null;
  error: string | null;
  loading: boolean;
}

const FALLBACK_LONDON = {
  lat: 51.5074,
  lon: -0.1278,
  city: "London, GB"
};


export const useLocation = () => {
  const [location, setLocation] = useState<LocationState>({
    lat: null,
    lon: null,
    city: null,
    error: null,
    loading: true,
  });

  const fetchCityName = async (lat: number, lon: number) => {
    try {
      const res = await axios.get(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
      const data = res.data;
      return data.city || data.locality || data.principalSubdivision || "Unknown Location";
    } catch {
      return `${lat.toFixed(1)}, ${lon.toFixed(1)}`;
    }
  };

  useEffect(() => {
    let isMounted = true;

    const onSuccess = async (position: GeolocationPosition) => {
      const { latitude, longitude } = position.coords;
      const cityName = await fetchCityName(latitude, longitude);
      
      if (isMounted) {
        setLocation({
          lat: latitude,
          lon: longitude,
          city: cityName,
          error: null,
          loading: false,
        });
      }
    };

    const onError = async (error: GeolocationPositionError) => {
      if (isMounted) {
        setLocation({
          lat: FALLBACK_LONDON.lat,
          lon: FALLBACK_LONDON.lon,
          city: FALLBACK_LONDON.city,
          error: error.message,
          loading: false,
        });
      }
    };

    if (!navigator.geolocation) {
      if (isMounted) {
        Promise.resolve().then(() => {
          if (isMounted) {
            setLocation({
              ...FALLBACK_LONDON,
              error: "Geolocation not supported",
              loading: false,
            });
          }
        });
      }
    } else {
      navigator.geolocation.getCurrentPosition(onSuccess, onError);
    }

    return () => { isMounted = false; };
  }, []);

  return location;
};
