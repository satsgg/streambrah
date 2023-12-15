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
import { StreamConfig } from "../types";

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
  streamConfig: StreamConfig,
  status: "planned" | "live" | "ended"
) => {
  const event: UnsignedEvent = {
    kind: 30311,
    pubkey: getPublicKey(privkey),
    created_at: Math.floor(Date.now() / 1000),
    tags: [
      ["d", streamConfig.d],
      ["title", streamConfig.title],
      ["summary", streamConfig.summary],
      ["streaming", streamConfig.streaming],
      ["starts", `${Math.floor(Date.now() / 1000)}`],
      ["status", status],
    ],
    content: "",
  };
  if (streamConfig.image) event.tags.push(["image", streamConfig.image]);
  if (streamConfig.currentParticipants)
    event.tags.push(["current_participants", streamConfig.currentParticipants]);

  // add participants
  streamConfig.p.forEach((p) => {
    event.tags.push(["p", p]);
  });

  console.log(event);
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

export const publishNowPlaying = async (
  creator: string,
  title: string,
  link: string,
  privkey: string,
  streamConfig: StreamConfig
) => {
  const event: UnsignedEvent = {
    kind: 1311,
    pubkey: getPublicKey(privkey),
    created_at: Math.floor(Date.now() / 1000),
    tags: [["a", `30311:${getPublicKey(privkey)}:${streamConfig.d}`]],
    content: `Now playing ${title} by ${creator}\n${link}`,
  };

  console.log(event);
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

// "tags": [
//   ["d", "<unique identifier>"],
//   ["title", "<name of the event>"],
//   ["summary", "<description>"],
//   ["image", "<preview image url>"],
//   ["t", "hashtag"]
//   ["streaming", "<url>"],
//   ["recording", "<url>"], // used to place the edited video once the activity is over
//   ["starts", "<unix timestamp in seconds>"],
//   ["ends", "<unix timestamp in seconds>"],
//   ["status", "<planned, live, ended>"],
//   ["current_participants", "<number>"],
//   ["total_participants", "<number>"],
//   ["p", "91cf9..4e5ca", "wss://provider1.com/", "Host", "<proof>"],
//   ["p", "14aeb..8dad4", "wss://provider2.com/nostr", "Speaker"],
//   ["p", "612ae..e610f", "ws://provider3.com/ws", "Participant"],
//   ["relays", "wss://one.com", "wss://two.com", ...]
// ],

export const DEFAULT_EVENT_CONFIG: StreamConfig = {
  pubkey: "",
  d: "",
  title: "",
  summary: "",
  streaming: "",
  status: "planned",
  prevStatus: "planned",
  currentParticipants: "0",
  p: [],
  relays: [],
};
