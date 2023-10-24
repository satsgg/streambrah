"use client";
import { useEffect, useState, useRef } from "react";
import OBSWebSocket, { EventSubscription } from "obs-websocket-js";

export default function EventManager() {
  const [connected, setConnected] = useState(false);
  const [streamStatus, setStreamStatus] = useState<any>({});
  const obs = useRef(new OBSWebSocket());

  useEffect(() => {
    console.debug("mounted");
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

  useEffect(() => {
    if (!connected) {
      return;
    }
    const statusInterval = setInterval(() => {
      getStreamStatus();
    }, 1000);

    return () => {
      clearInterval(statusInterval);
    };
  }, [connected]);

  return (
    <div className="bg-slate-500">
      {typeof window !== "undefined" && !window.obsstudio ? (
        <div>Open this as a custom dock in obs.</div>
      ) : (
        <div>
          <div className="">OBS JS API: {window.obsstudio.pluginVersion}</div>
          <p>{connected ? "connected" : "disconnected"}</p>
          <p>stream status: {JSON.stringify(streamStatus, null, 2)}</p>
        </div>
      )}
    </div>
  );
}
