'use client';

import { useState, useCallback } from 'react';

export type ConversationStage = 'welcome' | 'select-allergies' | 'confirm-allergies' | 'choose-input' | 'chatting';
export type InputMethod = 'voice' | 'text' | 'barcode' | 'image-ocr' | null;

export interface ConversationState {
  stage: ConversationStage;
  selectedAllergies: string[];
  inputMethod: InputMethod;
  userName: string;
  messages: Array<{
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
  }>;
}

const INITIAL_STATE: ConversationState = {
  stage: 'welcome',
  selectedAllergies: [],
  inputMethod: null,
  userName: '',
  messages: [],
};

export function useConversationFlow() {
  const [state, setState] = useState<ConversationState>(INITIAL_STATE);

  const addMessage = useCallback(
    (role: 'user' | 'assistant', content: string) => {
      setState((prev) => ({
        ...prev,
        messages: [
          ...prev.messages,
          {
            id: `msg-${Date.now()}`,
            role,
            content,
            timestamp: Date.now(),
          },
        ],
      }));
    },
    []
  );

  const moveToStage = useCallback((stage: ConversationStage) => {
    setState((prev) => ({
      ...prev,
      stage,
    }));
  }, []);

  const setAllergies = useCallback((allergies: string[]) => {
    setState((prev) => ({
      ...prev,
      selectedAllergies: allergies,
    }));
  }, []);

  const setInputMethod = useCallback((method: InputMethod) => {
    setState((prev) => ({
      ...prev,
      inputMethod: method,
    }));
  }, []);

  const setUserName = useCallback((name: string) => {
    setState((prev) => ({
      ...prev,
      userName: name,
    }));
  }, []);

  const resetConversation = useCallback(() => {
    setState(INITIAL_STATE);
  }, []);

  const clearMessages = useCallback(() => {
    setState((prev) => ({
      ...prev,
      messages: [],
    }));
  }, []);

  return {
    state,
    addMessage,
    moveToStage,
    setAllergies,
    setInputMethod,
    setUserName,
    resetConversation,
    clearMessages,
  };
}
