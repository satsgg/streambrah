"use client";
import { useEffect, useState } from "react";
import { useZodForm } from "@/utils/useZodForm";
import { z } from "zod";
import { nip19, relayInit } from "nostr-tools";
import { npubToHex, validHexKey, validNpubKey } from "@/utils/nostr";
import Link from "next/link";

const Relay = ({
  relayUrl,
  relays,
  setRelays,
}: {
  relayUrl: string;
  relays: string[];
  setRelays: Function;
}) => {
  const [connected, setConnected] = useState<boolean>(false);

  useEffect(() => {
    const connect = async () => {
      const relay = relayInit(relayUrl);
      await relay.connect();
      setConnected(true);
    };

    connect();
  }, [relayUrl]);

  return (
    <div className="flex gap-x-2">
      <span className="rounded border border-gray-500 p-1 w-full">
        {connected ? "✅" : "❌"} {relayUrl}
      </span>
      <button onClick={() => setRelays(relays.filter((r) => r !== relayUrl))}>
        🗑️
      </button>
    </div>
  );
};

const AddRelayForm = ({
  relays,
  setRelays,
}: {
  relays: string[];
  setRelays: Function;
}) => {
  const {
    register,
    handleSubmit,
    setError,
    setValue,
    formState: { errors },
  } = useZodForm({
    mode: "onSubmit",
    schema: z.object({ newRelay: z.string().startsWith("wss://") }),
    defaultValues: {
      newRelay: "",
    },
  });

  const onSubmit = (data: { newRelay: string }) => {
    const relay = data.newRelay.trim();
    if (relays.includes(relay)) {
      setError("newRelay", { type: "unique", message: "Relay already exists" });
      return;
    }

    setRelays([...relays, relay]);
    setValue("newRelay", "");
  };

  return (
    <div>
      <div className="flex items-center gap-x-2">
        <form
          className="grow"
          spellCheck={false}
          onSubmit={handleSubmit(onSubmit)}
        >
          <input
            className={`${
              errors.newRelay && "focus:border-red-500"
            } focus:shadow-outline w-full min-w-[20ch] resize-none appearance-none rounded border border-gray-500 py-2 px-3 leading-tight shadow focus:border-primary focus:outline-none`}
            type="text"
            placeholder="wss://relay.current.fyi"
            autoComplete="off"
            {...register("newRelay")}
          />
        </form>
        <button
          type="submit"
          className="capitalize bg-blue-200 align-right inline-flex items-center justify-center rounded bg-primary px-3 py-2 text-sm font-semibold shadow-md transition duration-150 ease-in-out hover:bg-primary hover:shadow-lg focus:bg-primary focus:shadow-lg focus:outline-none focus:ring-0 active:bg-primary active:shadow-lg"
          disabled={errors.newRelay ? true : false}
          onClick={handleSubmit(onSubmit)}
        >
          add
        </button>
      </div>
      {errors.newRelay && <p className="text-sm">{errors.newRelay.message}</p>}
    </div>
  );
};

const PubkeyForm = ({
  pubkey,
  setPubkey,
}: {
  pubkey: string;
  setPubkey: Function;
}) => {
  const pubkeyValidator = (key: string) => {
    if (key.startsWith("npub1")) {
      if (!validNpubKey(key)) {
        return false;
      }
      let { type, data: nipData } = nip19.decode(key);
      setPubkey(nipData as string);
    } else if (!validHexKey(key)) {
      return false;
    }
    return true;
  };

  const {
    register,
    formState: { errors, isDirty },
  } = useZodForm({
    mode: "onChange",
    schema: z.object({
      pubkey: z.string().refine(pubkeyValidator, {
        message: "Invalid key",
      }),
    }),
    defaultValues: {
      pubkey: "npub1e0qhxhrmkpalvyz75wqusaahunrkkenslnadaftyjyrkchx6yrmq50umra",
    },
  });

  return (
    <div>
      <form spellCheck={false}>
        <input
          className={`${
            errors.pubkey
              ? "border-red-500 focus:border-red-500"
              : "border-gray-500 focus:border-primary"
          } focus:shadow-outline w-full min-w-[20ch] resize-none appearance-none rounded border py-2 px-3 leading-tight shadow placeholder:italic focus:outline-none`}
          type="text"
          placeholder="hex public key / npub..."
          autoComplete="off"
          {...register("pubkey")}
        />
        {errors.pubkey && <p className="text-sm ">{errors.pubkey.message}</p>}
      </form>
    </div>
  );
};

export default function ConfigureNotifications() {
  // const [pubkey, setPubkey] = useState("");
  const [pubkey, setPubkey] = useState(
    "npub1e0qhxhrmkpalvyz75wqusaahunrkkenslnadaftyjyrkchx6yrmq50umra"
  );
  const [relays, setRelays] = useState<string[]>([
    "wss://relay.damus.io",
    "wss://eden.nostr.land",
  ]);
  const [link, setLink] = useState<string>("");

  const generateLink = () => {
    const encodedRelays = relays.map(encodeURIComponent);

    let hexPubkey = pubkey;
    if (pubkey.startsWith("npub1")) {
      hexPubkey = npubToHex(pubkey);
    }
    const encodedPubkey = encodeURIComponent(hexPubkey);
    const url = `http://localhost:3000/youtube?pubkey=${encodedPubkey}&relay=${encodedRelays.join(
      "&" + "relay" + "="
    )}`;
    console.log("url", url);
    setLink(url);
  };

  return (
    <main className="flex flex-col min-h-screen p-16">
      <Link href="/">
        <h1 className="text-3xl mb-8">🎥</h1>
      </Link>

      <div className="flex justify-center">
        <div className="flex flex-col w-1/3 gap-y-4">
          <div className="flex flex-col">
            <h1 className="text-lg font-semibold">Npub / pubkey</h1>
            <PubkeyForm pubkey={pubkey} setPubkey={setPubkey} />
          </div>

          <div className="flex flex-col w-full gap-y-2">
            <h1 className="text-lg font-semibold">Relays</h1>
            {relays.map((relay) => (
              <Relay
                key={relay}
                relayUrl={relay}
                relays={relays}
                setRelays={setRelays}
              />
            ))}
            <AddRelayForm relays={relays} setRelays={setRelays} />
          </div>

          <div className="flex flex-col gap-y-2">
            <h1 className="text-lg font-semibold">Your YouTube Link</h1>
            <span className="border rounded break-all p-1">{link}</span>
            <button
              className="capitalize bg-blue-200 align-right inline-flex items-center justify-center rounded bg-primary px-3 py-2 text-sm font-semibold shadow-md transition duration-150 ease-in-out hover:bg-primary hover:shadow-lg focus:bg-primary focus:shadow-lg focus:outline-none focus:ring-0 active:bg-primary active:shadow-lg"
              onClick={generateLink}
            >
              generate link
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
