import { validHexPrivkey, validNsecKey } from "@/utils/nostr";
import { useZodForm } from "@/utils/useZodForm";
import { nip19 } from "nostr-tools";
import { z } from "zod";

// TODO: nsec doesn't work
export default function PrivkeyForm({ setPrivkey }: { setPrivkey: Function }) {
  const privkeyValidator = (key: string) => {
    if (key.startsWith("nsec1")) {
      if (!validNsecKey(key)) {
        return false;
      }
      let { type, data: nipData } = nip19.decode(key);
      console.debug("nipdata", nipData);
      setPrivkey(nipData as string);
    } else if (!validHexPrivkey(key)) {
      return false;
    }
    setPrivkey(key);
    return true;
  };

  const {
    register,
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
    <div>
      <form spellCheck={false}>
        <input
          className={`${
            errors.key
              ? "border-red-500 focus:border-red-500"
              : "border-gray-500 focus:border-primary"
          } focus:shadow-outline w-full min-w-[20ch] resize-none appearance-none rounded border py-2 px-3 leading-tight shadow placeholder:italic focus:outline-none`}
          type="text"
          placeholder="nsec / hex private key"
          autoComplete="off"
          {...register("key")}
        />
        {errors.key && <p className="text-sm ">{errors.key.message}</p>}
      </form>
    </div>
  );
}
