import { displayName } from "@/utils/nostr";
import { useProfile } from "../../useProfile";
import { InputAndAuthor } from "../util";

export const InputDisplay = ({
  input,
  relays,
}: {
  input: InputAndAuthor;
  relays: string[];
}) => {
  const { profile, isLoading } = useProfile(input.pubkey, relays);

  return (
    <div className="flex justify-between text-white px-4 py-1 text-xl font-semibold">
      <div className="flex gap-1">
        {profile?.picture && (
          <img
            className="h-8 w-8 shrink-0 rounded-[50%]"
            src={profile.picture}
          />
        )}
        <p className="w-full">
          {displayName(input.pubkey, profile).slice(0, 15)}
          {/* {input.pubkey.slice(0, 30)} */}
        </p>
      </div>
      <p>{input.input}</p>
    </div>
  );
};
