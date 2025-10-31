/**
 * 메시지 발신자 타입
 */
export type MessageRole = 'user' | 'assistant';

/**
 * 채팅 메시지
 */
export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
}

/**
 * AI 채팅 요청
 */
export interface ChatRequest {
  messages: Array<{
    role: MessageRole;
    content: string;
  }>;
}

/**
 * AI 채팅 응답
 */
export interface ChatResponse {
  success: boolean;
  message?: string;
  error?: string;
}
