"use client";
import { useEffect, useRef } from "react";

const testVideos = [
  {
    pubkey: "e9038e10916d910869db66f3c9a1f41535967308b47ce3136c98f1a6a22a6150",
    id: "Yaxq3iggMdM",
  },
  {
    pubkey: "e9038e10916d910869db66f3c9a1f41535967308b47ce3136c98f1a6a22a6150",
    id: "4ASKMcdCc3g",
  },
];

export default function Dock() {
  const bc = useRef(new BroadcastChannel("youtube-dock"));

  const playTestVideo = () => {
    bc.current.postMessage({
      type: "playTestVideo",
      value: testVideos[0],
    });
  };

  // TODO:
  // - skip video
  // - show now playing?
  // - pause?

  return (
    <div>
      <button onClick={playTestVideo}>Play test video</button>
    </div>
  );
}
