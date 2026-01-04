import { useEffect, useReducer, useState } from "react";
import { Send, Bot, User, Code, Zap, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";

/* ---------------- TYPES ---------------- */

type Message = {
  role: "user" | "assistant";
  content: string;
};

type State = {
  framework: string | null;
  messages: Message[];
  loading: boolean;
};

type Action =
  | { type: "SET_FRAMEWORK"; payload: string | null }
  | { type: "ADD_MESSAGE"; payload: Message }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "LOAD_SAVED"; payload: State };

/* ---------------- REDUCER ---------------- */

const initialState: State = {
  framework: null,
  messages: [],
  loading: false,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_FRAMEWORK":
      return { ...state, framework: action.payload };

    case "ADD_MESSAGE":
      return { ...state, messages: [...state.messages, action.payload] };

    case "SET_LOADING":
      return { ...state, loading: action.payload };

    case "LOAD_SAVED":
      return action.payload;

    default:
      return state;
  }
}

/* ---------------- STORAGE ---------------- */

const STORAGE_KEY = "devstack-chat";

function saveState(state: State) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.log(e);
  }
}

function loadState(): State | null {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;
    return JSON.parse(data);
  } catch {
    return null;
  }
}

/* ---------------- STACK LIST ---------------- */

const techStacks = [
  { name: "AWS", icon: "☁️" },
  { name: "Docker", icon: "🐳" },
  { name: "Express.js", icon: "🚀" },
  { name: "FastAPI", icon: "🐍" },
  { name: "MongoDB", icon: "🍃" },
  { name: "Next.js", icon: "⏭️" },
  { name: "NumPy", icon: "🔢" },
  { name: "Pandas", icon: "🐼" },
  { name: "PostgreSQL", icon: "🐘" },
  { name: "Prisma ORM", icon: "🔌" },
  { name: "React", icon: "⚛️" },
  { name: "Redis", icon: "🔴" },
  { name: "Tailwind CSS", icon: "🎨" },
  { name: "TypeScript", icon: "📝" },
];

const featuredStacks = techStacks.filter((t) =>
  ["AWS", "Docker", "Express.js", "FastAPI", "React"].includes(t.name)
);

/* ---------------- COMPONENT ---------------- */

