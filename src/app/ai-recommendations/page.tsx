'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, LogIn, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { ChatInput } from '@/components/chat/ChatInput';
import { AiRecommendationHeader } from '@/components/layout/AiRecommendationHeader';
import { useChatStore } from '@/store/chat-store';
import { useCartStore } from '@/store/cart-store';
import { useAuth } from '@/contexts/AuthContext';
import type { ChatResponse } from '@/types/shopping-agent';

function formatTimestamp(date: Date): string {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const period = hours >= 12 ? '오후' : '오전';
  const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
  const displayMinutes = minutes.toString().padStart(2, '0');
  
  const days = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
  const dayName = days[date.getDay()];
  
  return `${period} ${displayHours}:${displayMinutes}  ${dayName}`;
}

export default function AIRecommendationsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { messages, isLoading, addMessage, clearMessages, setLoading } = useChatStore();
  const { items: cartItems } = useCartStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasInitializedRef = useRef(false);
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);

  // 메시지 자동 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 초기 환영 메시지 (한 번만 실행)
  useEffect(() => {
    if (!hasInitializedRef.current && messages.length === 0) {
      hasInitializedRef.current = true;
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
        if (response.status === 401) {
          // 인증 오류: 로그인 필요
          addMessage({
            role: 'assistant',
            content: '세션이 만료되었습니다. 다시 로그인해주세요.',
          });
          setTimeout(() => {
            router.push('/');
          }, 2000);
          return;
        }
        throw new Error('AI 응답을 받는 중 오류가 발생했습니다.');
      }

      const data: ChatResponse = await response.json();

      // AI 응답 추가
      addMessage({
        role: 'assistant',
        content: data.message,
      });

      // 장바구니 업데이트 (서버에서 반환된 장바구니로 동기화)
      if (data.cart) {
        const { setItems } = useCartStore.getState();
        setItems(data.cart);
      }

      // checkout 액션 처리 (결제 완료 시 주문 완료 페이지로 이동)
      if (data.action === 'checkout' && data.order) {
        // 결제 처리 중 상태로 변경 (사용자 인터렉션 차단)
        setIsProcessingCheckout(true);
        
        // 주문 완료 페이지로 이동 (order.id는 문자열이므로 숫자로 변환)
        const orderId = typeof data.order.id === 'string' ? parseInt(data.order.id) : data.order.id;
        setTimeout(() => {
          router.push(`/orders/${orderId}/complete`);
        }, 2000);
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleReset = () => {
    clearMessages();
    hasInitializedRef.current = false;
    // 환영 메시지 다시 추가
    setTimeout(() => {
      addMessage({
        role: 'assistant',
        content: '대화가 초기화되었습니다. 다시 시작해볼까요? 😊',
      });
    }, 100);
  };

  // 로그인 가드: 로그인하지 않은 사용자에게 안내 표시
  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-purple-50 via-background to-blue-50">
        <div className="text-center">
          <Sparkles className="w-12 h-12 text-purple-500 animate-pulse mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-purple-50 via-background to-blue-50">
        <div className="max-w-md mx-auto p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold">AI 커피 추천</h1>
          <p className="text-muted-foreground">
            로그인하시면 맞춤형 AI 추천과<br />
            구매내역 기반 개인화 서비스를 이용하실 수 있습니다.
          </p>
          <div className="flex flex-col gap-3">
            <Button
              onClick={() => router.push('/')}
              size="lg"
              className="w-full"
            >
              <LogIn className="mr-2 h-5 w-5" />
              로그인하러 가기
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/')}
              size="lg"
              className="w-full"
            >
              <Home className="mr-2 h-5 w-5" />
              홈으로 돌아가기
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-purple-50 via-background to-blue-50">
      {/* 헤더 */}
      <AiRecommendationHeader
        onClose={() => router.push('/')}
        disabled={isProcessingCheckout}
      />

      {/* 채팅 영역 */}
      <div className="flex-1 overflow-y-auto pb-28 bg-white">
        <div className="container mx-auto px-4 pt-6 sm:pt-8 pb-6 w-full sm:max-w-3xl lg:max-w-5xl">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}

          {/* 로딩 인디케이터 */}
          {isLoading && (
            <div className="flex flex-col items-start gap-4 mb-8 animate-in fade-in-50 slide-in-from-bottom-3 duration-300">
              {/* 시간 표시 */}
              <div className="flex pl-10 justify-center items-center gap-2.5">
                <span
                  className="text-[#72777A]"
                  style={{
                    fontFamily: 'Pretendard, -apple-system, Roboto, Helvetica, sans-serif',
                    fontSize: '12px',
                    fontWeight: 500,
                    lineHeight: '16px',
                    letterSpacing: '-0.3px',
                  }}
                >
                  {formatTimestamp(new Date())}
                </span>
              </div>

              {/* 메시지 영역 */}
              <div className="flex items-start gap-2 w-full max-w-[90%] sm:max-w-[80%] lg:max-w-[70%]">
                {/* AI 아이콘 */}
                <div className="flex-shrink-0 w-8 h-8">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 32 32"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle cx="16" cy="16" r="16" fill="url(#gradient)" />
                    <path
                      d="M16 8L17.5 13L22 13.5L17.5 15L16 20L14.5 15L10 13.5L14.5 13L16 8Z"
                      fill="white"
                    />
                    <path
                      d="M21 10L21.5 12L23 12.5L21.5 13L21 15L20.5 13L19 12.5L20.5 12L21 10Z"
                      fill="white"
                      opacity="0.8"
                    />
                    <defs>
                      <linearGradient
                        id="gradient"
                        x1="0"
                        y1="0"
                        x2="32"
                        y2="32"
                        gradientUnits="userSpaceOnUse"
                      >
                        <stop stopColor="#4A97F7" />
                        <stop offset="1" stopColor="#00D4FF" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>

                {/* 메시지 버블 */}
                <div
                  className="flex px-4 py-4 items-start gap-2.5 bg-[#F2F4F5] flex-1"
                  style={{
                    borderRadius: '0 24px 24px 24px',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-[#303437]/50 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-[#303437]/50 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-2 h-2 bg-[#303437]/50 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                    <p
                      className="text-[#303437]"
                      style={{
                        fontFamily: 'Pretendard, -apple-system, Roboto, Helvetica, sans-serif',
                        fontSize: '16px',
                        fontWeight: 400,
                        lineHeight: '24px',
                        letterSpacing: '-0.4px',
                      }}
                    >
                      일하는 중...
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 입력 영역 */}
      <div className="fixed bottom-0 left-0 right-0">
        <div className="container mx-auto w-full sm:max-w-3xl lg:max-w-5xl px-4">
          <ChatInput onSendMessage={handleSendMessage} disabled={isLoading || isProcessingCheckout} />
        </div>
      </div>

      {/* 결제 처리 오버레이 */}
      {isProcessingCheckout && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-sm mx-4 text-center animate-in fade-in zoom-in duration-300">
            {/* 애니메이션 아이콘 */}
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 border-4 border-purple-200 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-purple-500 animate-pulse" />
              </div>
            </div>
            
            {/* 메시지 */}
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              결제 처리 중
            </h3>
            <p className="text-gray-600 mb-4">
              주문을 완료하고 있어요...
            </p>
            <p className="text-sm text-gray-500">
              잠시만 기다려주세요 ☕️
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
