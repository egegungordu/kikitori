"use client";

import cn from "@/utils/cn";
import { useEffect, useState, useMemo, useRef } from "react";
import {
  MdReplay,
  MdSpeed,
  MdWorkspacesOutline,
  MdAccessTime,
} from "react-icons/md";
import { LuLoader } from "react-icons/lu";
import Kbd from "./kbd";

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
    name: "1 Minute",
    value: 60,
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

export default function SpellTest({
  words,
}: {
  words: { path: string; name: string }[];
}) {
  const [isPlaying, setIsPlaying] = useState(false);
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

  const wordsShuffled = useMemo(() => {
    return words.sort(() => Math.random() - 0.5);
  }, [words]);

  const startPlaying = () => {
    setIsPlaying(true);
  };

  const goToNext = () => {
    if (currentWordIndex === wordsShuffled.length - 1) {
      setIsPlaying(false);
      setCurrentWordIndex(0);
    } else {
      setCurrentWordIndex(currentWordIndex + 1);
    }
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

  const selectedWordsTitle = useMemo(() => {
    const selectedWords = WORD_OPTIONS.filter(
      ({ slug }) => selectedWordTypes[slug],
    ).map(({ name }) => name);

    return selectedWords.join(", ");
  }, [selectedWordTypes]);

  return (
    <div className="w-full max-w-screen-md mx-auto h-full flex flex-col py-20">
      <div className="flex flex-col md:flex-row items-start mx-auto max-w-fit justify-center gap-2 bg-neutral-900 p-1 rounded-3xl md:rounded-full">
        <div className="flex gap-1 items-center bg-neutral-800 rounded-full px-3 py-1 text-xs font-medium">
          <MdWorkspacesOutline className="text-neutral-500 text-base" />

          {WORD_OPTIONS.map(({ name, slug }) => (
            <button
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

      <div className="my-auto mx-auto max-w-md">
        <h1 className="text-xs text-neutral-300">Spell Test</h1>
        <h2 className="text-lg font-bold">{selectedWordsTitle}</h2>

        {isPlaying ? (
          <PlayingScreen
            goToNext={goToNext}
            word={wordsShuffled[currentWordIndex]}
            speed={selectedSpeed}
            duration={selectedDuration}
          />
        ) : (
          <IntroScreen startPlaying={startPlaying} />
        )}
      </div>
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

function PlayingScreen({
  goToNext,
  word,
  speed,
  duration,
}: {
  goToNext: () => void;
  word: { path: string; name: string };
  speed: number;
  duration: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [wrongAnswer, setWrongAnswer] = useState(false);
  const [input, setInput] = useState("");
  const buttonDisabled = !input.trim();

  const submitWord = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (input.trim().toLowerCase() === word.name.toLowerCase()) {
      goToNext();
      setInput("");
    } else {
      triggerWrongAnswer();
    }

    focusInput();
  };

  const triggerWrongAnswer = () => {
    setWrongAnswer(true);
    setTimeout(() => {
      setWrongAnswer(false);
    }, 300);
  };

  const replay = () => {
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

    audioRefCurrent.addEventListener("timeupdate", timeUpdateCallback);

    return () => {
      audioRefCurrent.removeEventListener("timeupdate", timeUpdateCallback);
    };
  });

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.playbackRate = speed;
  }, [speed]);

  return (
    <div className="flex flex-col gap-3 items-center p-10 relative group">
      <audio ref={audioRef} hidden autoPlay src={word.path} />

      <div className="w-full bg-neutral-800 rounded-full h-1">
        <div ref={progressRef} className="bg-neutral-300 h-full rounded-full" />
      </div>

      <form
        data-wrong={wrongAnswer}
        className="gap-2 flex data-[wrong='true']:animate-shake"
        onSubmit={submitWord}
      >
        <input
          ref={inputRef}
          type="text"
          placeholder="Type the word"
          autoFocus
          value={input}
          onChange={handleInputChange}
          className="bg-transparent text-neutral-200 focus:outline-none border-b border-neutral-200"
        />

        <button
          disabled={buttonDisabled}
          className="disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-full bg-neutral-200 text-neutral-900 flex items-center gap-2 hover:bg-neutral-300"
          type="submit"
        >
          Submit
          <Kbd>Enter</Kbd>
        </button>

        <button
          onClick={focusInput}
          className="absolute w-full h-full inset-0 group-focus-within:hidden backdrop-blur-lg grid place-items-center font-medium text-base drop-shadow-md bg-neutral-950/40 select-none"
        >
          Click here to continue
        </button>
      </form>

      <button
        type="button"
        onClick={replay}
        className="flex gap-2 items-center rounded-full bg-neutral-200 border border-sky-400 text-neutral-900 px-3 text-xs py-1 hover:bg-neutral-300"
      >
        <MdReplay />
        Replay
        <Kbd>Space</Kbd>
      </button>
    </div>
  );
}

function IntroScreen({ startPlaying }: { startPlaying: () => void }) {
  useWindowEvent("keydown", (e) => {
    if (e.key === " ") {
      startPlaying();
    }
  });

  return (
    <div className="flex flex-col gap-4 items-center p-10">
      <button
        className="px-4 py-2 rounded-full bg-neutral-200 text-neutral-900 flex items-center gap-2 hover:bg-neutral-300"
        onClick={startPlaying}
      >
        Start
        <Kbd>Space</Kbd>
      </button>
    </div>
  );
}
