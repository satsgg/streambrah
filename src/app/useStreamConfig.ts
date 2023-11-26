import { useEffect, useRef, useState } from "react";
import { STREAM_CONFIG_CHANNEL, STREAM_CONFIG_KEY } from "./constants";
import { StreamConfig } from "./types";

const getStreamConfig = (): StreamConfig | null => {
  if (typeof window === "undefined") return null;
  const storeConfig = localStorage.getItem(STREAM_CONFIG_KEY);
  if (!storeConfig) return null;

  let config: StreamConfig = JSON.parse(storeConfig);
  console.debug("got stream config", config);

  return config;
};

export default function useStreamConfig() {
  const [config, setConfig] = useState<StreamConfig | null>(getStreamConfig());
  const bc = useRef(new BroadcastChannel(STREAM_CONFIG_CHANNEL));

  useEffect(() => {
    bc.current.onmessage = (event) => {
      const newConfig = event.data;
      console.debug("new stream config", newConfig);
      setConfig(newConfig);
    };
  });

  return config;
}
