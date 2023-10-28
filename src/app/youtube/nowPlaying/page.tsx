"use client";
import { useEffect, useRef, useState } from "react";
import { Video } from "../util";
import { fmtMsg } from "@/utils/util";

export default function Queue() {
  const [nowPlaying, setNowPlaying] = useState<Video | null>(null);

  const bcQueue = useRef(new BroadcastChannel("youtube-queue"));

  useEffect(() => {
    bcQueue.current.onmessage = (event) => {
      console.debug("event data", event.data);
      setNowPlaying(event.data.nowPlaying);
    };
  }, []);

  return (
    <div className="flex h-screen w-full nowrap text-white">
      {nowPlaying && (
        <div className="flex gap-x-2 items-center">
          <img className="h-16 w-16 rounded" src={nowPlaying.thumbnail} />
          <div>
            <h1 className="text-2xl font-semibold text-left text-ellipsis whitespace-nowrap">
              {fmtMsg(nowPlaying.title, 55)}
            </h1>
            <h3 className="text-xl text-gray-400 text-left text-ellipsis whitespace-nowrap">
              {fmtMsg(nowPlaying.author, 50)}
            </h3>
          </div>
        </div>
      )}
    </div>
  );
}
