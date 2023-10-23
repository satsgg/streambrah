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
