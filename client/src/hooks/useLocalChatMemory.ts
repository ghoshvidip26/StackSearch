import { useState, useCallback } from "react";
import { loadMemory, saveMemory } from "../utils/utils";

interface ChatMessage {
  role: string;
  content: string;
}

interface ChatMemory {
  username: string | null;
  history: ChatMessage[];
}

export function useLocalChatMemory() {
  const [memory, setMemory] = useState<ChatMemory>({
    username: null,
    history: [],
  });

  useCallback(() => {
    const m = loadMemory();
    setMemory(m);
  }, []);

  const addMessage = (role: string, content: string) => {
    const updated = {
      ...memory,
      history: [...memory.history, { role, content }],
    };
    setMemory(updated);
    saveMemory(updated);
  };

  const setUserName = (name: unknown) => {
    const updated = { ...memory, userName: name };
    setMemory(updated);
    saveMemory(updated);
  };

  return {
    memory,
    addMessage,
    setUserName,
  };
}
