import "dotenv/config";
import fs from "fs";
import path from "path";
import { Document } from "@langchain/core/documents";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { FaissStore } from "@langchain/community/vectorstores/faiss";
import { geminiEmbeddings } from "./geminiLLM";

const DATASET_DIR = path.join(__dirname, "..", "docs_dataset");
const VECTOR_PATH = path.join(__dirname, "..", "faiss_store");

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
});

function cleanText(input: string) {
  if (!input) return "";
  return input
    .replace(/\u0000/g, "") // remove null chars
    .replace(/\s+/g, " ")   // collapse whitespace
    .trim();
}

async function loadFrameworkDocs(framework: string) {
  const dir = path.join(DATASET_DIR, framework);
  const files = fs.readdirSync(dir);

  console.log(`📚 Ingesting ${framework}...`);
  console.log(`Files:`, files);

  let docs: Document[] = [];

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const raw = fs.readFileSync(fullPath, "utf8");

    const cleaned = cleanText(raw);
    if (!cleaned || cleaned.length < 10) continue;

    docs.push(
      new Document({
        pageContent: cleaned,
        metadata: { framework, source: file },
      })
    );
  }

  // Split into chunks
  const chunks = await splitter.splitDocuments(docs);

  console.log(`✔️  ${framework} chunks: ${chunks.length}`);
  return chunks;
}

async function main() {
  let allChunks: Document[] = [];

  const frameworks = fs.readdirSync(DATASET_DIR);

  for (const fw of frameworks) {
    const chunks = await loadFrameworkDocs(fw);
    allChunks.push(...chunks);
  }

  // FINAL SAFETY FILTER BEFORE EMBEDDING
  allChunks = allChunks.filter(
    (d) =>
      d.pageContent &&
      d.pageContent.trim().length > 10 &&
      !d.pageContent.includes("undefined")
  );

  console.log(`\nTotal chunks: ${allChunks.length}`);

  // Build FAISS index
  console.log("\n🚀 Building FAISS index...");
  try {
    const store = await FaissStore.fromDocuments(allChunks, geminiEmbeddings);
    console.log("FAISS index built!");
    await store.save(VECTOR_PATH);
    console.log(`\n🎉 DONE — FAISS saved at: ${VECTOR_PATH}\n`);
  } catch (error) {
    console.log("Error creating FAISS index:", error);
    process.exit(1);
  }
}

main();
