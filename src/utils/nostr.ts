import { UserMetadata } from "@/app/store";
import { nip19, Event as NostrEvent } from "nostr-tools";

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

export const parseZapRequest = (note: NostrEvent): NostrEvent | null => {
  const zapRequest = note.tags.find((t) => t[0] == "description");
  if (zapRequest && zapRequest[1]) {
    try {
      const requestJson = JSON.parse(zapRequest[1]);
      if (!requestJson.tags[1] && requestJson.tags[1] === "amount") return null;
      return requestJson;
    } catch (e) {
      console.error("Invalid zap request event");
    }
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
  } else {
    return nip19.npubEncode(pubkey);
  }
};
