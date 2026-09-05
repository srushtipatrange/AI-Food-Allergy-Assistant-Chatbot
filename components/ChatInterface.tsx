'use client';

import { useEffect, useRef } from 'react';
import { Spinner } from '@/components/ui/spinner';

interface Message {
  role: string;
  content: string;
}

interface ChatInterfaceProps {
  messages: Message[];
  isLoading: boolean;
}

export default function ChatInterface({ messages, isLoading }: ChatInterfaceProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4 bg-gradient-to-b from-white to-blue-50">
      {messages.map((message, index) => (
        <div
          key={index}
          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-xs lg:max-w-md rounded-lg p-4 shadow-md ${
              message.role === 'user'
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-none'
                : 'bg-white text-gray-800 border border-blue-100 rounded-bl-none'
            }`}
          >
            <p className="text-sm lg:text-base leading-relaxed">{message.content}</p>
          </div>
        </div>
      ))}

      {isLoading && (
        <div className="flex justify-start">
          <div className="bg-white border border-blue-100 rounded-lg rounded-bl-none p-4 shadow-md">
            <div className="flex items-center gap-2">
              <Spinner className="h-5 w-5 text-blue-500" />
              <span className="text-sm text-gray-600">Analyzing ingredients...</span>
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
