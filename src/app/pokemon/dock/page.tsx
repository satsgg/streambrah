"use client";
import { useEffect, useRef, useState } from "react";

const partialInput = {
  pubkey: "e9038e10916d910869db66f3c9a1f41535967308b47ce3136c98f1a6a22a6150",
  amount: 0,
};

export default function PokemonDock() {
  const [saveState, setSaveState] = useState("");
  const [loadState, setLoadState] = useState("");

  const bc = useRef(new BroadcastChannel("pokemon-dock"));
  const sendInput = (input: string) => {
    const fullInput = {
      ...partialInput,
      id: (Math.random() + 1).toString(36).substring(2),
      input: input,
    };
    bc.current.postMessage({
      action: "input",
      input: fullInput,
    });
  };

  const sendAction = (action: string, data?: string) => {
    bc.current.postMessage({
      action: action,
      data: data,
    });
  };

  useEffect(() => {
    bc.current.onmessage = (event) => {
      const type = event.data.type;
      switch (type) {
        case "save":
          console.debug("event.data", event.data);
          // navigator.clipboard.writeText(event.data.data);
          setSaveState(event.data.data);
          return;
        default:
          break;
      }
    };
  }, []);
  // TODO:
  // Input execution timer option
  // save state, load state
  // turbo button?
  return (
    <div className="w-full h-screen bg-gray-800 text-white text-sm whitespace-nowrap p-2">
      <div className="flex flex-wrap gap-x-2 gap-y-2">
        <button
          className="bg-gray-500 border rounded px-2 py-1"
          onClick={() => sendAction("play")}
        >
          Play
        </button>
        <button
          className="bg-gray-500 border rounded px-2 py-1"
          onClick={() => sendAction("pause")}
        >
          Pause
        </button>
        <button
          className="bg-gray-500 border rounded px-2 py-1"
          onClick={() => sendAction("save")}
        >
          Save
        </button>
        <label>
          <input
            readOnly
            className="text-black"
            type="text"
            value={saveState}
          />
          save state text
        </label>
        <button
          className="bg-gray-500 border rounded px-2 py-1"
          disabled={loadState === ""}
          onClick={() => sendAction("load", loadState)}
        >
          Load
        </button>
        <label>
          <input
            className="text-black"
            value={loadState}
            onChange={(e) => setLoadState(e.target.value)}
          />
          load save state
        </label>
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
