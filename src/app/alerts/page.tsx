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
import useStreamConfig from "../useStreamConfig";
import { useAlertQueue } from "./useAlertQueue";

// TODO: Check for flashing?
const Alert = ({ alert, relays }: { alert: ZapAlert; relays: string[] }) => {
  const { profile, isLoading } = useProfile(alert.pubkey, relays);

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
  const [alertVisible, setAlertVisible] = useState(false);
  const searchParams = useSearchParams();
  const pubkey = searchParams.get("pubkey");
  const d = searchParams.get("d");
  const relays = searchParams.getAll("relay");
  const streamConfig = useStreamConfig();

  const { alerts, setAlerts } = useAlertQueue(
    streamConfig?.pubkey || pubkey,
    streamConfig?.d || d,
    streamConfig?.relays || relays
  );

  const bc = useRef(new BroadcastChannel("alerts-dock"));

  useEffect(() => {
    bc.current.onmessage = (event) => {
      const type = event.data.type;
      const value = event.data.value;
      console.debug("channel message", type, value);
      switch (type) {
        case "zap":
          const zap: ZapAlert = value;
          if (
            /^(start|select|up|left|down|right|a|b)[1-9]?$/.test(
              zap.content.toLowerCase()
            )
          ) {
            console.debug("pokemon input");
            return;
          }

          setAlerts((prev) => {
            if (prev.some((z) => z.id === zap.id)) {
              return prev;
            }

            return [...prev, zap];
          });
          break;
        default:
          console.error("invalid event message");
      }
    };
  }, []);

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
