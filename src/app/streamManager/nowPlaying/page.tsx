"use client";
import { useEffect, useRef, useState } from "react";

export default function NowPlaying() {
  const [nowPlaying, setNowPlaying] = useState<null | any>(null);
  const bcNowPlaying = useRef(new BroadcastChannel("eventManager-nowPlaying"));

  useEffect(() => {
    bcNowPlaying.current.onmessage = (event) => {
      console.debug("channel message", event.data);
      setNowPlaying(event.data);
    };
  }, []);

  return (
    <div className="h-screen flex align-center text-white">
      {nowPlaying && (
        <div className="flex items-center gap-2">
          <p className="text-3xl">🎵</p>
          <div>
            <p>{nowPlaying.title}</p>
            <p>{nowPlaying.creator}</p>
          </div>
        </div>
      )}
    </div>
  );
}
