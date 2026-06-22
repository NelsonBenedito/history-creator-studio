import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "data");
const DATA_FILE = path.join(DATA_DIR, "cronograma.json");

async function ensureDataFile() {
  await mkdir(DATA_DIR, { recursive: true });
  try {
    await readFile(DATA_FILE, "utf-8");
  } catch {
    await writeFile(DATA_FILE, JSON.stringify([], null, 2), "utf-8");
  }
}

export async function lerCronograma() {
  await ensureDataFile();
  const raw = await readFile(DATA_FILE, "utf-8");
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function salvarCronograma(cards) {
  await ensureDataFile();
  await writeFile(DATA_FILE, JSON.stringify(cards, null, 2), "utf-8");
  return cards;
}
