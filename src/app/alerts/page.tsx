"use client";
import { useState, useEffect, useRef } from "react";
import { Event as NostrEvent, utils } from "nostr-tools";
import { Pool } from "../Pool";
import { useSearchParams } from "next/navigation";
import {
  displayName,
  getZapAmountFromReceipt,
  parseZapRequest,
} from "@/utils/nostr";
import { fmtMsg, fmtNumber } from "@/utils/util";
import { useProfile } from "../useProfile";
import { ZapAlert } from "./util";

const Alert = ({ alert, relays }: { alert: ZapAlert; relays: string[] }) => {
  const { profile, isLoading } = useProfile(alert.pubkey, relays);
  useEffect(() => {
    console.debug("zap alert mounted", alert);
    return () => {
      console.debug("zap alert unmounted", alert);
    };
  }, []);

  return (
    <div className="inline-flex min-w-0 flex-col text-white">
      <p className="text-3xl">
        <span className="font-bold text-primary whitespace-nowrap">
          {displayName(alert.pubkey, profile).slice(0, 18)}
          {/* {event.pubkey.slice(0, 18)} */}
        </span>{" "}
        zapped {fmtNumber(alert.amount, true)} sats!
      </p>
      <p className="break-all text-2xl">{fmtMsg(alert.content)}</p>
    </div>
  );
};

export default function Alerts() {
  const [alerts, setAlerts] = useState<ZapAlert[]>([]);
  const [alertVisible, setAlertVisible] = useState(false);
  const searchParams = useSearchParams();
  const pubkey = searchParams.get("pubkey");
  const relays = searchParams.getAll("relay");
  const now = useRef(Math.floor(Date.now() / 1000));

  const bc = useRef(new BroadcastChannel("alerts-dock"));

  useEffect(() => {
    console.log("subscribing to relays", relays);
    let sub = Pool.sub(relays, [
      {
        kinds: [9735],
        "#p": [pubkey || ""],
        //TODO: #a
        since: now.current,

        // test with old zaps
        // since: now.current - 1000 * 60 * 60 * 1,
        // limit: 25,
      },
    ]);

    sub.on("event", (event: NostrEvent<9735>) => {
      const zapRequestTag = event.tags.find((t) => t[0] == "description");
      if (!zapRequestTag || !zapRequestTag[1]) return;

      const zapRequest: NostrEvent<9734> = JSON.parse(zapRequestTag[1]);
      const zap = parseZapRequest(zapRequest);
      console.debug("zap", zap);
      if (!zap) return;

      const amount = getZapAmountFromReceipt(event);
      console.debug("amount", amount);
      if (!amount) return;

      const zapAlert: ZapAlert = {
        pubkey: zap.pubkey,
        id: zap.id,
        amount: amount,
        content: zap.content,
      };

      addToQueue(zapAlert);
    });

    return () => {
      Pool.close(relays);
    };
  }, []);

  useEffect(() => {
    bc.current.onmessage = (event) => {
      const type = event.data.type;
      const value = event.data.value;
      console.debug("channel message", type, value);
      switch (type) {
        case "zap":
          addToQueue(value);
          break;
        default:
          console.error("invalid event message");
      }
    };
  }, []);

  const addToQueue = (zap: ZapAlert) => {
    setAlerts((prev) => {
      if (prev.some((z) => z.id === zap.id)) {
        return prev;
      }

      return [...prev, zap];
    });
  };

  useEffect(() => {
    const currentAlert = alerts[0];
    if (!currentAlert) {
      return;
    }

    if (!alertVisible) {
      setAlertVisible(true);
    }
  }, [alertVisible]);

  useEffect(() => {
    if (alerts.length === 0) return;
    if (!alertVisible) setAlertVisible(true);
  }, [alerts]);

  return (
    <main className="flex min-h-screen w-full justify-center items-center overflow-y-auto">
      {alertVisible && (
        <div
          className="flex animate-alert justify-center items-center sm:w-3/4 lg:w-1/2"
          onAnimationStart={() => {
            console.debug("Displaying alert", alerts[0]);
          }}
          onAnimationEnd={() => {
            setAlerts((prev) => {
              return [...prev.slice(1)];
            });
            setAlertVisible(false);
          }}
        >
          {alerts[0] && <Alert alert={alerts[0]} relays={relays} />}
        </div>
      )}
    </main>
  );
}
