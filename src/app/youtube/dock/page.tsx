"use client";
import { useRef, useState } from "react";
import { testVideos } from "../util";

export default function Dock() {
  const bc = useRef(new BroadcastChannel("youtube-dock"));
  const [currentTestVideo, setCurrentTestVideo] = useState(0);

  const playTestVideo = () => {
    bc.current.postMessage({
      type: "addTestVideo",
      value: testVideos[currentTestVideo],
    });
    if (currentTestVideo + 1 == testVideos.length) {
      setCurrentTestVideo(0);
      return;
    }
    setCurrentTestVideo(currentTestVideo + 1);
  };

  const skip = () => {
    bc.current.postMessage({
      type: "skip",
      value: null,
    });
  };

  // TODO:
  // - show now playing?
  // - pause?
  // - set minimum zap cost
  // - set cost per second?

  return (
    <div className="flex flex-col gap-y-2 h-screen bg-gray-800 text-white">
      <button className="rounded bg-gray-600 px-2 py-1" onClick={playTestVideo}>
        Add test video
      </button>
      <button className="rounded bg-gray-600 px-2 py-1" onClick={skip}>
        Skip
      </button>
    </div>
  );
}
