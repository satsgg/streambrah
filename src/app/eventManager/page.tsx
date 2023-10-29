"use client";
import { useEffect, useState, useRef } from "react";
import OBSWebSocket, { EventSubscription } from "obs-websocket-js";
import PrivkeyForm from "./privkeyForm";
import { DEFAULT_EVENT_CONFIG, EventConfig, publishLiveEvent } from "./util";
import { useZodForm } from "@/utils/useZodForm";
import { z } from "zod";
import { FieldError } from "react-hook-form";
import StreamDisplay from "./streamDisplay";

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
        className={`${
          error ? "border-red-500 focus:border-red-500" : "focus:border-primary"
        } bg-gray-600 focus:shadow-outline w-full min-w-[20ch] resize-none appearance-none rounded py-1 px-2 leading-tight shadow placeholder:italic focus:outline-none`}
        type="text"
        placeholder={placeholder}
        autoComplete="off"
        {...register(formKey)}
      />
      {error && <p className="text-sm ">{error.message}</p>}
    </div>
  );
};

// TODO: Hashtags, relays, participants

export default function EventManager() {
  const [connected, setConnected] = useState(false);
  const [view, setView] = useState<"home" | "settings">("home");
  const [privkey, setPrivkey] = useState<string | null>("");
  const [pubkey, setPubkey] = useState<string>("");
  // TODO: Save config in local storage
  const [eventConfig, setEventConfig] =
    useState<EventConfig>(DEFAULT_EVENT_CONFIG);
  const [streamStatus, setStreamStatus] = useState<any>({});
  // const obs = useRef(new OBSWebSocket());

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useZodForm({
    mode: "onChange",
    schema: z.object({
      title: z.string(),
      summary: z.string(),
      d: z.string(),
      streaming: z.string(),
      image: z.string(),
    }),
    defaultValues: {
      title: "",
      summary: "",
      d: "",
      streaming: "",
      image: "",
    },
  });

  const onSubmit = (data: EventConfig) => {
    setEventConfig((prev) => {
      return {
        ...prev,
        title: data.title,
        summary: data.summary,
        d: data.d,
        streaming: data.streaming,
        image: data.image,
      };
    });
    console.debug("setting event config", data);
  };

  // useEffect(() => {
  //   const connect = async () => {
  //     try {
  //       console.debug("connecting");
  //       // await obs.current.connect("ws://192.168.1.244", "password");
  //       // await obs.current.connect("ws://192.168.1.244");
  //       // TODO: If using password, prompt user for it...
  //       await obs.current.connect();
  //     } catch (error) {
  //       console.error("error", error);
  //     }
  //   };
  //   connect();

  //   obs.current.on("ConnectionOpened", () => {
  //     console.debug("connected!");
  //     setConnected(true);
  //   });

  //   return () => {
  //     // this breaks connection with react strict mode true
  //     const disconnect = async () => {
  //       await obs.current.disconnect();
  //       setConnected(false);
  //     };
  //     disconnect();
  //   };
  // }, []);

  // const getStreamStatus = async () => {
  //   if (!connected) return;
  //   console.log("getting stream status");
  //   const status = await obs.current.call("GetStreamStatus");
  //   setStreamStatus(status);
  //   console.log("stream status", status);
  // };

  // useEffect(() => {
  //   if (!connected) {
  //     return;
  //   }
  //   const statusInterval = setInterval(() => {
  //     getStreamStatus();
  //   }, 1000);

  //   return () => {
  //     clearInterval(statusInterval);
  //   };
  // }, [connected]);

  return (
    <div className="h-screen bg-gray-800 overflow-auto text-white">
      {/* {typeof window !== "undefined" && !window.obsstudio ? (
        // maybe make a layout that shows this message as a banner..
        // can also set background to light grey for testing in browser
        <div>Open this as a custom dock in obs.</div>
      ) : (
        <div>
          <div className="">
            OBS JS API:{" "}
            {typeof window !== "undefined" && window.obsstudio
              ? window.obsstudio.pluginVersion
              : "unavailable"}
          </div>
          <p>{connected ? "connected" : "disconnected"}</p>
          <p>stream status: {JSON.stringify(streamStatus, null, 2)}</p>
        </div>
      )} */}
      {privkey ? (
        <div className="flex flex-col h-full">
          {
            {
              home: (
                <div className="flex flex-col h-full gap-4 py-2 px-4 overflow-y-scroll">
                  <div className="">
                    <StreamDisplay pubkey={pubkey} eventConfig={eventConfig} />
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="rounded bg-gray-600 px-2 py-1"
                      onClick={async () =>
                        console.log(
                          await publishLiveEvent(privkey, eventConfig, "live")
                        )
                      }
                    >
                      Start
                    </button>
                    <button
                      className="rounded bg-gray-600 px-2 py-1"
                      onClick={async () =>
                        console.log(
                          await publishLiveEvent(privkey, eventConfig, "ended")
                        )
                      }
                    >
                      End
                    </button>
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
                  <button
                    className="rounded bg-gray-600 px-2 py-1"
                    onClick={handleSubmit(onSubmit)}
                  >
                    Update
                  </button>
                </div>
              ),
            }[view]
          }
          <div className="flex justify-center gap-4 mt-auto py-2">
            <button
              className="bg-gray-600 p-1 rounded hover:cursor-pointer hover:bg-gray-500"
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
