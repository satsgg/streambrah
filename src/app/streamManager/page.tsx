"use client";
import { useEffect, useState, useRef } from "react";
import OBSWebSocket from "obs-websocket-js";
import PrivkeyForm from "./privkeyForm";
import {
  DEFAULT_EVENT_CONFIG,
  publishLiveEvent,
  publishNowPlaying,
} from "./util";
import { useZodForm } from "@/utils/useZodForm";
import { z } from "zod";
import { FieldError } from "react-hook-form";
import StreamDisplay from "./streamDisplay";
import AddParticipantForm from "./addParticipantForm";
import RemoveableParticipantForm from "./removeableParticipantForm";
import { STREAM_CONFIG_CHANNEL, STREAM_CONFIG_KEY } from "../constants";
import { StreamConfig } from "../types";
import { AddRelayForm, Relay } from "../relays";
import Button from "../Button";

const Input = ({
  name,
  placeholder,
  register,
  formKey,
  error,
}: {
  name: string;
  placeholder: string;
  register: Function;
  formKey: string;
  error: FieldError | undefined;
}) => {
  return (
    <div>
      <label className="text-sm capitalize">{name}</label>
      <input
        className={`
          ${error && "focus:border-red-500"}
          focus:shadow-outline h-8 w-full resize-none appearance-none rounded border border-gray-500 bg-gray-600 py-2 px-3 leading-tight text-white shadow placeholder:italic focus:border-primary focus:bg-slate-900 focus:outline-none
        `}
        type="text"
        placeholder={placeholder}
        autoComplete="off"
        {...register(formKey)}
      />
      {error && <p className="text-sm ">{error.message}</p>}
    </div>
  );
};

const loadLocalStorageConfig = (): StreamConfig | null => {
  if (typeof window === "undefined") return null;
  const storeConfig = localStorage.getItem(STREAM_CONFIG_KEY);
  if (!storeConfig) return null;
  let config: StreamConfig = JSON.parse(storeConfig);
  config.p = [];

  return config;
};

