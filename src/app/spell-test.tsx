"use client";

import cn from "@/utils/cn";
import { useEffect, useState, useMemo, useRef } from "react";
import {
  MdReplay,
  MdSpeed,
  MdWorkspacesOutline,
  MdAccessTime,
} from "react-icons/md";
import {
  LuArrowLeft,
  LuArrowRight,
  LuCheck,
  LuInfinity,
  LuX,
  LuGithub,
  LuHistory,
  LuHome,
} from "react-icons/lu";
import Kbd from "./kbd";
import Link from "next/link";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";

const WORD_OPTIONS = [
  {
    name: "Names",
    slug: "names",
  },
  {
    name: "Adresses",
    slug: "adresses",
  },
] as const;

const SPEED_OPTIONS = [
  {
    name: "Slow",
    value: 0.5,
  },
  {
    name: "Normal",
    value: 1,
  },
  {
    name: "Fast",
    value: 1.5,
  },
] as const;

const GAME_DURATION_OPTIONS = [
  {
    name: "30 Seconds",
    value: 30,
  },
  {
    name: "2 Minutes",
    value: 120,
  },
  {
    name: "Unlimited",
    value: Infinity,
  },
] as const;

const CORRECT_POINTS = 30;
const REPLAY_PENALTY = 0.5;
const WRONG_GUESS_PENALTY = 3;
const MAX_WRONG_GUESS_PENALTY = (CORRECT_POINTS * 3) / 4;

type GameState = "idle" | "playing" | "finished";

export interface Guess {
  index: number;
  word: string;
  guesses: string[];
  replays: number;
  playedAt: number;
  playedFor: number;
  guessedAt: number;
}

export interface GameResult {
  score: number;
  correct: number;
  incorrect: number;
  replays: number;
  wordTypes: string[];
  speed: string;
  duration: number;
  date: number;
  history: Guess[];
}

