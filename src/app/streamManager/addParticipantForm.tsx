import { pubkeyValidator } from "@/utils/nostr";
import { useZodForm } from "@/utils/useZodForm";
import { nip19 } from "nostr-tools";
import { z } from "zod";

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
    formState: { errors },
  } = useZodForm({
    mode: "onSubmit",
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
            className={`${
              errors.participant && "focus:border-red-500"
            } bg-gray-600 focus:shadow-outline w-full resize-none appearance-none rounded py-2 px-3 leading-tight shadow focus:border-primary focus:outline-none`}
            type="text"
            placeholder="pubkey / npub"
            autoComplete="off"
            {...register("participant")}
          />
        </form>
        <button
          type="submit"
          className="capitalize w-full bg-gray-600 hover:bg-gray-500 align-right inline-flex items-center justify-center rounded bg-primary px-3 py-2 text-sm font-semibold shadow-md transition duration-150 ease-in-out hover:bg-primary hover:shadow-lg focus:bg-primary focus:shadow-lg focus:outline-none focus:ring-0 active:bg-primary active:shadow-lg"
          disabled={errors.participant ? true : false}
          onClick={handleSubmit(onSubmit)}
        >
          add
        </button>
      </div>
      {errors.participant && (
        <p className="text-sm">{errors.participant.message}</p>
      )}
    </div>
  );
}
