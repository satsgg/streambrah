import { displayName } from "@/utils/nostr";
import { useProfile } from "../../useProfile";
import { InputAndAuthor } from "../util";
import { fmtMsg } from "@/utils/util";

export const InputDisplay = ({
  input,
  relays,
}: {
  input: InputAndAuthor;
  relays: string[];
}) => {
  const { profile, isLoading } = useProfile(input.pubkey, relays);

  // TODO:
  // display amount if not zero
  // make everything larger
  return (
    <div className="flex justify-between text-white py-1 text-2xl font-semibold">
      <div className="flex gap-2 items-center">
        {profile?.picture && (
          <img
            className="h-10 w-10 shrink-0 rounded-[50%]"
            src={profile.picture}
          />
        )}
        <p className="w-full">
          {fmtMsg(displayName(input.pubkey, profile), 20)}
        </p>
      </div>
      <p>{input.input}</p>
    </div>
  );
};
