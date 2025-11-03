'use client';

import { Sparkles, User } from 'lucide-react';
import type { ChatMessage as ChatMessageType } from '@/types/chat';
import { cn } from '@/lib/utils';

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div
      className={cn(
        'flex gap-3 mb-6 animate-in fade-in-50 slide-in-from-bottom-3 duration-300',
        isUser && 'flex-row-reverse'
      )}
    >
      {/* 아바타 */}
      <div
        className={cn(
          'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-md',
          isUser 
            ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white' 
            : 'bg-gradient-to-br from-purple-500 to-pink-500 text-white'
        )}
      >
        {isUser ? <User className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
      </div>

      {/* 메시지 버블 컨테이너 */}
      <div className="flex-1 max-w-[75%] flex flex-col gap-1">
        {/* 발신자 이름 */}
        <span className={cn(
          'text-xs font-medium px-2',
          isUser ? 'text-right text-blue-600' : 'text-left text-purple-600'
        )}>
          {isUser ? '나' : 'AI 어시스턴트'}
        </span>

        {/* 메시지 버블 with 말풍선 꼬리 */}
        <div className="relative">
          {/* 말풍선 꼬리 */}
          <div
            className={cn(
              'absolute top-2 w-0 h-0',
              isUser
                ? 'right-0 translate-x-1 border-l-[12px] border-l-blue-500 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent'
                : 'left-0 -translate-x-1 border-r-[12px] border-r-white border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent'
            )}
          />

          {/* 메시지 내용 */}
          <div
            className={cn(
              'rounded-2xl px-4 py-3 shadow-sm',
              isUser
                ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
                : 'bg-white text-gray-800 border border-gray-100'
            )}
          >
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
              {message.content}
            </p>
          </div>
        </div>

        {/* 타임스탬프 */}
        <span
          className={cn(
            'text-xs px-2',
            isUser ? 'text-right text-gray-500' : 'text-left text-gray-500'
          )}
        >
          {message.timestamp.toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>
    </div>
  );
}
