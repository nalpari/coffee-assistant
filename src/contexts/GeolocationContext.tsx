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
  autoFetch?: boolean; // 위치를 자동으로 가져올지 여부 (기본값: false)
}

export function GeolocationProvider({ children, autoFetch = false }: GeolocationProviderProps) {
  const [state, setState] = useState<GeolocationState>({
    position: null,
    error: null,
    loading: autoFetch, // autoFetch가 true일 때만 loading 상태
  });

  useEffect(() => {
    // autoFetch가 false이면 위치를 가져오지 않음
    if (!autoFetch) {
      return;
    }

    // Geolocation API 지원 확인
    if (!navigator.geolocation) {
      setState({
        position: null,
        error: '브라우저가 위치 서비스를 지원하지 않습니다.',
        loading: false,
      });
      return;
    }

    // 한 번만 현재 위치 가져오기 (추적하지 않음)
    navigator.geolocation.getCurrentPosition(
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
        enableHighAccuracy: false, // 배터리 절약
        maximumAge: 300000, // 5분간 캐시된 위치 사용
        timeout: 10000, // 10초 타임아웃
      }
    );
  }, [autoFetch]);

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
