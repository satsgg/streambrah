import { AddRelayForm, Relay } from "../relays";
import { StreamConfig } from "../types";

export default function Relays({
  streamConfig,
  setStreamConfig,
}: {
  streamConfig: StreamConfig;
  setStreamConfig: Function;
}) {
  const setRelays = (relays: string[]) => {
    setStreamConfig((prev: StreamConfig) => {
      return {
        ...prev,
        relays: relays,
      };
    });
  };

  return (
    <div className="flex flex-col h-full gap-4 py-2 px-4 overflow-y-scroll">
      <div className="flex flex-col w-full gap-y-2">
        <h1 className="text-lg font-semibold">Relays</h1>
        {streamConfig.relays.map((relay) => (
          <Relay
            key={relay}
            relayUrl={relay}
            relays={streamConfig.relays}
            setRelays={setRelays}
          />
        ))}
        <AddRelayForm relays={streamConfig.relays} setRelays={setRelays} />
      </div>
    </div>
  );
}
