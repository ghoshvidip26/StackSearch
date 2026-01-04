import dotenv from "dotenv";
dotenv.config({ path: "../.env" });
import {
  ChatGoogleGenerativeAI,
  GoogleGenerativeAIEmbeddings,
} from "@langchain/google-genai";
import { Document } from "langchain";

export const geminiLLM = new ChatGoogleGenerativeAI({
  model: "gemini-2.0-flash",
  maxRetries: 3,
  apiKey: process.env.GOOGLE_API_KEY!,
});

export const geminiEmbeddings = new GoogleGenerativeAIEmbeddings({
  model: "gemini-embedding-001",
  apiKey: process.env.GOOGLE_API_KEY!,
  maxRetries: 3,
});

export type Doc = Document<Record<string, any>>;
