import { useEffect, useRef, useState } from "react";
import { Event as NostrEvent } from "nostr-tools";
import { Pool } from "../Pool";
import { ZapAlert } from "./util";
import { getZapAmountFromReceipt, parseZapRequest } from "@/utils/nostr";

export const useAlertQueue = (
  pubkey: string | null,
  d: string | null,
  relays: string[]
) => {
  const [alerts, setAlerts] = useState<ZapAlert[]>([]);
  const now = useRef(Math.floor(Date.now() / 1000));

  useEffect(() => {
    if (!pubkey || !d || relays?.length == 0) return;

    let sub = Pool.sub(relays, [
      {
        kinds: [9735],
        "#p": [pubkey || ""],
        "#a": [`30311:${pubkey}:${d}`],
        since: now.current,

        // test with old zaps
        // since: now.current - 1000 * 60 * 60 * 1,
        // limit: 25,
      },
    ]);

    sub.on("event", (event: NostrEvent<9735>) => {
      console.log("event", event);
      const zapRequestTag = event.tags.find((t) => t[0] == "description");
      if (!zapRequestTag || !zapRequestTag[1]) return;

      const zapRequest: NostrEvent<9734> = JSON.parse(zapRequestTag[1]);
      const zap = parseZapRequest(zapRequest);
      console.debug("zap", zap);
      if (!zap) return;

      const amount = getZapAmountFromReceipt(event);
      console.debug("amount", amount);
      if (!amount) return;

      // if pokemon input, return
      if (
        /^(start|select|up|left|down|right|a|b)[1-9]?$/.test(
          zap.content.toLowerCase()
        )
      ) {
        console.debug("pokemon input");
        return;
      }

      const zapAlert: ZapAlert = {
        pubkey: zap.pubkey,
        id: zap.id,
        amount: amount,
        content: zap.content,
      };

      setAlerts((prev) => {
        if (prev.some((z) => z.id === zap.id)) {
          return prev;
        }

        return [...prev, zapAlert];
      });
    });

    return () => {
      Pool.close(relays);
    };
  }, [pubkey, d, JSON.stringify(relays)]);

  return { alerts, setAlerts };
};
