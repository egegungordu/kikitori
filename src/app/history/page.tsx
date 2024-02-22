"use client";

import Link from "next/link";
import { GameResult } from "../spell-test";

import { useState, useLayoutEffect, useMemo } from "react";
import { LuArrowLeft, LuTrash } from "react-icons/lu";
import ConfirmDialog from "../confirm-dialog";

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

  const deleteGameResults = () => {
    localStorage.removeItem("gameResults");
    location.reload();
  };

  return (
    <main className="w-full h-full max-w-screen-md mx-auto px-4 py-6">
      <Link href="/">
        <LuArrowLeft className="text-2xl" />
      </Link>

      <h1 className="text-lg font-medium text-center">Game History</h1>

      <div className="flex justify-between">
        <div>
          <div className="text-xs text-neutral-400">
            Estimated storage usage: {storageUsage} KB
          </div>

          <div className="text-xs text-neutral-400">
            Total games: {gameResults.length}
          </div>
        </div>

        <ConfirmDialog
          title="You are about to clear all game history"
          description="This action cannot be undone. Are you sure you want to continue?"
          onConfirm={deleteGameResults}
        >
          <button className="text-xs text-neutral-400 hover:text-red-500 flex gap-1 items-center">
            <LuTrash />
            Clear storage
          </button>
        </ConfirmDialog>
      </div>

      <table className="table-auto tabular-nums mx-auto my-10 rounded-xl overflow-hidden">
        <thead>
          <tr className="bg-neutral-800 divide-x divide-neutral-600">
            <th className="px-4 py-2 font-normal text-neutral-400 text-xs">
              Date
            </th>
            <th className="px-4 py-2 font-normal text-neutral-400 text-xs">
              Word Types
            </th>
            <th className="px-4 py-2 font-normal text-neutral-400 text-xs">
              Speed
            </th>
            <th className="px-4 py-2 font-normal text-neutral-400 text-xs">
              Duration
            </th>
            <th className="px-4 py-2 font-normal text-neutral-400 text-xs">
              Score
            </th>
          </tr>
        </thead>
        <tbody className="text-end">
          {gameResults.map((gameResult, index) => {
            const date = new Date(gameResult.date);
            const formattedDate = date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "numeric",
              minute: "numeric",
              second: "numeric",
            });
            return (
              <tr
                key={index}
                className="divide-x divide-neutral-800 odd:bg-neutral-900 text-xs text-neutral-300 hover:text-neutral-200 hover:bg-neutral-800"
              >
                <td className="px-4 py-2">{formattedDate}</td>
                <td className="px-4 py-2 capitalize">{gameResult.wordTypes.join(", ")}</td>
                <td className="px-4 py-2">{gameResult.speed}</td>
                <td className="px-4 py-2">{gameResult.duration} seconds</td>
                <td className="px-4 py-2">{gameResult.score.toFixed(3)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </main>
  );
}
