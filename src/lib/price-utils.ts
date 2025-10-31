/**
 * 금액 포맷팅 유틸리티
 * 서버/클라이언트 컴포넌트 양쪽에서 사용 가능
 */

/**
 * 금액을 한국 원화 형식으로 포맷
 * @param price - 포맷할 금액
 * @returns 포맷된 금액 문자열 (예: "4,500원")
 */
export function formatPrice(price: number): string {
  return `${price.toLocaleString('ko-KR')}원`
}
