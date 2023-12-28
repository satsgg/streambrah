import { useEffect, useRef, useState } from "react";
import { Event as NostrEvent } from "nostr-tools";
import { Pool } from "../Pool";
import { InputAndAuthor, parseContent, parseZapContent } from "./util";
import { getZapAmountFromReceipt, parseZapRequest } from "@/utils/nostr";

type Playlist = {
  nowPlaying: InputAndAuthor | null;
  queue: InputAndAuthor[];
};

export const useInputQueue = (
  pubkey: string | null,
  d: string | null,
  relays: string[]
) => {
  const [playlist, setPlaylist] = useState<Playlist>({
    nowPlaying: null,
    queue: [],
  });
  // const [playlist, setPlaylist] = useState<InputAndAuthor[]>(
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
          multiplier: 1,
          id: event.id,
          pubkey: event.pubkey,
          amount: 0,
        };
        console.debug("adding input", inputAndAuthor);
        setPlaylist((prev) => {
          if (prev.queue.some((i) => i.id === event.id)) {
            return prev;
          }
          return {
            nowPlaying: prev.nowPlaying,
            queue: [...prev.queue, inputAndAuthor],
          };
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

      const input = parseZapContent(zap.content);
      if (!input) return;

      const inputAndAuthor: InputAndAuthor = {
        input: input.input,
        multiplier: input.multiplier,
        id: zap.id,
        pubkey: zap.pubkey,
        amount: amount,
      };
      console.debug("adding input", inputAndAuthor);

      setPlaylist((prev) => {
        if (prev.queue.some((i) => i.id === zap.id)) {
          return prev;
        }
        let sortedInputs = [...prev.queue];
        // thought it would be faster to put it in front first..
        // but the sort func places newer in front if same amount
        // sortedInputs.unshift(inputAndAuthor);
        sortedInputs.push(inputAndAuthor);
        sortedInputs.sort((a, b) => b.amount - a.amount);
        return {
          nowPlaying: prev.nowPlaying,
          queue: sortedInputs,
        };
      });
    });

    return () => {
      // setPlaylist([]); will cause infinite loop with dependencies
      // why did i add it ever?
      Pool.close(relays);
    };
  }, [pubkey, d, JSON.stringify(relays)]);

  return { playlist, setPlaylist };
};