export default function SpellTest({
  words,
}: {
  words: { path: string; name: string }[];
}) {
  const [gameState, setGameState] = useState<GameState>("idle");
  const [gameHistory, setGameHistory] = useState<Guess[]>([]);
  const [currentGameResult, setCurrentGameResult] = useState<GameResult | null>(
    null,
  );
  const [selectedWordTypes, setSelectedWordTypes] = useState<{
    [key: string]: boolean;
  }>({
    names: true,
  });
  const [selectedSpeed, setSelectedSpeed] = useState<number>(
    SPEED_OPTIONS[1].value,
  );
  const [selectedDuration, setSelectedDuration] = useState<number>(
    GAME_DURATION_OPTIONS[0].value,
  );
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  const [wordsShuffled, setWordsShuffled] = useState(() =>
    words.sort(() => Math.random() - 0.5),
  );

  const startPlaying = () => {
    const newWordsShuffled = words.sort(() => Math.random() - 0.5);
    const newCurrentWordIndex = 0;
    setWordsShuffled(newWordsShuffled);
    setCurrentWordIndex(newCurrentWordIndex);
    setGameState("playing");
    setGameHistory([
      {
        index: newCurrentWordIndex,
        word: newWordsShuffled[newCurrentWordIndex].name,
        guesses: [],
        replays: 0,
        playedAt: Date.now(),
        playedFor: 0,
        guessedAt: 0,
      },
    ]);
  };

  const stopPlaying = () => {
    setGameState("idle");
    setCurrentWordIndex(0);
    setGameHistory([]);
    setCurrentGameResult(null);
  };

  const endGame = () => {
    setGameState("finished");

    // create new game result
    const { correct, incorrect, replays, nonNormalizedScore } = gameHistory.reduce(
      (acc, guess) => {
        const lastGuess = guess.guesses.at(guess.guesses.length - 1);

        if (lastGuess === guess.word) {
          acc.correct++;
          acc.incorrect += guess.guesses.length - 1;
        } else if (lastGuess) {
          acc.incorrect += guess.guesses.length;
        }

        acc.replays += guess.replays;

        const rightGuesses = guess.guesses.filter(
          (word) => word === guess.word,
        ).length;
        const wrongGuesses = guess.guesses.length - rightGuesses;
        const replays = guess.replays;
        const replayPenalty = Math.pow(REPLAY_PENALTY, replays);
        const wrongGuessPenalty = Math.max(
          -MAX_WRONG_GUESS_PENALTY,
          -wrongGuesses * WRONG_GUESS_PENALTY,
        );

        acc.nonNormalizedScore +=
          rightGuesses * CORRECT_POINTS * replayPenalty + wrongGuessPenalty;

        return acc;
      },
      { correct: 0, incorrect: 0, replays: 0, nonNormalizedScore: 0 },
    );

    // last - first
    // 1 if no history
    const duration = (gameHistory.at(gameHistory.length - 1)?.playedAt ?? 1) - (gameHistory.at(0)?.playedAt ?? 0);

    const score = nonNormalizedScore / duration * 10000;

    const gameResult: GameResult = {
      score,
      correct,
      incorrect,
      replays,
      wordTypes: Object.entries(selectedWordTypes)
        .filter(([, value]) => value)
        .map(([key]) => key),
      speed: SPEED_OPTIONS.find((speed) => speed.value === selectedSpeed)!.name,
      duration: selectedDuration,
      date: Date.now(),
      history: gameHistory,
    };

    setCurrentGameResult(gameResult);

    // get from local storage
    const gameResults = localStorage.getItem("gameResults");

    if (gameResults) {
      const parsedGameResults = JSON.parse(gameResults) as GameResult[];
      parsedGameResults.push(gameResult);
      localStorage.setItem("gameResults", JSON.stringify(parsedGameResults));
    } else {
      localStorage.setItem("gameResults", JSON.stringify([gameResult]));
    }
  };

  const goToNext = () => {
    if (currentWordIndex === wordsShuffled.length - 1) {
      endGame();
    } else {
      setCurrentWordIndex(currentWordIndex + 1);

      setGameHistory((prev) => [
        ...prev,
        {
          index: currentWordIndex,
          word: wordsShuffled[currentWordIndex + 1].name,
          guesses: [],
          replays: 0,
          playedAt: Date.now(),
          playedFor: 0,
          guessedAt: 0,
        },
      ]);
    }
  };

  const handleTimeout = () => {
    const lastGuess = gameHistory.at(gameHistory.length - 1)!;

    endGame();
  };

  const toggleWordType = (slug: string) => {
    if (
      Object.values(selectedWordTypes).filter(Boolean).length === 1 &&
      selectedWordTypes[slug]
    ) {
      return;
    }
    setSelectedWordTypes((prev) => ({
      ...prev,
      [slug]: !prev[slug],
    }));
  };

  const handleSpeedChange = (value: number) => {
    setSelectedSpeed(value);
  };

  const handleDurationChange = (value: number) => {
    setSelectedDuration(value);
  };

  const submitWord = (word: string) => {
    const lastGuess = gameHistory.at(gameHistory.length - 1)!;

    setGameHistory((prev) => [
      ...prev.slice(0, -1),
      {
        ...lastGuess,
        guesses: [...lastGuess.guesses, word],
        guessedAt: Date.now(),
      },
    ]);

    if (word === wordsShuffled[currentWordIndex].name) {
      goToNext();

      return true;
    }

    return false;
  };

  const replayWord = () => {
    const lastGuess = gameHistory.at(gameHistory.length - 1)!;

    setGameHistory((prev) => [
      ...prev.slice(0, -1),
      {
        ...lastGuess,
        replays: lastGuess.replays + 1,
      },
    ]);
  };

  const handleAudioLoad = (duration: number) => {
    const lastGuess = gameHistory.at(gameHistory.length - 1)!;

    setGameHistory((prev) => [
      ...prev.slice(0, -1),
      {
        ...lastGuess,
        playedFor: duration,
      },
    ]);
  };

  useWindowEvent("keydown", (e) => {
    if (e.key === "Escape") {
      setGameState("idle");
    }
  });

  return (
    <div className="w-full max-w-screen-md mx-auto h-full flex flex-col pt-8 md:pt-16 pb-8">
      <div className="max-w-screen-lg mx-auto font-bold mb-6 flex flex-col sm:flex-row items-center gap-3 px-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/title.svg" alt="Kikitori" className="w-20" />

        <p className="font-normal text-neutral-400 text-xs text-center">
          Practice your English hearing skills by typing out the spelling of the
          words
        </p>
      </div>

      <div
        className={cn(
          "flex flex-col md:flex-row items-start mx-auto max-w-fit justify-center gap-2 bg-neutral-900 p-1 rounded-3xl md:rounded-full",
          {
            "opacity-50": gameState === "playing",
          },
        )}
      >
        <div className="flex gap-1 items-center bg-neutral-800 rounded-full px-3 py-1 text-xs font-medium">
          <MdWorkspacesOutline className="text-neutral-500 text-base" />

          {WORD_OPTIONS.map(({ name, slug }) => (
            <button
              disabled={gameState === "playing"}
              key={slug}
              onClick={() => toggleWordType(slug)}
              className={cn(
                "text-neutral-500 p-2 rounded-full hover:text-neutral-400 transition-all duration-150",
                {
                  "text-neutral-200 hover:text-neutral-200":
                    selectedWordTypes[slug],
                },
              )}
            >
              {name}
            </button>
          ))}
        </div>

        <div className="flex gap-1 items-center bg-neutral-800 rounded-full px-3 py-1 text-xs font-medium">
          <MdSpeed className="text-neutral-500 text-base" />

          {SPEED_OPTIONS.map(({ name, value }) => (
            <button
              key={value}
              disabled={gameState === "playing"}
              onClick={() => handleSpeedChange(value)}
              className={cn(
                "text-neutral-500 p-2 rounded-full hover:text-neutral-400 transition-all duration-150",
                {
                  "text-neutral-200 hover:text-neutral-200":
                    selectedSpeed === value,
                },
              )}
            >
              {name}
            </button>
          ))}
        </div>

        <div className="flex gap-1 items-center bg-neutral-800 rounded-full px-3 py-1 text-xs font-medium">
          <MdAccessTime className="text-neutral-500 text-base" />

          {GAME_DURATION_OPTIONS.map(({ name, value }) => (
            <button
              key={value}
              disabled={gameState === "playing"}
              onClick={() => handleDurationChange(value)}
              className={cn(
                "text-neutral-500 p-2 rounded-full hover:text-neutral-400 transition-all duration-150 whitespace-nowrap",
                {
                  "text-neutral-200 hover:text-neutral-200":
                    selectedDuration === value,
                },
              )}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      <div className="my-auto mx-auto max-w-md px-4 sm:px-10 pt-4">
        {gameState == "playing" && (
          <div className="mb-10">
            <button
              onClick={stopPlaying}
              className="flex items-center gap-2 text-xs hover:bg-neutral-800 px-3 py-1 rounded-full"
            >
              <LuArrowLeft className="w-5 h-5" />
              <Kbd>Esc</Kbd>
              Exit
            </button>
          </div>
        )}

        {gameState === "playing" ? (
          <PlayingScreen
            submitWord={submitWord}
            replayWord={replayWord}
            onTimeout={handleTimeout}
            onAudioLoad={handleAudioLoad}
            word={wordsShuffled[currentWordIndex]}
            speed={selectedSpeed}
            duration={selectedDuration}
            gameHistory={gameHistory}
          />
        ) : gameState === "finished" ? (
          <ResultScreen
            restartGame={startPlaying}
            home={stopPlaying}
            gameResult={currentGameResult!}
          />
        ) : (
          <IntroScreen
            startPlaying={startPlaying}
            duration={selectedDuration}
          />
        )}
      </div>

      <div className="flex justify-center mt-2">
        <a
          href="https://www.github.com/egegungordu"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-2xs text-neutral-400 hover:text-neutral-300"
        >
          <LuGithub className="w-4 h-4" />
          GitHub
        </a>
      </div>
    </div>
  );
}

function ResultScreen({
  restartGame,
  home,
  gameResult,
}: {
  restartGame: () => void;
  home: () => void;
  gameResult: GameResult;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const { isHighScore, highScore } = useMemo(() => {
    const allGameResults = JSON.parse(
      localStorage.getItem("gameResults") || "[]",
    );

    // only consider the high score if the duration is the same
    const highScore = Math.max(
      ...allGameResults
        .filter((r: GameResult) => r.duration === gameResult.duration)
        .map((r: GameResult) => r.score),
      0,
    );

    return {
      isHighScore: gameResult.score >= highScore,
      highScore,
    };
  }, [gameResult]);

  useWindowEvent("keydown", (e) => {
    if (e.key === " ") {
      restartGame();
    }
  });

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.2;
    }

    if (videoRef.current) {
      videoRef.current.volume = 0.2;
    }
  }, []);

  const { width, height } = useWindowSize();

  return (
    <>
      {isHighScore && <Confetti width={width} height={height} />}

      <div className="flex flex-col gap-4 items-center justify-center animate-pop-in">
        {isHighScore && <audio ref={audioRef} src="/chipi.mp3" autoPlay loop />}

        <div className="text-3xl font-semibold text-neutral-200 text-center">
          {isHighScore ? "🎉 New high score! 🎉" : "Nice try!"}
        </div>

        <div className="text-center text-neutral-400 text-xs">
          {!isHighScore && (
            <>
              Your high score was <span className="font-bold">{highScore.toFixed(3)}</span>{" "}
              points.{" "}
            </>
          )}
          You scored:
        </div>

        <div className="flex relative isolate justify-center items-center gap-2 px-12 py-8">
          <div className="text-6xl font-semibold drop-shadow-hard">
            {gameResult.score.toFixed(3)}
          </div>

          <span className="inline text-neutral-300 text-xs drop-shadow-hard">
            points
          </span>

          {isHighScore && (
            <div className="absolute items-center justify-center -z-10 -m-1 inset-0 rounded-3xl flex overflow-hidden">
              <div className="h-[350%] aspect-square bg-rainbow animate-spin" />
            </div>
          )}

          {/* eslint-disable-next-line @next/next/no-img-element */}
          {isHighScore && (
            <img
              src="/chipi.gif"
              alt="Chipi"
              className="-z-10 absolute opacity-95 rounded-3xl border border-neutral-700 shadow-2xl shadow-white/20 w-full h-full object-cover"
            />
          )}

          {!isHighScore && (
            <video
              ref={videoRef}
              src="/sad.mp4"
              autoPlay
              loop
              className="absolute -z-10 w-full h-full object-cover rounded-3xl border border-neutral-700 shadow-2xl ring ring-white/80"
            />
          )}
        </div>

        <div className="flex gap-2">
          <button
            className="px-4 py-2 rounded-full text-neutral-300 flex items-center gap-2 hover:bg-neutral-800"
            onClick={home}
          >
            <LuHome className="w-4 h-4" />
            Home
          </button>

          <button
            className="px-4 py-2 rounded-full bg-neutral-200 text-neutral-900 flex items-center gap-2 hover:bg-neutral-300"
            onClick={restartGame}
          >
            Play again
            <Kbd>Space</Kbd>
          </button>
        </div>
      </div>
    </>
  );
}

function Timer({
  duration,
  onTimeUp,
  isRunning,
}: {
  duration: number;
  onTimeUp?: () => void;
  isRunning: boolean;
}) {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    if (isRunning) {
      const interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isRunning]);

  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeUp?.();
    }
  }, [timeLeft, onTimeUp]);

  const yabai = timeLeft < 10;

  if (duration === Infinity) {
    return (
      <div className="flex items-center gap-2 justify-center text-3xl font-bold text-neutral-300 tabular-nums">
        <MdAccessTime className="text-neutral-500 text-2xl" />
        <LuInfinity className="w-9 h-9" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2 justify-center text-3xl font-bold text-neutral-300 tabular-nums",
        {
          "text-red-500 animate-pulse": yabai,
        },
      )}
    >
      <MdAccessTime className="text-neutral-500 text-2xl" />
      <span>
        {Math.floor(timeLeft / 60)}:
        {Math.floor(timeLeft % 60)
          .toString()
          .padStart(2, "0")}
      </span>
    </div>
  );
}

