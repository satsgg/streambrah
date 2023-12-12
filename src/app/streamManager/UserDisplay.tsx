import { DEFAULT_RELAYS, displayName } from "@/utils/nostr";
import { fmtMsg } from "@/utils/util";
import { useProfile } from "../useProfile";

export default function UserDisplay({ pubkey }: { pubkey: string }) {
  const { profile, isLoading } = useProfile(pubkey, DEFAULT_RELAYS);
  console.debug("USER DISPLAY KEY", pubkey);

  return (
    <div className="flex">
      <div className="flex gap-2 items-center max-w-1/3">
        {profile?.picture && (
          <img
            className="h-8 w-8 shrink-0 rounded-[50%]"
            src={profile.picture}
          />
        )}
        <p className="w-full text-lg font-semibold text-ellipsis max-w-1/3">
          {fmtMsg(displayName(pubkey, profile), 20)}
        </p>
      </div>
    </div>
  );
}
