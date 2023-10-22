import { useEffect, useRef, useState } from "react";
import { Event as NostrEvent, utils } from "nostr-tools";
import { Pool } from "../Pool";

enum Input {
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
type InputAndAuthor = {
  input: string;
  id: string;
  pubkey: string;
  amount: number;
};

const parseInput = (event: NostrEvent): InputAndAuthor | null => {
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

export const useInputQueue = (pubkey: string | null, relays: string[]) => {
  const [inputs, setInputs] = useState<InputAndAuthor[]>([]);
  const now = useRef(Math.floor(Date.now() / 1000));

  useEffect(() => {
    if (!pubkey || relays?.length == 0) return;
    console.log("subscribing to relays", relays);
    let sub = Pool.sub(relays, [
      {
        kinds: [1311],
        "#a": [`30311:${pubkey}:abcajfkfufjelkj12394`],
        since: now.current,
      },
    ]);

    sub.on("event", (event: NostrEvent) => {
      const input = parseInput(event);
      if (!input) return;
      setInputs((prevInputs) => {
        if (prevInputs.some((i) => i.id === event.id)) {
          return prevInputs;
        }
        return [...prevInputs, input];
      });
    });

    return () => {
      setInputs([]);
      Pool.close(relays);
    };
  }, []);

  return { inputs, setInputs };
};
