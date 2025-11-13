/**
 * 위치 기반 유틸리티 함수
 *
 * 거리 계산, 포맷팅, 도보 시간 추정 등의 기능 제공
 */

/**
 * 각도를 라디안으로 변환
 * @param deg 각도 (degree)
 * @returns 라디안 값
 */
function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Haversine 공식을 사용한 두 지점 간 거리 계산
 *
 * @param lat1 첫 번째 지점의 위도
 * @param lon1 첫 번째 지점의 경도
 * @param lat2 두 번째 지점의 위도
 * @param lon2 두 번째 지점의 경도
 * @returns 두 지점 간의 거리 (킬로미터)
 *
 * @example
 * // 서울시청과 광화문 간 거리 계산
 * const distance = calculateDistance(37.5665, 126.9780, 37.5759, 126.9768);
 * console.log(distance); // 약 1.04km
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // 지구 반경 (킬로미터)
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
}

/**
 * 거리를 사람이 읽기 쉬운 형식으로 변환
 *
 * @param distanceKm 거리 (킬로미터)
 * @returns 포맷팅된 거리 문자열 (예: "58m", "1.5km")
 *
 * @example
 * formatDistance(0.058); // "58m"
 * formatDistance(1.5);   // "1.5km"
 * formatDistance(12.345); // "12.3km"
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)}m`;
  }
  return `${distanceKm.toFixed(1)}km`;
}

/**
 * 도보 시간 추정
 *
 * 평균 도보 속도: 4km/h를 기준으로 계산
 *
 * @param distanceKm 거리 (킬로미터)
 * @returns 포맷팅된 도보 시간 문자열 (예: "1분", "15분", "1시간 30분")
 *
 * @example
 * estimateWalkingTime(0.058); // "1분"
 * estimateWalkingTime(1.0);   // "15분"
 * estimateWalkingTime(6.0);   // "1시간 30분"
 */
export function estimateWalkingTime(distanceKm: number): string {
  const AVERAGE_WALKING_SPEED = 4; // km/h
  const hours = distanceKm / AVERAGE_WALKING_SPEED;
  const minutes = Math.round(hours * 60);

  if (minutes < 1) return '1분';
  if (minutes < 60) return `${minutes}분`;

  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}시간 ${m}분` : `${h}시간`;
}

/**
 * 현재 시간이 영업 시간 내인지 확인
 *
 * @param openingHours 영업 시간 객체
 * @param currentDate 확인할 시간 (기본값: 현재 시간)
 * @returns 영업 중이면 true, 아니면 false
 *
 * @example
 * const hours = {
 *   monday: "09:00-22:00",
 *   tuesday: "09:00-22:00"
 * };
 * isStoreOpen(hours); // 현재 시간이 영업 시간 내인지 확인
 */
export function isStoreOpen(
  openingHours: Record<string, string | undefined>,
  currentDate: Date = new Date()
): boolean {
  const dayNames = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ];
  const currentDay = dayNames[currentDate.getDay()];
  const hours = openingHours[currentDay];

  if (!hours) return false;

  // "09:00-22:00" 형식 파싱
  const [openTime, closeTime] = hours.split('-');
  if (!openTime || !closeTime) return false;

  const [openHour, openMinute] = openTime.split(':').map(Number);
  const [closeHour, closeMinute] = closeTime.split(':').map(Number);

  const currentHour = currentDate.getHours();
  const currentMinute = currentDate.getMinutes();

  const currentTimeInMinutes = currentHour * 60 + currentMinute;
  const openTimeInMinutes = openHour * 60 + openMinute;
  const closeTimeInMinutes = closeHour * 60 + closeMinute;

  // 자정을 넘어가는 경우 처리 (예: 22:00-02:00)
  if (closeTimeInMinutes < openTimeInMinutes) {
    return (
      currentTimeInMinutes >= openTimeInMinutes ||
      currentTimeInMinutes < closeTimeInMinutes
    );
  }

  return (
    currentTimeInMinutes >= openTimeInMinutes &&
    currentTimeInMinutes < closeTimeInMinutes
  );
}

/**
 * 사용자의 현재 위치 가져오기 (Promise)
 *
 * @param options Geolocation API 옵션
 * @returns 위치 정보 Promise
 *
 * @example
 * try {
 *   const position = await getCurrentPosition();
 *   console.log(position.coords.latitude, position.coords.longitude);
 * } catch (error) {
 *   console.error('위치 권한 거부:', error);
 * }
 */
export function getCurrentPosition(
  options?: PositionOptions
): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation API를 지원하지 않는 브라우저입니다.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, options);
  });
}

/**
 * 거리를 기준으로 매장 배열 정렬
 *
 * @param stores 매장 배열
 * @param userLat 사용자 위도
 * @param userLon 사용자 경도
 * @returns 거리순으로 정렬된 매장 배열
 */
export function sortStoresByDistance<T extends { latitude?: number; longitude?: number }>(
  stores: T[],
  userLat: number,
  userLon: number
): T[] {
  return stores.sort((a, b) => {
    if (!a.latitude || !a.longitude) return 1;
    if (!b.latitude || !b.longitude) return -1;

    const distanceA = calculateDistance(userLat, userLon, a.latitude, a.longitude);
    const distanceB = calculateDistance(userLat, userLon, b.latitude, b.longitude);

    return distanceA - distanceB;
  });
}
