import { UserMetadata, UserMetadataStore, db } from "./store";
import { useLiveQuery } from "dexie-react-hooks";
import { nip19, Event as NostrEvent } from "nostr-tools";
import { Pool } from "./Pool";

// refetch profiles after 1 day
const profileCacheDuration = 86400;

const callback = async (event: NostrEvent) => {
  const profile: UserMetadata = JSON.parse(event.content);
  console.log("fetched profile", profile);
  const profileToStore: UserMetadataStore = {
    ...profile,
    pubkey: event.pubkey,
    npub: nip19.npubEncode(event.pubkey),
    created_at: event.created_at,
    updated_at: Math.floor(Date.now() / 1000),
  };

  // only keep the newest profile event stored
  const existingProfile = await db.users.get(profileToStore.pubkey);
  if (
    !existingProfile ||
    profileToStore.created_at > existingProfile.created_at
  ) {
    await db.users.put(profileToStore);
  }
};

export const useProfile = (pubkey: string | undefined, relays: string[]) => {
  const [profile, isLoading] = useLiveQuery(
    async () => {
      if (!pubkey) return [undefined, false];
      const ret = await db.users.get(pubkey);

      if (ret) {
        // refetch profile if it's been a while
        const now = Math.floor(Date.now() / 1000);
        if (ret.updated_at + profileCacheDuration < now) {
          ret.updated_at = now;
          await db.users.put(ret);
          const sub = Pool.sub(relays, [
            {
              kinds: [0],
              authors: [pubkey],
            },
          ]);
          sub.on("event", callback);
        }

        return [ret, false];
      }

      const sub = Pool.sub(relays, [
        {
          kinds: [0],
          authors: [pubkey],
        },
      ]);
      sub.on("event", callback);

      return [undefined, false];
    },
    [pubkey],
    [undefined, true]
  );

  return { profile, isLoading };
};
