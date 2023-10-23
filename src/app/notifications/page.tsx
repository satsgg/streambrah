"use client";
import { useState, useEffect, useRef } from "react";
import { Event as NostrEvent, utils } from "nostr-tools";
import { Pool } from "../Pool";
import { useSearchParams } from "next/navigation";
import { displayName, parseZapRequest } from "@/utils/nostr";
import { fmtMsg } from "@/utils/util";
import { useProfile } from "../useProfile";

const Notification = ({
  event,
  relays,
}: {
  event: NostrEvent;
  relays: string[];
}) => {
  const { profile, isLoading } = useProfile(event.pubkey, relays);

  const getAmount = (event: NostrEvent) => {
    const amount = event.tags.find(([t, v]) => t === "amount" && v);
    if (!amount) return "---";

    return Number(amount[1]) / 1000;
  };

  return (
    <div className="inline-flex min-w-0 flex-col text-white">
      {/* <div className="inline-flex min-w-0 flex-col"> */}
      <p className="text-3xl">
        <span className="font-bold text-primary whitespace-nowrap">
          {displayName(event.pubkey, profile).slice(0, 18)}
          {/* {event.pubkey.slice(0, 18)} */}
        </span>{" "}
        zapped {getAmount(event)} sats!
      </p>
      <p className="break-all text-2xl">{fmtMsg(event.content)}</p>
    </div>
  );
};

export default function Notifications() {
  const [notes, setNotes] = useState<NostrEvent[]>([]);
  const [notiVisible, setNotiVisible] = useState(false);
  const [notiQueue, setNotiQueue] = useState<NostrEvent[]>([]);
  const [noti, setNoti] = useState<NostrEvent | null>(null);
  const searchParams = useSearchParams();
  const pubkey = searchParams.get("pubkey");
  const relays = searchParams.getAll("relay");
  const now = useRef(Math.floor(Date.now() / 1000));

  useEffect(() => {
    console.log("subscribing to relays", relays);
    let sub = Pool.sub(relays, [
      {
        kinds: [9735],
        "#p": [pubkey || ""],
        // since: now.current,

        // test with old zaps
        since: now.current - 1000 * 60 * 60 * 1,
        // limit: 25,
      },
    ]);

    sub.on("event", (event: NostrEvent) => {
      const zapRequest = parseZapRequest(event);
      if (!zapRequest) return;
      setNotes((prev) => {
        return utils.insertEventIntoAscendingList(prev, zapRequest);
      });
    });

    return () => {
      Pool.close(relays);
    };
  }, []);

  useEffect(() => {
    if (notes.length > 0 && notes[0]) {
      setNotiQueue((prev) => {
        return [...prev, notes[0]];
      });
      if (!notiVisible) {
        setNotiVisible(true);
      }
    }
  }, [notes]);

  useEffect(() => {
    const currentNoti = notiQueue[0];
    if (!currentNoti) {
      return;
    }
    setNoti(currentNoti);

    if (!notiVisible) {
      setNotiVisible(true);
    }
  }, [notiVisible]);

  return (
    <main className="flex min-h-screen w-full justify-center items-center overflow-y-auto">
      {notiVisible && (
        <div
          className="flex animate-alert justify-center items-center sm:w-3/4 lg:w-1/2"
          onAnimationStart={() => {
            console.debug("queue", notiQueue);
            console.debug("now display", noti);
            setNotiQueue((prev) => {
              return [...prev.slice(1)];
            });
          }}
          onAnimationEnd={() => {
            setNoti(null);
            setNotiVisible(false);
          }}
        >
          {noti && <Notification event={noti} relays={relays} />}
        </div>
      )}
    </main>
  );
}