function useWindowEvent<K extends keyof WindowEventMap>(
  type: K,
  listener: (this: Window, ev: WindowEventMap[K]) => any,
  options?: boolean | AddEventListenerOptions,
) {
  useEffect(() => {
    window.addEventListener(type, listener, options);
    return () => {
      window.removeEventListener(type, listener, options);
    };
  }, [type, listener, options]);
}

interface CorrectNotification {
  action: "correct";
  word: string;
}

interface IncorrectNotification {
  action: "incorrect";
}

interface ReplayNotification {
  action: "replay";
}

type Notification =
  | CorrectNotification
  | IncorrectNotification
  | ReplayNotification;

function NotificationPopup({
  notification,
}: {
  notification: Notification | null;
}) {
  return (
    <div className="w-36 h-6 flex justify-center">
      {notification && (
        <div
          className={cn(
            "rounded-full absolute text-xs font-semibold animate-notification-in text-neutral-800 px-3 py-1 flex items-center gap-2",
            {
              "bg-green-500": notification.action === "correct",
              "bg-red-500": notification.action === "incorrect",
              "bg-neutral-300": notification.action === "replay",
            },
          )}
        >
          {notification?.action === "correct" ? (
            <span>Correct! &quot;{notification?.word}&quot;</span>
          ) : notification?.action === "incorrect" ? (
            <span>Incorrect</span>
          ) : notification?.action === "replay" ? (
            <span>Replay</span>
          ) : null}
        </div>
      )}
    </div>
  );
}

