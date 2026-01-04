import "dotenv/config";
import path from "path";
import { FaissStore } from "@langchain/community/vectorstores/faiss";
import { geminiEmbeddings, geminiLLM } from "./geminiLLM";

const VECTOR_ROOT = path.join(__dirname, "..", "faiss_store");

export async function search(
  question: string,
  framework: string,
  history: any[] = []
) {
  const fw = framework.toLowerCase();

  const storePath = path.join(VECTOR_ROOT, fw);

  console.log("📂 Loading FAISS index:", storePath);

  const store = await FaissStore.load(storePath, geminiEmbeddings);

  const results = await store.similaritySearch(question, 5);

  if (!results.length) return "Not in docs.";

  const context = results
    .map((r) => r.pageContent)
    .join("\n\n");

  const historyText = history
    .slice(-6)
    .map((h: any) => `${h.role === "user" ? "User" : "Assistant"}: ${h.content}`)
    .join("\n");

  const prompt = `
You are a strict documentation assistant for ${framework}.
Answer ONLY using the Documentation below.

If the answer is not present, reply exactly:
"Not in docs."

Conversation History:
${historyText}

Documentation:
${context}

User Question:
${question}
`;

  const res = await geminiLLM.invoke(prompt);

  return res.content;
}
