'use client';

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';

interface GeolocationPosition {
  lat: number;
  lon: number;
}

interface GeolocationState {
  position: GeolocationPosition | null;
  error: string | null;
  loading: boolean;
  /** 수동으로 현재 위치를 요청하는 함수 */
  requestLocation: () => void;
  /** 위치 권한이 승인되었는지 여부 */
  isLocationEnabled: boolean;
}

const GeolocationContext = createContext<GeolocationState | undefined>(undefined);

interface GeolocationProviderProps {
  children: ReactNode;
  autoFetch?: boolean; // 위치를 자동으로 가져올지 여부 (기본값: false)
}

export function GeolocationProvider({ children, autoFetch = false }: GeolocationProviderProps) {
  const [position, setPosition] = useState<GeolocationPosition | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(autoFetch);
  const [isLocationEnabled, setIsLocationEnabled] = useState(false);

  // 위치 요청 함수 (수동 또는 자동 호출)
  const fetchLocation = useCallback(() => {
    // Geolocation API 지원 확인
    if (!navigator.geolocation) {
      setError('브라우저가 위치 서비스를 지원하지 않습니다.');
      setLoading(false);
      setIsLocationEnabled(false);
      return;
    }

    // HTTPS가 아닌 경우 경고 (localhost 제외)
    if (
      typeof window !== 'undefined' &&
      window.location.protocol !== 'https:' &&
      !window.location.hostname.includes('localhost') &&
      window.location.hostname !== '127.0.0.1'
    ) {
      setError('위치 서비스는 HTTPS 환경에서만 사용할 수 있습니다.');
      setLoading(false);
      setIsLocationEnabled(false);
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        });
        setError(null);
        setLoading(false);
        setIsLocationEnabled(true);
      },
      (err) => {
        let errorMessage = '위치 정보를 가져올 수 없습니다.';

        switch (err.code) {
          case err.PERMISSION_DENIED:
            errorMessage = '위치 권한이 거부되었습니다.';
            break;
          case err.POSITION_UNAVAILABLE:
            errorMessage = '위치 정보를 사용할 수 없습니다.';
            break;
          case err.TIMEOUT:
            errorMessage = '위치 정보 요청 시간이 초과되었습니다.';
            break;
        }

        setError(errorMessage);
        setLoading(false);
        setIsLocationEnabled(false);
      },
      {
        enableHighAccuracy: true, // 높은 정확도 사용
        maximumAge: 300000, // 5분간 캐시된 위치 사용
        timeout: 10000, // 10초 타임아웃
      }
    );
  }, []);

  // 수동으로 위치 요청하는 함수 (외부에서 호출 가능)
  const requestLocation = useCallback(() => {
    fetchLocation();
  }, [fetchLocation]);

  // autoFetch가 true이면 마운트 시 자동으로 위치 가져오기
  useEffect(() => {
    if (autoFetch) {
      fetchLocation();
    }
  }, [autoFetch, fetchLocation]);

  const value: GeolocationState = {
    position,
    error,
    loading,
    requestLocation,
    isLocationEnabled,
  };

  return (
    <GeolocationContext.Provider value={value}>
      {children}
    </GeolocationContext.Provider>
  );
}

export function useGeolocation() {
  const context = useContext(GeolocationContext);

  if (context === undefined) {
    throw new Error('useGeolocation must be used within a GeolocationProvider');
  }

  return context;
}