function PlayingScreen({
  submitWord,
  replayWord,
  onTimeout,
  onAudioLoad,
  word,
  speed,
  duration,
  gameHistory,
}: {
  submitWord: (guess: string) => boolean;
  replayWord: () => void;
  onTimeout: () => void;
  onAudioLoad: (duration: number) => void;
  word: { path: string; name: string };
  speed: number;
  duration: number;
  gameHistory: Guess[];
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const lastNotificationTimeout = useRef<NodeJS.Timeout | null>(null);
  const [notification, setNotification] = useState<Notification | null>(null);
  const [input, setInput] = useState("");
  const buttonDisabled = !input.trim();
  const { correct, incorrect, replays } = useMemo(
    () =>
      gameHistory.reduce(
        (acc, guess) => {
          const lastGuess = guess.guesses.at(guess.guesses.length - 1);

          if (lastGuess === guess.word) {
            acc.correct++;
            acc.incorrect += guess.guesses.length - 1;
          } else if (lastGuess) {
            acc.incorrect += guess.guesses.length;
          }

          acc.replays += guess.replays;

          return acc;
        },
        { correct: 0, incorrect: 0, replays: 0 },
      ),
    [gameHistory],
  );

  const submitWord_ = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const correct = submitWord(input.trim().toLowerCase());

    if (correct) {
      setInput("");
      triggerCorrectNotification(input);
    } else {
      triggerIncorrectNotification();
    }

    focusInput();
  };

  const triggerIncorrectNotification = () => {
    if (lastNotificationTimeout.current) {
      clearTimeout(lastNotificationTimeout.current);
    }
    setNotification({ action: "incorrect" });
    lastNotificationTimeout.current = setTimeout(() => {
      setNotification(null);
    }, 800);
  };

  const triggerCorrectNotification = (word: string) => {
    if (lastNotificationTimeout.current) {
      clearTimeout(lastNotificationTimeout.current);
    }
    setNotification({ action: "correct", word });
    lastNotificationTimeout.current = setTimeout(() => {
      setNotification(null);
    }, 1500);
  };

  const triggerReplayNotification = () => {
    if (lastNotificationTimeout.current) {
      clearTimeout(lastNotificationTimeout.current);
    }
    setNotification({ action: "replay" });
    lastNotificationTimeout.current = setTimeout(() => {
      setNotification(null);
    }, 800);
  };

  const replay = () => {
    replayWord();
    triggerReplayNotification();

    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      focusInput();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value.replace(/[^a-zA-Z]/g, ""));
  };

  const focusInput = () => {
    inputRef.current?.focus();
  };

  useWindowEvent("keydown", (e) => {
    if (e.key === " ") {
      replay();
    }
  });

  useEffect(() => {
    const audioRefCurrent = audioRef.current;
    const progressRefCurrent = progressRef.current;
    if (!audioRefCurrent || !progressRefCurrent) return;

    audioRefCurrent.playbackRate = speed;

    const timeUpdateCallback = () => {
      const currentTime = audioRefCurrent.currentTime;
      const duration = audioRefCurrent.duration;
      const progress = (currentTime / duration) * 100;
      progressRefCurrent.style.width = `${progress}%`;
    };

    const loadedMetadataCallback = () => {
      onAudioLoad(audioRefCurrent.duration);
    };

    audioRefCurrent.addEventListener("timeupdate", timeUpdateCallback);
    audioRefCurrent.addEventListener("loadedmetadata", loadedMetadataCallback);

    return () => {
      audioRefCurrent.removeEventListener("timeupdate", timeUpdateCallback);
      audioRefCurrent.removeEventListener(
        "loadedmetadata",
        loadedMetadataCallback,
      );
    };
  });

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.playbackRate = speed;
  }, [speed]);

  return (
    <div className="flex flex-col gap-4 items-center mt-6 relative group animate-pop-in">
      <audio ref={audioRef} hidden autoPlay src={word.path} />

      <NotificationPopup
        notification={notification}
      />

      <Timer
        key={duration}
        duration={duration}
        isRunning={true}
        onTimeUp={onTimeout}
      />

      <Stats
        n={gameHistory.length}
        correct={correct}
        incorrect={incorrect}
        replays={replays}
      />

      <div className="w-full bg-neutral-800 rounded-full h-1 hidden">
        <div ref={progressRef} className="bg-neutral-300 h-full rounded-full" />
      </div>

      <form
        className={cn("gap-2 flex", {
          "animate-shake": notification?.action === "incorrect",
        })}
        onSubmit={submitWord_}
      >
        <input
          ref={inputRef}
          type="text"
          placeholder="Type the word"
          autoFocus
          value={input}
          onChange={handleInputChange}
          // onKeyDown={handleInputKeyDown}
          className="bg-transparent text-neutral-200 focus:outline-none border-b border-neutral-200"
        />

        <button
          disabled={buttonDisabled}
          className="disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-full flex items-center gap-2 hover:bg-neutral-300 bg-neutral-200 text-neutral-800"
          type="submit"
        >
          <LuArrowRight />
          Submit
          <Kbd>Enter</Kbd>
        </button>

        <button
          type="button"
          onClick={focusInput}
          className="absolute w-full h-full inset-0 group-focus-within:hidden backdrop-blur-sm grid place-items-center font-medium text-base drop-shadow-md bg-neutral-950/40 select-none"
        >
          Click here to continue
        </button>
      </form>

      <button
        type="button"
        onClick={replay}
        className="flex gap-2 items-center rounded-full px-4 text-xs py-2 hover:bg-neutral-800"
      >
        <MdReplay />
        Replay
        <Kbd>Space</Kbd>
      </button>
    </div>
  );
}

