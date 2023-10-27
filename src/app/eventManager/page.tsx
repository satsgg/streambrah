"use client";
import { useEffect, useState, useRef } from "react";
import OBSWebSocket, { EventSubscription } from "obs-websocket-js";
import PrivkeyForm from "./privkeyForm";

export default function EventManager() {
  const [connected, setConnected] = useState(false);
  const [privkey, setPrivkey] = useState<string | null>(null);
  const [streamStatus, setStreamStatus] = useState<any>({});
  const obs = useRef(new OBSWebSocket());

  useEffect(() => {
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

    return () => {
      // this breaks connection with react strict mode true
      const disconnect = async () => {
        await obs.current.disconnect();
        setConnected(false);
      };
      disconnect();
    };
  }, []);

  const getStreamStatus = async () => {
    if (!connected) return;
    console.log("getting stream status");
    const status = await obs.current.call("GetStreamStatus");
    setStreamStatus(status);
    console.log("stream status", status);
  };
  console.debug("privkey", privkey);

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
    <div className="h-screen bg-slate-500">
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
        <div>hi</div>
      ) : (
        <div className="flex h-full justify-center items-center">
          <div className="flex flex-col gap-y-2">
            <p className="text-center">Enter private key</p>
            <PrivkeyForm setPrivkey={setPrivkey} />
          </div>
        </div>
      )}
    </div>
  );
}
