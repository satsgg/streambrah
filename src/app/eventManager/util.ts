import {
  UnsignedEvent,
  getEventHash,
  getPublicKey,
  getSignature,
  validateEvent,
  verifySignature,
} from "nostr-tools";
import { Pool } from "../Pool";
import { DEFAULT_RELAYS } from "@/utils/nostr";

export const signEventPrivkey = (
  unsignedEvent: UnsignedEvent,
  privKey: string | undefined
) => {
  if (!privKey) return null;
  try {
    const signedEvent = {
      ...unsignedEvent,
      id: getEventHash(unsignedEvent),
      sig: getSignature(unsignedEvent, privKey),
    };

    return signedEvent;
  } catch (err: any) {
    console.error(err);
  }

  return null;
};

export const publishLiveEvent = async (
  privkey: string,
  d: string,
  status: "planned" | "live" | "ended"
) => {
  const event: UnsignedEvent = {
    kind: 30311,
    pubkey: getPublicKey(privkey),
    created_at: Math.floor(Date.now() / 1000),
    tags: [
      ["d", d],
      ["title", "ATL BitLab Halloween Party 👻"],
      [
        "summary",
        "Streambrah hackathon project demo. Zap a YouTube link or video ID.",
      ],
      [
        "streaming",
        "https://stream.mux.com/MKBpERvbpaut3Mf500FT00wt019NXtarK00XOV4TiEazPAk.m3u8",
      ],
      [
        "image",
        "https://secure.meetupstatic.com/photos/event/3/c/a/b/600_516255531.webp?w=750",
      ],
      ["starts", `${Math.floor(Date.now() / 1000)}`],
      ["status", status],
    ],
    content: "",
  };
  console.debug("live event", event);
  const signedEvent = signEventPrivkey(event, privkey);

  // publish
  if (!signedEvent) throw new Error("Failed to sign message");
  let ok = validateEvent(signedEvent);
  if (!ok) throw new Error("Invalid event");
  let veryOk = verifySignature(signedEvent);
  if (!veryOk) throw new Error("Invalid signature");

  let pubs = Pool.publish(DEFAULT_RELAYS, signedEvent);
  await Promise.all(pubs);
  console.debug("pubs", pubs);

  return event;
};
