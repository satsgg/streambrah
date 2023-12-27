"use client";
import { Event as NostrEvent } from "nostr-tools";

// TODO: Start isn't working. Need to test select too
export enum Input {
  a = "KeyX",
  b = "KeyZ",
  up = "KeyW",
  left = "KeyA",
  down = "KeyS",
  right = "KeyD",
  start = "Enter",
  select = "ShiftRight",
}

// could probably just store the events themselves after validating the content...
export type InputAndAuthor = {
  input: string;
  multiplier: number;
  id: string;
  pubkey: string;
  amount: number;
};

// TODO: If zap, allow 1-9 multiplier
export const parseContent = (content: string): string | null => {
  const parsedContent = content.split(" ")[0].toLowerCase();
  if (!(parsedContent in Input)) {
    return null;
  }

  return parsedContent;
};

export const parseZapContent = (
  content: string
): { input: string; multiplier: number } | null => {
  let parsedContent = content.split(" ")[0].toLowerCase();

  let multiplier = 1;
  if (/[1-9]/.test(parsedContent.slice(-1))) {
    multiplier = parseInt(parsedContent.slice(-1));
    parsedContent = parsedContent.slice(0, -1);
  }

  if (!(parsedContent in Input)) {
    return null;
  }

  return {
    input: parsedContent,
    multiplier: multiplier,
  };
};

export const executeMove = (input: string) => {
  console.log("executing input: " + input);
  window.dispatchEvent(new KeyboardEvent("keydown", { code: input }));
  setTimeout(
    () => window.dispatchEvent(new KeyboardEvent("keyup", { code: input })),
    100
  );
};

export const stateToJson = (state: any) => {
  const jsonState = JSON.stringify(state, (key, value) => {
    if (value instanceof Uint8Array) {
      // @ts-ignore
      return Array.apply([], value);
    }
    return value;
  });
  return jsonState;
};

// export const saveGameState = (saveState: any) => {
//   console.debug("saving", saveState);
//   const jsonState = JSON.stringify(saveState, (key, value) => {
//     if (value instanceof Uint8Array) {
//       return Array.apply([], value);
//     }
//     return value;
//   });

//   localStorage.setItem("autoSave", jsonState);
//   console.debug(
//     "got save state",
//     convertJsonSaveState(localStorage.getItem("autoSave"))
//   );
//   return;
// };

export const jsonToState = (jsonSaveState: any) => {
  let saveState = JSON.parse(jsonSaveState);
  const saveStateMemoryKeys = Object.keys(saveState.wasmboyMemory);
  for (let i = 0; i < saveStateMemoryKeys.length; i++) {
    saveState.wasmboyMemory[saveStateMemoryKeys[i]] = new Uint8Array(
      saveState.wasmboyMemory[saveStateMemoryKeys[i]]
    );
  }
  return saveState;
};

export type Settings = {
  inputTimer: number;
  autoSaveTimer: number;
  autoSave: boolean;
};

export const SETTINGS_KEY = "pokemonSettings";
export const AUTOSAVE_KEY = "pokemonAutoSave";

export const DEFAULT_SETTINGS: Settings = {
  inputTimer: 2000,
  autoSaveTimer: 10,
  autoSave: true,
};

export const getSettingsFromLS = () => {
  const settingsJson = window.localStorage.getItem(SETTINGS_KEY);
  if (!settingsJson) return DEFAULT_SETTINGS;

  return JSON.parse(settingsJson);
};

export const getAutoSaveFromLS = () => {
  const autoSave = window.localStorage.getItem(AUTOSAVE_KEY);
  if (!autoSave) return "";
  return autoSave;
};
