"use client";
import { useRef } from "react";

const partialInput = {
  pubkey: "e9038e10916d910869db66f3c9a1f41535967308b47ce3136c98f1a6a22a6150",
  amount: 0,
};

export default function PokemonDock() {
  const bc = useRef(new BroadcastChannel("pokemon-dock"));
  const sendInput = (input: string) => {
    const fullInput = {
      ...partialInput,
      id: (Math.random() + 1).toString(36).substring(2),
      input: input,
    };
    bc.current.postMessage(fullInput);
  };

  return (
    <div className="w-full h-screen bg-gray-700 text-white text-sm whitespace-nowrap p-2">
      <div className="flex flex-wrap gap-x-2 gap-y-2">
        <button
          className="bg-gray-500 border rounded px-2 py-1"
          onClick={() => sendInput("pause")}
        >
          Toggle pause
        </button>
        <button
          className="bg-gray-500 border rounded px-2 py-1"
          onClick={() => sendInput("a")}
        >
          A
        </button>
        <button
          className="bg-gray-500 border rounded px-2 py-1"
          onClick={() => sendInput("b")}
        >
          B
        </button>
        <button
          className="bg-gray-500 border rounded px-2 py-1"
          onClick={() => sendInput("up")}
        >
          Up
        </button>
        <button
          className="bg-gray-500 border rounded px-2 py-1"
          onClick={() => sendInput("left")}
        >
          Left
        </button>
        <button
          className="bg-gray-500 border rounded px-2 py-1"
          onClick={() => sendInput("down")}
        >
          Down
        </button>
        <button
          className="bg-gray-500 border rounded px-2 py-1"
          onClick={() => sendInput("right")}
        >
          Right
        </button>
        <button
          className="bg-gray-500 border rounded px-2 py-1"
          onClick={() => sendInput("start")}
        >
          Start
        </button>
        <button
          className="bg-gray-500 border rounded px-2 py-1"
          onClick={() => sendInput("select")}
        >
          Select
        </button>
      </div>
    </div>
  );
}
