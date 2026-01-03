import { useState, useEffect } from "react";

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
}

interface Chat {
  id: string;
  title: string;
  history: ChatMessage[];
}

interface Chats {
  [key: string]: Chat;
}

const STORAGE_KEY = "zeta-chats";

export function useMultiChatMemory() {
  // ---------- INITIALIZE FROM STORAGE SAFELY ----------
  const [chats, setChats] = useState<Chats>(() => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);

      if (!data) {
        const id = "chat_" + Date.now();
        return {
          [id]: { id, title: "New Chat", history: [] },
        };
      }

      const parsed = JSON.parse(data);
      return parsed.chats || {};
    } catch {
      const id = "chat_" + Date.now();
      return {
        [id]: { id, title: "New Chat", history: [] },
      };
    }
  });

  const [activeChatId, setActiveChatId] = useState<string | null>(() => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return Object.keys(chats)[0] ?? null;
      const parsed = JSON.parse(data);
      return parsed.activeChatId ?? Object.keys(parsed.chats ?? {})[0] ?? null;
    } catch {
      return Object.keys(chats)[0] ?? null;
    }
  });

  // ---------- PERSIST TO STORAGE ----------
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ chats, activeChatId }));
  }, [chats, activeChatId]);

  // ---------- SWITCH CHAT ----------
  const switchChat = (id: string) => setActiveChatId(id);

  // ---------- ADD MESSAGE ----------
  const addMessage = (
    role: "user" | "assistant" | "system",
    content: string
  ) => {
    if (!activeChatId) return;

    setChats((prev) => {
      const chat = prev[activeChatId];
      if (!chat) return prev;

      const msg: ChatMessage = {
        role,
        content,
        timestamp: Date.now(),
      };

      return {
        ...prev,
        [activeChatId]: {
          ...chat,
          title:
            chat.history.length === 0 && role === "user"
              ? content.slice(0, 30)
              : chat.title,
          history: [...chat.history, msg],
        },
      };
    });
  };

  // ---------- REMOVE CHAT ----------
  const removeChat = (id: string) => {
    setChats((prev) => {
      const updated = { ...prev };
      delete updated[id];

      const ids = Object.keys(updated);

      // set new active chat safely
      if (activeChatId === id) {
        setActiveChatId(ids[0] ?? null);
      }

      return updated;
    });
  };

  return {
    chats,
    activeChatId,
    activeChat: activeChatId ? chats[activeChatId] : null,
    switchChat,
    addMessage,
    removeChat,
  };
}
