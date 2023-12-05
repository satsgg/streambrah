import { UserMetadata } from "@/app/store";
import { nip19, Event as NostrEvent } from "nostr-tools";
import { z } from "zod";

export const DEFAULT_RELAYS = [
  "wss://relay.damus.io",
  "wss://nostr.fmt.wiz.biz",
  "wss://nostr.oxtr.dev",
  "wss://nos.lol",
];

export const validHexPrivkey = (hexKey: string) => {
  try {
    if (!hexKey.match(/^[a-f0-9]{64}$/)) {
      throw new Error("Invalid hex private key");
    }
    let npub = nip19.nsecEncode(hexKey);
    let { type, data: nipData } = nip19.decode(npub);
    if (type !== "nsec") {
      throw new Error("Invalid hex private key");
    }
  } catch (error) {
    console.error(error);
    return false;
  }

  return true;
};

export const validHexKey = (hexKey: string) => {
  try {
    if (!hexKey.match(/^[a-f0-9]{64}$/)) {
      throw new Error("Invalid hex public key");
    }
    let npub = nip19.npubEncode(hexKey);
    let { type, data: nipData } = nip19.decode(npub);
    if (type !== "npub") {
      throw new Error("Invalid hex public key");
    }
  } catch (error) {
    console.error(error);
    return false;
  }

  return true;
};

export const validNsecKey = (nsec: string) => {
  try {
    if (nsec.length !== 63) throw new Error("Invalid nsec key length");
    let { type, data: nipData } = nip19.decode(nsec);
    if (type !== "nsec") throw new Error("Invalid nsec key");
  } catch (error) {
    console.error(error);
    return false;
  }

  return true;
};

export const validNpubKey = (npub: string) => {
  try {
    if (npub.length !== 63) throw new Error("Invalid npub key length");

    let { type, data: nipData } = nip19.decode(npub);
    if (type !== "npub") throw new Error("Invalid npub key");
  } catch (error) {
    console.error(error);
    return false;
  }

  return true;
};

export const npubToHex = (npub: string) => {
  if (!validNpubKey) throw new Error("Invalid npub key");

  let { type, data: nipData } = nip19.decode(npub);
  return nipData as string;
};

export const pubkeyValidator = (key: string) => {
  if (key.startsWith("npub1")) {
    if (!validNpubKey(key)) {
      return false;
    }
  } else if (!validHexKey(key)) {
    return false;
  }
  return true;
};

export const zPubkey = z.string().refine(pubkeyValidator, {
  message: "Invalid key",
});

export const privkeyValidator = (key: string) => {
  if (key.startsWith("nsec1")) {
    if (!validNsecKey(key)) return false;
  } else if (!validHexPrivkey(key)) {
    return false;
  }
  return true;
};

export const zPrivkey = z.string().refine(privkeyValidator, {
  message: "Invalid key",
});

export const getZapAmountFromReceipt = (zapReceipt: NostrEvent<9735>) => {
  const bolt11 = zapReceipt.tags.find((t) => t[0] == "bolt11");
  if (!bolt11 || !bolt11[1]) return null;

  const decoded = require("light-bolt11-decoder").decode(bolt11[1]);
  const index = decoded.sections.findIndex((s: any) => s.name === "amount");

  const amount = parseInt(decoded.sections[index].value) / 1000;

  return amount;
};

export type ZapRequest = {
  pubkey: string;
  created_at: number;
  id: string;
  sig: string;
  content: string;
  // tags
  relays?: string[];
  amount?: string;
  lnurl?: string;
  p: string;
  e?: string;
  a?: string;
};

export const parseZapRequest = (
  zapRequest: NostrEvent<9734>
): ZapRequest | null => {
  try {
    const pTag = zapRequest.tags.find(([t, v]) => t === "p" && v);
    if (!pTag || !pTag[1]) return null;

    let parsedZapRequest: ZapRequest = {
      pubkey: zapRequest.pubkey,
      created_at: zapRequest.created_at,
      id: zapRequest.id,
      sig: zapRequest.sig,
      content: zapRequest.content,
      p: pTag[1],
    };

    const relays = zapRequest.tags.find(([t, v]) => t === "relays" && v);
    if (relays && relays[1]) parsedZapRequest["relays"] = relays.splice(1);

    const amount = zapRequest.tags.find(([t, v]) => t === "amount" && v);
    if (amount && amount[1]) parsedZapRequest["amount"] = amount[1];

    const lnurl = zapRequest.tags.find(([t, v]) => t === "lnurl" && v);
    if (lnurl && lnurl[1]) parsedZapRequest["lnurl"] = lnurl[1];

    const e = zapRequest.tags.find(([t, v]) => t === "e" && v);
    if (e && e[1]) parsedZapRequest["e"] = e[1];

    const a = zapRequest.tags.find(([t, v]) => t === "a" && v);
    if (a && a[1]) parsedZapRequest["a"] = a[1];

    return parsedZapRequest;
  } catch (e) {
    console.error("Invalid zap request event");
  }

  return null;
};

export const displayName = (
  pubkey: string,
  profile: UserMetadata | undefined
) => {
  if (profile?.name) {
    return profile.name;
  } else if (profile?.display_name) {
    return profile.display_name;
  } else if (profile?.nip05) {
    return profile.nip05.substring(0, profile.nip05.indexOf("@"));
  } else {
    return nip19.npubEncode(pubkey);
  }
};
