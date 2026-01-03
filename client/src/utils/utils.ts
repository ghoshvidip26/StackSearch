const MEMORY_KEY = "chat_memory";

export function loadMemory() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const stored = localStorage.getItem(MEMORY_KEY);
    return stored ? JSON.parse(stored) : { userName: null, history: [] };
  } catch (error) {
    console.log("Error loading memory: ", error);
    return { userName: null, history: [] };
  }
}

export function saveMemory(memory: unknown) {
  if (typeof window === "undefined") {
    return;
  }
  try {
    localStorage.setItem(MEMORY_KEY, JSON.stringify(memory));
  } catch (error) {
    console.log("Error saving memory: ", error);
  }
}

export function clearMemory() {
  localStorage.removeItem(MEMORY_KEY);
}