// TODO: Hashtags, relays
// use multiple pages instead of views
export default function EventManager() {
  const [connected, setConnected] = useState(false);
  const [view, setView] = useState<
    "home" | "participants" | "relays" | "settings"
  >("home");
  const [privkey, setPrivkey] = useState<string>("");
  const [pubkey, setPubkey] = useState<string>("");
  // TODO: check if loadLocalStorage is running unnecessarily...
  const [streamConfig, setStreamConfig] = useState<StreamConfig>(
    loadLocalStorageConfig() ?? DEFAULT_EVENT_CONFIG
  );

  useEffect(() => {
    if (streamConfig.pubkey === pubkey) return;
    setStreamConfig((prev) => {
      return {
        ...prev,
        pubkey: pubkey,
      };
    });
  }, [streamConfig.pubkey, pubkey]);

  const obs = useRef(new OBSWebSocket());

  const bc = useRef(new BroadcastChannel(STREAM_CONFIG_CHANNEL));
  const bcNowPlaying = useRef(new BroadcastChannel("eventManager-nowPlaying"));

  useEffect(() => {
    if (!privkey) return;
    console.debug("awaiting wavman message...");
    bc.current.onmessage = (event) => {
      const type = event.data.type;
      const value = event.data.value;
      console.debug("channel message", type, value);
      switch (type) {
        case "wavman":
          // need to remove previous and add new...
          // setParticipants(value.)
          setAndWipeParticipants(value.pubkey);
          const content = JSON.parse(value.content);
          console.debug("content", content);
          bcNowPlaying.current.postMessage(content);
          setStreamConfig((prev) => {
            if (prev.status === "live") {
              publishNowPlaying(
                content.creator,
                content.title,
                content.link,
                privkey,
                prev
              );
            }
            return prev;
          });
          break;
        default:
          console.error("invalid event message");
      }
    };
  }, [privkey]);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useZodForm({
    mode: "onChange",
    schema: z.object({
      title: z.string(),
      summary: z.string(),
      d: z.string().min(1),
      streaming: z.string().min(1),
      image: z.string(),
    }),
    defaultValues: {
      title: streamConfig.title ?? "",
      summary: streamConfig.summary ?? "",
      d: streamConfig.d ?? "",
      streaming: streamConfig.streaming ?? "",
      image: streamConfig.image ?? "",
    },
  });

  const onSubmit = (data: {
    title: any;
    summary: any;
    d: any;
    streaming: any;
    image: any;
  }) => {
    setStreamConfig((prev) => {
      const newConfig = {
        ...prev,
        title: data.title,
        summary: data.summary,
        d: data.d,
        streaming: data.streaming,
        image: data.image,
      };

      // localStorage.setItem(STREAM_CONFIG_KEY, JSON.stringify(newConfig));

      return newConfig;
    });
  };

  useEffect(() => {
    if (!privkey) return;
    const connect = async () => {
      try {
        console.debug("connecting");
        // await obs.current.connect("ws://192.168.1.244", "password");
        // await obs.current.connect("ws://192.168.1.244");
        // TODO: If using password, prompt user for it...
        await obs.current.connect();
      } catch (error) {
        console.error("error", error);
      }
    };
    connect();

    obs.current.on("ConnectionOpened", () => {
      console.debug("connected!");
      setConnected(true);
    });

    obs.current.on("StreamStateChanged", async (event) => {
      if (event.outputState === "OBS_WEBSOCKET_OUTPUT_STARTED") {
        console.debug("output started", event);
        setStreamConfig((prev) => {
          // publishLiveEvent(privkey, prev, "live");
          return {
            ...prev,
            prevStatus: "ended",
            status: "live",
          };
        });
      }
      if (event.outputState === "OBS_WEBSOCKET_OUTPUT_STOPPED") {
        console.debug("output started", event);
        setStreamConfig((prev) => {
          // publishLiveEvent(privkey, prev, "ended");
          return {
            ...prev,
            prevStatus: "live",
            status: "ended",
          };
        });
      }
    });

    return () => {
      // this breaks connection with react strict mode true
      const disconnect = async () => {
        await obs.current.disconnect();
        setConnected(false);
      };
      disconnect();
    };
  }, [privkey]);

  const setParticipants = (participant: string) => {
    console.debug("setting participant", participant);
    setStreamConfig((prev) => {
      const newConfig = {
        ...prev,
        p: [...prev.p, participant],
      };

      return newConfig;
    });
  };

  const setAndWipeParticipants = (participant: string) => {
    setStreamConfig((prev) => {
      const newConfig = {
        ...prev,
        p: [participant],
      };

      return newConfig;
    });
  };

  const removeParticipant = (participant: string) => {
    console.debug("removing participant", participant);
    setStreamConfig((prev) => {
      const newConfig = {
        ...prev,
        p: prev.p.filter((p) => p !== participant),
      };

      return newConfig;
    });
  };

  const setRelays = (relays: string[]) => {
    setStreamConfig((prev) => {
      return {
        ...prev,
        relays: relays,
      };
    });
  };

  useEffect(() => {
    if (!privkey) return;
    console.debug("streamConfig", streamConfig);
    localStorage.setItem(STREAM_CONFIG_KEY, JSON.stringify(streamConfig));
    bc.current.postMessage(streamConfig);

    if (streamConfig.status === "live") {
      console.debug("firing live");
      publishLiveEvent(privkey, streamConfig, "live");
    } else if (
      streamConfig.status === "ended" &&
      streamConfig.prevStatus === "live"
    ) {
      console.debug("firing ended");
      publishLiveEvent(privkey, streamConfig, "ended");
    }
  }, [JSON.stringify(streamConfig)]);

  return (
    <div className="h-screen overflow-auto bg-stone-800 text-white">
      {privkey ? (
        <div className="flex flex-col h-full">
          {
            {
              home: (
                <div className="flex flex-col h-full gap-4 py-2 px-4 overflow-y-scroll">
                  {/* <p>{connected ? "connected" : "disconnected"}</p> */}
                  <StreamDisplay pubkey={pubkey} streamConfig={streamConfig} />
                </div>
              ),
              participants: (
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
              ),
              relays: (
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
                    <AddRelayForm
                      relays={streamConfig.relays}
                      setRelays={setRelays}
                    />
                  </div>
                </div>
              ),
              settings: (
                <div className="flex flex-col h-full gap-4 py-2 px-4 overflow-y-scroll">
                  <form
                    className="flex flex-col gap-y-2 overflow-y-auto"
                    spellCheck={false}
                  >
                    <Input
                      name="title"
                      placeholder="stream title"
                      register={register}
                      formKey="title"
                      error={errors.title}
                    />

                    <Input
                      name="summary"
                      placeholder="stream summary"
                      register={register}
                      formKey="summary"
                      error={errors.summary}
                    />

                    <Input
                      name="Identifier"
                      placeholder="stream identifier"
                      register={register}
                      formKey="d"
                      error={errors.d}
                    />

                    <Input
                      name="Thumbnail"
                      placeholder="thumnbnail url"
                      register={register}
                      formKey="image"
                      error={errors.image}
                    />

                    <Input
                      name="Stream URL"
                      placeholder="stream url"
                      register={register}
                      formKey="streaming"
                      error={errors.streaming}
                    />
                  </form>
                  <Button onClick={handleSubmit(onSubmit)}>Update</Button>
                </div>
              ),
            }[view]
          }
          <div className="flex justify-center gap-4 mt-auto py-2">
            <button
              className="bg-gray-600 p-1 rounded hover:bg-gray-500"
              onClick={() => setView("home")}
            >
              <svg
                width={20}
                height={20}
                strokeWidth={1.5}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M12.391 4.262a1 1 0 00-1.46.035l-6.177 6.919a1 1 0 00-.254.666V19.5a1 1 0 001 1h3a1 1 0 001-1V16a1 1 0 011-1h3a1 1 0 011 1v3.5a1 1 0 001 1h3a1 1 0 001-1v-7.591a1 1 0 00-.287-.7l-6.822-6.947z"></path>
              </svg>
            </button>

            <button
              className="bg-gray-600 p-1 rounded hover:cursor-pointer hover:bg-gray-500"
              onClick={() => setView("participants")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                width={20}
                height={20}
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z"
                />
              </svg>
            </button>

            <button
              className="bg-gray-600 p-1 rounded hover:cursor-pointer hover:bg-gray-500"
              onClick={() => setView("relays")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46"
                />
              </svg>
            </button>
            <button
              className="bg-gray-600 p-1 rounded hover:cursor-pointer hover:bg-gray-500"
              onClick={() => setView("settings")}
            >
              <svg
                width={20}
                height={20}
                strokeWidth={1.5}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  d="M17.3 10.453l1.927.315a.326.326 0 01.273.322v1.793a.326.326 0 01-.27.321l-1.93.339c-.111.387-.265.76-.459 1.111l1.141 1.584a.326.326 0 01-.034.422l-1.268 1.268a.326.326 0 01-.418.037l-1.6-1.123a5.482 5.482 0 01-1.118.468l-.34 1.921a.326.326 0 01-.322.269H11.09a.325.325 0 01-.321-.272l-.319-1.911a5.5 5.5 0 01-1.123-.465l-1.588 1.113a.326.326 0 01-.418-.037L6.052 16.66a.327.327 0 01-.035-.42l1.123-1.57a5.497 5.497 0 01-.47-1.129l-1.901-.337a.326.326 0 01-.269-.321V11.09c0-.16.115-.296.273-.322l1.901-.317c.115-.393.272-.77.47-1.128l-1.11-1.586a.326.326 0 01.037-.417L7.34 6.052a.326.326 0 01.42-.034l1.575 1.125c.354-.194.73-.348 1.121-.46l.312-1.91a.326.326 0 01.322-.273h1.793c.159 0 .294.114.322.27l.336 1.92c.389.112.764.268 1.12.465l1.578-1.135a.326.326 0 01.422.033l1.268 1.268a.326.326 0 01.036.418L16.84 9.342c.193.352.348.724.46 1.11zM9.716 12a2.283 2.283 0 104.566 0 2.283 2.283 0 00-4.566 0z"
                  clipRule="evenodd"
                ></path>
              </svg>
            </button>
          </div>
        </div>
      ) : (
        <div className="flex h-full justify-center items-center">
          <div className="flex flex-col gap-y-2">
            <p className="text-center">Enter private key</p>
            <PrivkeyForm setPrivkey={setPrivkey} setPubkey={setPubkey} />
          </div>
        </div>
      )}
    </div>
  );
}
