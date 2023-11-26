import { validHexPrivkey, validNsecKey } from "@/utils/nostr";
import { useZodForm } from "@/utils/useZodForm";
import { getPublicKey, nip19 } from "nostr-tools";
import { z } from "zod";

// TODO: nsec doesn't work
export default function PrivkeyForm({
  setPrivkey,
  setPubkey,
}: {
  setPrivkey: Function;
  setPubkey: Function;
}) {
  const privkeyValidator = (key: string) => {
    if (key.startsWith("nsec1")) {
      if (!validNsecKey(key)) return false;
    } else if (!validHexPrivkey(key)) {
      return false;
    }
    return true;
  };

  const onSubmit = (data: { key: string }) => {
    const privkey = data.key;
    if (privkey.startsWith("nsec1")) {
      let { type, data: nipData } = nip19.decode(privkey);
      setPrivkey(nipData as string);
      setPubkey(getPublicKey(nipData as string));
      return;
    }
    setPrivkey(privkey);
    setPubkey(getPublicKey(privkey));
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useZodForm({
    mode: "onChange",
    schema: z.object({
      key: z.string().refine(privkeyValidator, {
        message: "Invalid key",
      }),
    }),
    defaultValues: {
      key: "",
    },
  });

  return (
    <div className="flex flex-col gap-2">
      <form spellCheck={false} onSubmit={handleSubmit(onSubmit)}>
        <input
          className={`${
            errors.key
              ? "border-red-500 focus:border-red-500"
              : "focus:border-primary"
          } bg-gray-600 focus:shadow-outline w-full min-w-[20ch] resize-none appearance-none rounded border py-2 px-3 leading-tight shadow placeholder:italic focus:outline-none`}
          type="text"
          placeholder="nsec / hex private key"
          autoComplete="off"
          {...register("key")}
        />
        {errors.key && <p className="text-sm ">{errors.key.message}</p>}
      </form>
      <button
        className="w-full bg-gray-600 p-1 rounded hover:cursor-pointer hover:bg-gray-500"
        onClick={handleSubmit(onSubmit)}
      >
        Submit
      </button>
    </div>
  );
}
