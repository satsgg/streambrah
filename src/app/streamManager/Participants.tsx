import { StreamConfig } from "../types";
import AddParticipantForm from "./addParticipantForm";
import RemoveableParticipantForm from "./removeableParticipantForm";

export default function Participants({
  streamConfig,
  setStreamConfig,
}: {
  streamConfig: StreamConfig;
  setStreamConfig: Function;
}) {
  const setParticipants = (participant: string) => {
    console.debug("setting participant", participant);
    setStreamConfig((prev: StreamConfig) => {
      const newConfig = {
        ...prev,
        p: [...prev.p, participant],
      };

      return newConfig;
    });
  };

  const removeParticipant = (participant: string) => {
    console.debug("removing participant", participant);
    setStreamConfig((prev: StreamConfig) => {
      const newConfig = {
        ...prev,
        p: prev.p.filter((p) => p !== participant),
      };

      return newConfig;
    });
  };
  return (
    <div className="flex flex-col h-full gap-4 py-2 px-4 overflow-y-scroll">
      <h1 className="text-lg font-semibold">Partitipants</h1>
      {streamConfig.p.map((value) => (
        <RemoveableParticipantForm
          key={value}
          participant={value}
          removeParticipant={removeParticipant}
        />
      ))}
      <AddParticipantForm
        participants={streamConfig.p}
        setParticipants={setParticipants}
      />
    </div>
  );
}