function Stats({
  n,
  correct,
  incorrect,
  replays,
}: {
  n: number;
  correct: number;
  incorrect: number;
  replays: number;
}) {
  return (
    <div className="flex gap-2 items-center justify-center text-neutral-500 font-medium tabular-nums w-full">
      <div className="flex gap-1 items-center mr-auto">
        <span>Word {n}:</span>
      </div>
      <div className="flex gap-1 items-center w-12">
        <LuCheck className="text-green-500/70" />
        <span>{correct}</span>
      </div>
      <div className="flex gap-1 items-center w-12">
        <LuX className="text-red-500/70" />
        <span>{incorrect}</span>
      </div>
      <div className="flex gap-1 items-center w-12">
        <MdReplay className="text-neutral-500" />
        <span>{replays}</span>
      </div>
    </div>
  );
}

function IntroScreen({
  startPlaying,
  duration,
}: {
  startPlaying: () => void;
  duration: number;
}) {
  useWindowEvent("keydown", (e) => {
    if (e.key === " ") {
      startPlaying();
    }
  });

  return (
    <div className="flex flex-col gap-3 items-center p-10">
      <Timer key={duration} duration={duration} isRunning={false} />

      <button
        className="px-4 py-2 rounded-full bg-neutral-200 text-neutral-900 flex items-center gap-2 hover:bg-neutral-300"
        onClick={startPlaying}
      >
        Start
        <Kbd>Space</Kbd>
      </button>

      <Link
        href="/history"
        className="flex items-center gap-2 text-2xs hover:bg-neutral-800 px-3 py-1 rounded-full text-neutral-300"
      >
        <LuHistory className="w-3 h-3" />
        View play history
      </Link>
    </div>
  );
}
