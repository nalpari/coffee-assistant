'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

interface GeolocationPosition {
  lat: number;
  lon: number;
}

interface GeolocationState {
  position: GeolocationPosition | null;
  error: string | null;
  loading: boolean;
}

const GeolocationContext = createContext<GeolocationState | undefined>(undefined);

interface GeolocationProviderProps {
  children: ReactNode;
}

export function GeolocationProvider({ children }: GeolocationProviderProps) {
  const [state, setState] = useState<GeolocationState>({
    position: null,
    error: null,
    loading: true,
  });

  useEffect(() => {
    // Geolocation API 지원 확인
    if (!navigator.geolocation) {
      setState({
        position: null,
        error: '브라우저가 위치 서비스를 지원하지 않습니다.',
        loading: false,
      });
      return;
    }

    // watchPosition으로 사용자 위치 지속 추적
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setState({
          position: {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          },
          error: null,
          loading: false,
        });
      },
      (error) => {
        let errorMessage = '위치 정보를 가져올 수 없습니다.';

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = '위치 권한이 거부되었습니다.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = '위치 정보를 사용할 수 없습니다.';
            break;
          case error.TIMEOUT:
            errorMessage = '위치 정보 요청 시간이 초과되었습니다.';
            break;
        }

        setState({
          position: null,
          error: errorMessage,
          loading: false,
        });
      },
      {
        enableHighAccuracy: true, // 높은 정확도 요청
        maximumAge: 0, // 캐시된 위치 사용 안 함
        timeout: 10000, // 10초 타임아웃
      }
    );

    // 컴포넌트 언마운트 시 watchPosition 정리
    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  return (
    <GeolocationContext.Provider value={state}>
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
