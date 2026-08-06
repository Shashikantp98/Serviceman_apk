// scripts/translate.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_KEY = process.env.GOOGLE_TRANSLATE_API_KEY;
const TARGET_LANG = 'hi';
const SOURCE_FILE = path.join(__dirname, '../src/locales/en/translation.json');
const OUTPUT_FILE = path.join(__dirname, `../src/locales/${TARGET_LANG}/translation.json`);

if (!API_KEY) {
  console.error('Missing GOOGLE_TRANSLATE_API_KEY env var');
  process.exit(1);
}

async function translateText(text) {
  const res = await fetch(
    `https://translation.googleapis.com/language/translate/v2?key=${API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        q: text,
        source: 'en',
        target: TARGET_LANG,
        format: 'text',
      }),
    }
  );
  const data = await res.json();
  if (!data.data) {
    console.error('Translation API error:', JSON.stringify(data));
    throw new Error('Translation failed for: ' + text);
  }
  return data.data.translations[0].translatedText;
}

async function translateObject(obj) {
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      result[key] = await translateText(value);
      console.log(`  ${key}: "${value}" -> "${result[key]}"`);
    } else if (typeof value === 'object' && value !== null) {
      result[key] = await translateObject(value);
    }
  }
  return result;
}

async function main() {
  const source = JSON.parse(fs.readFileSync(SOURCE_FILE, 'utf8'));
  console.log(`Translating ${SOURCE_FILE} -> ${TARGET_LANG}...`);
  const translated = await translateObject(source);
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(translated, null, 2), 'utf8');
  console.log(`Done. Written to ${OUTPUT_FILE}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});