export default function Home() {
  /* Lazy initialization to prevent flash and stuck loading state */
  const init = (defaultState: State): State => {
    const saved = loadState();
    if (saved) {
      return { ...saved, loading: false };
    }
    return defaultState;
  };

  const [state, dispatch] = useReducer(reducer, initialState, init);
  const [input, setInput] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  /* Save on change */
  useEffect(() => {
    saveState(state);
  }, [state]);

  /* Card submit */
  const handleSubmitFromCard = async (question: string, framework: string) => {
    if (state.loading) return;

    dispatch({ type: "SET_LOADING", payload: true });

    try {
      const res = await fetch("http://localhost:3000/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: question,
          framework, // <-- use param
          history: [...state.messages, { role: "user", content: question }],
          //       ^-- include the message that was just sent
        }),
      });

      const data = await res.json();

      dispatch({
        type: "ADD_MESSAGE",
        payload: { role: "assistant", content: data ?? "No response" },
      });
    } catch {
      dispatch({
        type: "ADD_MESSAGE",
        payload: { role: "assistant", content: "⚠️ Backend error." },
      });
    }

    dispatch({ type: "SET_LOADING", payload: false });
  };

  /* Manual submit */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const question = input;
    setInput("");

    // Add user message to UI state
    dispatch({
      type: "ADD_MESSAGE",
      payload: { role: "user", content: question },
    });

    dispatch({ type: "SET_LOADING", payload: true });

    try {
      const res = await fetch("http://localhost:3000/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: question,
          framework: state.framework,
          // Fix: Ensure we include the new message in the history sent to the backend
          history: [...state.messages, { role: "user", content: question }],
        }),
      });

      const data = await res.json();

      dispatch({
        type: "ADD_MESSAGE",
        payload: { role: "assistant", content: data ?? "No response" },
      });
    } catch {
      dispatch({
        type: "ADD_MESSAGE",
        payload: { role: "assistant", content: "⚠️ Backend error." },
      });
    }

    dispatch({ type: "SET_LOADING", payload: false });
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950">
      {/* HEADER */}
      <header className="bg-slate-900/95 backdrop-blur text-white shadow-md border-b border-slate-800">
        <div className="px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="md:hidden p-2 hover:bg-indigo-800 rounded-lg"
            >
              {isSidebarOpen ? <X /> : <Menu />}
            </button>

            <Code className="w-6 h-6 text-indigo-400" />
            <h1 className="text-2xl font-semibold tracking-tight">
              DevStack AI
            </h1>
          </div>

          <div className="hidden md:flex items-center space-x-2 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-400/40">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
            <p className="text-xs font-medium text-emerald-200 tracking-wide">
              Assistant Ready
            </p>
          </div>
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        {/* SIDEBAR */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.aside
              initial={{ x: -250 }}
              animate={{ x: 0 }}
              exit={{ x: -250 }}
              className="fixed md:static top-16 left-0 z-20 w-64 md:w-72 bg-slate-900/80 backdrop-blur text-slate-100 border-r border-slate-800 h-[calc(100vh-4rem)] flex flex-col"
            >
              <div className="px-4 py-6 space-y-1 overflow-y-auto">
                {techStacks.map((tech) => (
                  <motion.button
                    key={tech.name}
                    whileHover={{ x: 6 }}
                    className={`w-full px-4 py-2.5 rounded-lg flex items-center gap-3 text-sm font-medium transition-colors
                      ${state.framework === tech.name
                        ? "bg-indigo-500 text-white shadow-sm"
                        : "text-slate-100/80 hover:bg-slate-800/80"
                      }`}
                    onClick={() =>
                      dispatch({ type: "SET_FRAMEWORK", payload: tech.name })
                    }
                  >
                    <span>{tech.icon}</span>
                    <span>{tech.name}</span>
                  </motion.button>
                ))}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* CHAT SECTION */}
        <section className="flex-1 flex flex-col">
          {/* Header strip */}
          <div className="border-b border-slate-800/60 bg-slate-900/60 backdrop-blur px-10 py-3">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Conversation
            </p>
            <p className="text-sm text-slate-100 mt-1">
              {state.framework
                ? `${state.framework} · Developer Assistant`
                : "Ask anything about your stack"}
            </p>
          </div>

          {/* Chat body */}
          <div className="flex-1 overflow-y-auto px-10 py-8 space-y-6 bg-slate-900/60">
            {state.messages.length === 0 ? (
              <>
                <div className="text-center text-slate-300">
                  <Zap className="w-14 h-14 mx-auto text-indigo-400" />
                  <h2 className="text-xl font-semibold mt-4">
                    Select a Tech Stack to start
                  </h2>
                  <p className="text-slate-400 mt-2 text-sm">
                    Or ask anything related to development, architecture, or
                    debugging.
                  </p>
                </div>

                {/* Tech Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 max-w-5xl mx-auto">
                  {featuredStacks.map((tech) => (
                    <button
                      key={tech.name}
                      onClick={() => {
                        dispatch({
                          type: "SET_FRAMEWORK",
                          payload: tech.name,
                        });

                        const q = `I want to know about ${tech.name}`;

                        dispatch({
                          type: "ADD_MESSAGE",
                          payload: { role: "user", content: q },
                        });

                        handleSubmitFromCard(q, tech.name);
                      }}
                      className="group relative flex flex-col justify-between rounded-3xl border border-slate-800 bg-slate-900/80 px-6 py-5 text-left shadow-sm hover:border-slate-600 hover:bg-slate-900 transition-colors duration-200"
                    >
                      <div className="text-slate-200 text-sm font-medium">
                        {tech.name}
                      </div>

                      <div className="mt-6 flex items-center justify-end gap-1.5">
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-800 text-[10px] text-slate-200">
                          {tech.icon}
                        </span>
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-indigo-500/90 text-[10px] text-white group-hover:bg-indigo-400">
                          AI
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              state.messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"
                    }`}
                >
                  <div
                    className={`px-5 py-4 rounded-2xl shadow-sm max-w-3xl ${m.role === "user"
                      ? "bg-indigo-500 text-white"
                      : "bg-slate-800/80 border border-slate-700 text-slate-100"
                      }`}
                  >
                    <div className="flex items-center gap-2 text-sm opacity-80 mb-1">
                      {m.role === "user" ? <User /> : <Bot />}
                      {m.role === "user" ? "You" : "Assistant"}
                    </div>

                    <ReactMarkdown>{m.content}</ReactMarkdown>
                  </div>
                </motion.div>
              ))
            )}

            {state.loading && (
              <p className="text-center text-slate-400 text-xs uppercase animate-pulse">
                Assistant is thinking…
              </p>
            )}
          </div>

          {/* INPUT BAR — ALWAYS HERE */}
          <form
            onSubmit={handleSubmit}
            className="px-6 py-4 bg-slate-900/80 border-t border-slate-800"
          >
            <div className="relative max-w-4xl mx-auto flex items-center gap-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-slate-700 bg-slate-900/80 text-slate-100 placeholder:text-slate-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/70 focus:border-indigo-500 text-sm"
                placeholder={`Ask about ${state.framework || "any technology"
                  }…`}
              />

              <button
                type="submit"
                className="shrink-0 inline-flex items-center justify-center rounded-xl bg-indigo-500 text-white px-4 py-2 text-sm font-medium shadow-sm hover:bg-indigo-400 transition-colors"
              >
                <Send />
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
