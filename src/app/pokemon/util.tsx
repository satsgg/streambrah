import { Event as NostrEvent } from "nostr-tools";

export enum Input {
  a = "KeyX",
  b = "KeyZ",
  up = "KeyW",
  left = "KeyA",
  down = "KeyS",
  right = "KeyD",
  start = "enter",
  select = "ShiftRight",
  pause = "space",
}

// could probably just store the events themselves after validating the content...
export type InputAndAuthor = {
  input: string;
  id: string;
  pubkey: string;
  amount: number;
};

export const parseInput = (event: NostrEvent): InputAndAuthor | null => {
  const parsedContent = event.content.split(" ")[0].toLowerCase();
  if (!(parsedContent in Input)) {
    return null;
  }

  return {
    input: parsedContent,
    id: event.id,
    pubkey: event.pubkey,
    amount: 0,
  };
};

export const saveGameState = (saveState: any) => {
  console.debug("saving", saveState);
  const jsonState = JSON.stringify(saveState, (key, value) => {
    if (value instanceof Uint8Array) {
      return Array.apply([], value);
    }
    return value;
  });

  localStorage.setItem("autoSave", jsonState);
  console.debug(
    "got save state",
    loadGameState(localStorage.getItem("autoSave"))
  );
  return;
};

export const loadGameState = (jsonSaveState: any) => {
  let saveState = JSON.parse(jsonSaveState);
  const saveStateMemoryKeys = Object.keys(saveState.wasmboyMemory);
  for (let i = 0; i < saveStateMemoryKeys.length; i++) {
    saveState.wasmboyMemory[saveStateMemoryKeys[i]] = new Uint8Array(
      saveState.wasmboyMemory[saveStateMemoryKeys[i]]
    );
  }
  // await WasmBoy.loadState(saveState);
  return saveState;
};

// TODO: Checksum? Handle errors
// export const saveGameState = async (saveState) => {
//   // Convert uint8array bytes to array
//   const body = JSON.stringify(saveState, (key, value) => {
//     if (value instanceof Uint8Array) {
//       return Array.apply([], value);
//     }
//     return value;
//   });
//   const params = {
//     Bucket: "bitcoinersplaypokemon",
//     Key: "save-state.json",
//     // Body: JSON.stringify(saveState),
//     // Body: saveState,
//     Body: body,
//     ContentType: "application/json",
//   };
//   try {
//     const data = await client.send(new PutObjectCommand(params));
//     console.log(data);
//   } catch (error) {
//     console.log(error);
//   }
// };
