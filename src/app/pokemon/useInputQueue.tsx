import { useEffect, useRef, useState } from "react";
import { Event as NostrEvent } from "nostr-tools";
import { Pool } from "../Pool";
import { InputAndAuthor, parseContent, parseInput } from "./util";
import { getZapAmountFromReceipt, parseZapRequest } from "@/utils/nostr";

const testInput = {
  input: "a",
  id: "7c15cb2fe8e8e1aa7ba92b53253facf592d0c833b163420c4e7223206c6287a8",
  pubkey: "0bed926df26089c6869621abf8b27858dd0b61f2c3c556e84fd9c08f0f499344",
  amount: 0,
};

export const useInputQueue = (
  pubkey: string | null,
  d: string | null,
  relays: string[]
) => {
  const [inputs, setInputs] = useState<InputAndAuthor[]>([]);
  // const [inputs, setInputs] = useState<InputAndAuthor[]>(
  //   Array(100).fill(testInput)
  // );
  const now = useRef(Math.floor(Date.now() / 1000));

  useEffect(() => {
    if (!pubkey || !d || relays?.length == 0) return;
    console.debug("subscribing for inputs", pubkey, d, relays);
    let sub = Pool.sub(relays, [
      {
        kinds: [1311, 9735],
        "#a": [`30311:${pubkey}:${d}`],
        since: now.current,
      },
    ]);

    sub.on("event", (event: NostrEvent<1311> | NostrEvent<9735>) => {
      if (event.kind !== 1311 && event.kind !== 9735) return;

      if (event.kind === 1311) {
        console.debug("1311", event);
        const input = parseContent(event.content);
        if (!input) return;
        const inputAndAuthor: InputAndAuthor = {
          input: input,
          id: event.id,
          pubkey: event.pubkey,
          amount: 0,
        };
        console.debug("adding input", inputAndAuthor);
        setInputs((prevInputs) => {
          if (prevInputs.some((i) => i.id === event.id)) {
            return prevInputs;
          }
          return [...prevInputs, inputAndAuthor];
        });
        return;
      }

      const zapRequestTag = event.tags.find((t) => t[0] == "description");
      if (!zapRequestTag || !zapRequestTag[1]) return;

      const zapRequest: NostrEvent<9734> = JSON.parse(zapRequestTag[1]);

      const zap = parseZapRequest(zapRequest);
      console.debug("zap", zap);
      if (!zap) return;

      const amount = getZapAmountFromReceipt(event);
      console.debug("amount", amount);
      if (!amount) return;

      const input = parseContent(zap.content);
      if (!input) return;

      const inputAndAuthor: InputAndAuthor = {
        input: input,
        id: zap.id,
        pubkey: zap.pubkey,
        amount: amount,
      };
      console.debug("adding input", inputAndAuthor);

      setInputs((prevInputs) => {
        if (prevInputs.some((i) => i.id === zap.id)) {
          return prevInputs;
        }
        let sortedInputs = [...prevInputs];
        // thought it would be faster to put it in front first..
        // but the sort func places newer in front if same amount
        // sortedInputs.unshift(inputAndAuthor);
        sortedInputs.push(inputAndAuthor);
        sortedInputs.sort((a, b) => b.amount - a.amount);
        return sortedInputs;
      });
    });

    return () => {
      // setInputs([]); will cause infinite loop with dependencies
      // why did i add it ever?
      Pool.close(relays);
    };
  }, [pubkey, d, JSON.stringify(relays)]);

  return { inputs, setInputs };
};
