"use client";

import Link from "next/link";
import { GameResult } from "../spell-test";

import { useState, useLayoutEffect, useMemo } from "react";
import { LuArrowLeft } from "react-icons/lu";

const useGameResults = () => {
  // read local storage
  const [gameResults, setGameResults] = useState<GameResult[]>([]);

  useLayoutEffect(() => {
    const gameResults = JSON.parse(localStorage.getItem("gameResults") || "[]");
    setGameResults(gameResults.reverse());
  }, []);

  return gameResults;
};

export default function History() {
  const gameResults = useGameResults();
  const storageUsage = useMemo(() => {
    return ((JSON.stringify(gameResults).length * 16) / (8 * 1024)).toFixed(2);
  }, [gameResults]);

  return (
    <main className="w-full h-full max-w-screen-md mx-auto px-4 py-6">
      <Link href="/">
        <LuArrowLeft className="text-2xl" />
      </Link>

      <h1 className="text-lg font-medium text-center">Game History</h1>

      <div className="text-xs text-neutral-400">
        Estimated storage usage: {storageUsage} KB
      </div>

      <div className="text-xs text-neutral-400">
        Total games: {gameResults.length}
      </div>

      <div className="flex flex-col items-center tabular-nums py-4">
        {gameResults.map((result, index) => (
          <div
            key={index}
            className="flex items-center p-1 divide-x divide-neutral-600"
          >
            <span className="text-xs flex flex-col px-2">
              <span>
                {new Date(result.date).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
              <span>
                {new Date(result.date).toLocaleTimeString(undefined, {
                  hour: "numeric",
                  minute: "numeric",
                })}
              </span>
            </span>

            <span className="text-xs px-2 w-12 text-end font-semibold">{result.score}</span>

            <span className="text-xs px-2 w-12 text-end font-semibold">
              {result.correct}
            </span>

            <span className="text-xs px-2 w-12 text-end font-semibold">
              {result.incorrect}
            </span>

            <span className="text-xs px-2 w-12 text-end font-semibold">
              {result.replays}
            </span>
          </div>
        ))}
      </div>
    </main>
  );
}
