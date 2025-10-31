'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, RotateCcw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { ChatInput } from '@/components/chat/ChatInput';
import { useChatStore } from '@/store/chat-store';
import { useCartStore } from '@/store/cart-store';
import type { ChatResponse } from '@/types/shopping-agent';

export default function AIRecommendationsPage() {
  const router = useRouter();
  const { messages, isLoading, addMessage, clearMessages, setLoading } = useChatStore();
  const { items: cartItems } = useCartStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 메시지 자동 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 초기 환영 메시지
  useEffect(() => {
    if (messages.length === 0) {
      addMessage({
        role: 'assistant',
        content: '안녕하세요! ☕️\n\n저는 AI 쇼핑 어시스턴트입니다.\n\n원하시는 커피 종류, 취향, 기분을 말씀해주시면 맞춤 추천과 함께 장바구니 관리도 도와드릴게요!',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSendMessage = async (content: string) => {
    // 사용자 메시지 추가
    addMessage({
      role: 'user',
      content,
    });

    setLoading(true);

    try {
      // Shopping Agent API 호출
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          cart: cartItems,
        }),
      });

      if (!response.ok) {
        throw new Error('AI 응답을 받는 중 오류가 발생했습니다.');
      }

      const data: ChatResponse = await response.json();

      // AI 응답 추가
      addMessage({
        role: 'assistant',
        content: data.message,
      });

      // 장바구니 업데이트
      if (data.cart && data.cart.length !== cartItems.length) {
        // 서버에서 반환된 장바구니로 동기화
        // 여기서는 간단히 메시지만 표시
        console.log('장바구니가 업데이트되었습니다:', data.cart);
      }

      // checkout 액션 처리
      if (data.action === 'checkout') {
        router.push('/checkout');
      }
    } catch (error) {
      console.error('AI 채팅 오류:', error);
      addMessage({
        role: 'assistant',
        content: '죄송합니다. 응답을 생성하는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    clearMessages();
    // 환영 메시지 다시 추가
    setTimeout(() => {
      addMessage({
        role: 'assistant',
        content: '대화가 초기화되었습니다. 다시 시작해볼까요? 😊',
      });
    }, 100);
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-purple-50 via-background to-blue-50">
      {/* 헤더 */}
      <div className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <h1 className="text-xl font-bold">AI 커피 추천</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={handleReset}>
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => router.push('/')}>
              <Home className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* 채팅 영역 */}
      <div className="flex-1 overflow-y-auto pb-48">
        <div className="container mx-auto px-4 py-6 max-w-3xl">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}

          {/* 로딩 인디케이터 */}
          {isLoading && (
            <div className="flex gap-3 mb-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white animate-pulse" />
              </div>
              <div className="flex-1 max-w-[80%] rounded-2xl px-4 py-3 bg-muted">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 입력 영역 */}
      <div className="fixed bottom-16 left-0 right-0 bg-white/80 backdrop-blur-sm border-t p-4 pb-safe">
        <div className="container mx-auto max-w-3xl">
          {/* 추천 프롬프트 버튼 */}
          <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSendMessage('오늘의 추천 커피가 뭐예요?')}
              disabled={isLoading}
              className="flex-shrink-0"
            >
              오늘의 추천
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSendMessage('아메리카노 2개 장바구니에 담아줘')}
              disabled={isLoading}
              className="flex-shrink-0"
            >
              장바구니에 담기
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSendMessage('자주 주문하는 메뉴 추천해줘')}
              disabled={isLoading}
              className="flex-shrink-0"
            >
              자주 주문 메뉴
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSendMessage('결제할게요')}
              disabled={isLoading}
              className="flex-shrink-0"
            >
              결제하기
            </Button>
          </div>

          <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} />
        </div>
      </div>
    </div>
  );
}
