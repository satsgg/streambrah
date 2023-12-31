"use client";
import { useEffect, useRef, useState } from "react";
import { Playlist, Video } from "../util";
import { Virtuoso } from "react-virtuoso";
import VideoDisplay from "./VideoDisplay";
import { useSearchParams } from "next/navigation";

export default function Queue() {
  const [playlist, setPlaylist] = useState<Playlist>({
    nowPlaying: null,
    queue: [],
  });
  const searchParams = useSearchParams();
  const relays = searchParams.getAll("relay");

  const bcQueue = useRef(new BroadcastChannel("youtube-queue"));

  useEffect(() => {
    bcQueue.current.onmessage = (event) => {
      console.debug("event data", event.data);
      setPlaylist(event.data);
    };
  }, []);

  return (
    <div className="h-screen w-full nowrap text-white">
      <Virtuoso
        data={playlist.queue}
        className="no-scrollbar"
        itemContent={(index, video) => {
          return <VideoDisplay video={video} relays={relays} />;
        }}
      />
    </div>
  );
}
