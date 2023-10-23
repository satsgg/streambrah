import { useEffect, useRef, useState } from "react";
import { Event as NostrEvent } from "nostr-tools";
import { Pool } from "../Pool";
import { InputAndAuthor, parseInput } from "./util";

const testInput = {
  input: "a",
  id: "7c15cb2fe8e8e1aa7ba92b53253facf592d0c833b163420c4e7223206c6287a8",
  pubkey: "0bed926df26089c6869621abf8b27858dd0b61f2c3c556e84fd9c08f0f499344",
  amount: 0,
};

export const useInputQueue = (pubkey: string | null, relays: string[]) => {
  // const [inputs, setInputs] = useState<InputAndAuthor[]>([]);
  const [inputs, setInputs] = useState<InputAndAuthor[]>(
    Array(100).fill(testInput)
  );
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
      // setInputs([]);
      Pool.close(relays);
    };
  }, []);

  return { inputs, setInputs };
};
