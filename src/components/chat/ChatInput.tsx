'use client';

import { useState, FormEvent } from 'react';
import { Send, Mic } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSendMessage, disabled = false }: ChatInputProps) {
  const [input, setInput] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const trimmedInput = input.trim();
    if (!trimmedInput || disabled) return;

    onSendMessage(trimmedInput);
    setInput('');
  };

  return (
    <div className="flex py-4 sm:py-6 lg:py-8 px-4 sm:px-6 flex-col justify-center items-center gap-2.5 rounded-b-[32px] border-t border-[#F5F5F5] bg-white">
      <form onSubmit={handleSubmit} className="flex items-center gap-4 w-full">
        <div className={`flex py-2.5 px-5 justify-between items-center flex-1 rounded-full border-2 bg-white transition-colors ${
          disabled ? 'border-[#E2E2E2] bg-[#F8F8F8]' : 'border-[#979C9E]'
        }`}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={disabled ? 'AI가 응답 중입니다...' : 'Type a message...'}
            disabled={disabled}
            className={`flex-1 bg-transparent text-base font-normal leading-6 tracking-[-0.08px] outline-none border-none focus:outline-none focus:ring-0 ${
              disabled ? 'text-[#C4C7CC] cursor-not-allowed' : 'text-foreground placeholder:text-[#72777A]'
            }`}
            style={{ fontFamily: 'Pretendard, -apple-system, Roboto, Helvetica, sans-serif' }}
            autoComplete="off"
          />
          <button
            type="button"
            disabled={disabled}
            className="ml-2 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="음성 입력"
          >
            <Mic className={`w-6 h-6 ${disabled ? 'text-[#C4C7CC]' : 'text-[#72777A]'}`} strokeWidth={1.5} />
          </button>
        </div>
        <button
          type="submit"
          disabled={disabled || !input.trim()}
          className="w-[44px] h-[44px] rounded-full bg-[#1C1C1C] flex items-center justify-center shrink-0 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity hover:bg-[#2C2C2C]"
          aria-label="메시지 전송"
        >
          <Send className="w-5 h-5 text-white" strokeWidth={2} />
        </button>
      </form>
    </div>
  );
}
