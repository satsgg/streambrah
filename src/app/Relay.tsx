import { relayInit } from "nostr-tools";
import { useEffect, useState } from "react";

export default function Relay({
  relayUrl,
  relays,
  setRelays,
}: {
  relayUrl: string;
  relays: string[];
  setRelays: Function;
}) {
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
}
