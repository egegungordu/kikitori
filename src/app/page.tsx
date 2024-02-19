import SpellTest from "./spell-test";
import fs from "fs";

const PUBLIC_PATH = "./public";
const WORDS_FOLDER = "words";
const WORDS_PATH = `${PUBLIC_PATH}/${WORDS_FOLDER}`;
const SOUND_EXTENSION = ".mp3";

async function fetchWords(wordType: string) {
  const fileNames = [];
  const files = fs.readdirSync(`${WORDS_PATH}/${wordType}`);
  for (const file of files) {
    if (!file.endsWith(SOUND_EXTENSION)) {
      continue;
    }

    fileNames.push({
      path: `${WORDS_FOLDER}/${wordType}/${file}`,
      name: file.slice(0, -SOUND_EXTENSION.length),
    });
  }
  return fileNames;
}

export default async function Home() {
  const words = await fetchWords("male-names");

  return (
    <main className="w-full h-full">
      <SpellTest words={words} />
    </main>
  );
}
