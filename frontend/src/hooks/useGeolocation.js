import { useState, useEffect } from 'react';

export const useGeolocation = () => {
  const [location, setLocation] = useState({
    latitude: null,
    longitude: null,
    loaded: false,
    error: null,
  });

  const getLocation = () => {
    if (!('geolocation' in navigator)) {
      setLocation((state) => ({
        ...state,
        loaded: true,
        error: { code: 0, message: 'Geolocation not supported by browser' },
      }));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          loaded: true,
          error: null,
        });
      },
      (error) => {
        setLocation((state) => ({
          ...state,
          loaded: true,
          error: { code: error.code, message: error.message },
        }));
      },
      { timeout: 8000 }
    );
  };

  useEffect(() => {
    getLocation();
  }, []);

  return { ...location, refresh: getLocation };
};
