import UserDisplay from "./UserDisplay";
import RemoveParticipantSVG from "@/svgs/removeParticipant.svg";

export default function RemoveableParticipantForm({
  participant,
  removeParticipant,
}: {
  participant: string;
  removeParticipant: Function;
}) {
  return (
    <div className="flex gap-2 justify-between">
      <UserDisplay pubkey={participant} />
      <button onClick={() => removeParticipant(participant)}>
        <RemoveParticipantSVG
          height={20}
          width={20}
          strokeWidth={1.5}
          alt="Remove participant"
        />
      </button>
    </div>
  );
}
