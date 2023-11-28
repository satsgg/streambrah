import { pubkeyValidator } from "@/utils/nostr";
import { useZodForm } from "@/utils/useZodForm";
import { nip19 } from "nostr-tools";
import { z } from "zod";
import Button from "../Button";

export default function AddParticipantForm({
  participants,
  setParticipants,
}: {
  participants: string[];
  setParticipants: Function;
}) {
  const {
    register,
    handleSubmit,
    setError,
    setValue,
    formState: { errors, isValid },
  } = useZodForm({
    mode: "onChange",
    schema: z.object({
      participant: z.string().refine(pubkeyValidator, {
        message: "Invalid key",
      }),
    }),
    defaultValues: {
      participant: "",
    },
  });

  const onSubmit = (data: { participant: string }) => {
    const p = data.participant.trim();

    let pHex = p;
    // convert npub to hex
    if (p.startsWith("npub1")) {
      let { type, data: nipData } = nip19.decode(p);
      pHex = nipData as string;
    }

    if (participants.includes(pHex)) {
      setError("participant", {
        type: "unique",
        message: "Participant already exists",
      });
      return;
    }

    setParticipants(pHex);
    setValue("participant", "");
  };

  return (
    <div>
      <div className="flex flex-col items-center gap-y-2">
        <form
          className="w-full"
          spellCheck={false}
          onSubmit={handleSubmit(onSubmit)}
        >
          <input
            className={`
              ${errors.participant && "focus:border-red-500"}
              focus:shadow-outline h-8 w-full resize-none appearance-none rounded border border-gray-500 bg-gray-600 py-2 px-3 leading-tight text-white shadow placeholder:italic focus:border-primary focus:bg-slate-900 focus:outline-none
            `}
            type="text"
            placeholder="pubkey / npub"
            autoComplete="off"
            {...register("participant")}
          />
        </form>
        <Button
          className="w-full"
          disabled={!isValid}
          onClick={handleSubmit(onSubmit)}
        >
          Add
        </Button>
      </div>
      {errors.participant && (
        <p className="text-sm">{errors.participant.message}</p>
      )}
    </div>
  );
}
