'use client';

import type { ChatMessage as ChatMessageType } from '@/types/chat';
import { cn } from '@/lib/utils';

interface ChatMessageProps {
  message: ChatMessageType;
}

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

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <div className="flex flex-col items-end gap-2 mb-8 animate-in fade-in-50 slide-in-from-bottom-3 duration-300">
        {/* 시간 표시 */}
        <div className="flex pr-5 justify-end items-center">
          <span
            className="text-[#72777A] text-right"
            style={{
              fontFamily: 'Pretendard, -apple-system, Roboto, Helvetica, sans-serif',
              fontSize: '12px',
              fontWeight: 500,
              lineHeight: '16px',
              letterSpacing: '-0.3px',
            }}
          >
            {formatTimestamp(message.timestamp)}
          </span>
        </div>

        {/* 메시지 버블 */}
        <div
          className="px-4 py-4 bg-[#4A97F7]"
          style={{
            borderRadius: '24px 24px 0 24px',
          }}
        >
          <p
            className="text-white text-right"
            style={{
              fontFamily: 'Pretendard, -apple-system, Roboto, Helvetica, sans-serif',
              fontSize: '16px',
              fontWeight: 400,
              lineHeight: '24px',
              letterSpacing: '-0.4px',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {message.content}
          </p>
        </div>
      </div>
    );
  }

  return (
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
          {formatTimestamp(message.timestamp)}
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
          <p
            className="text-[#303437]"
            style={{
              fontFamily: 'Pretendard, -apple-system, Roboto, Helvetica, sans-serif',
              fontSize: '16px',
              fontWeight: 400,
              lineHeight: '24px',
              letterSpacing: '-0.4px',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {message.content}
          </p>
        </div>
      </div>
    </div>
  );
}
