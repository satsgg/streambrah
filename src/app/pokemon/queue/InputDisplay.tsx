import { displayName } from "@/utils/nostr";
import { useProfile } from "../../useProfile";
import { InputAndAuthor } from "../util";
import { fmtMsg, fmtNumber } from "@/utils/util";

export const InputDisplay = ({
  input,
  relays,
}: {
  input: InputAndAuthor;
  relays: string[];
}) => {
  const { profile, isLoading } = useProfile(input.pubkey, relays);

  const inputString = () => {
    if (input.multiplier == 1) return input.input;
    return input.input + input.multiplier;
  };

  return (
    <div className="flex justify-between text-white py-1 text-xl font-semibold items-center">
      <div className="flex gap-2 items-center">
        {profile?.picture && (
          <img
            className="h-10 w-10 shrink-0 rounded-[50%]"
            src={profile.picture}
          />
        )}
        <div>
          <p className="w-full font-semibold text-ellipsis max-w-1/3">
            {!isLoading && fmtMsg(displayName(input.pubkey, profile), 20)}
          </p>
          {input.amount > 0 && <p>⚡{fmtNumber(input.amount, true)}</p>}
          {/* <p className="">⚡{fmtNumber(input.amount, true)}</p> */}
        </div>
      </div>
      <p>{inputString()}</p>
    </div>
  );
};
