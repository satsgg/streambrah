"use client";
import { useEffect, useRef, useState } from "react";
import { Playlist, Video } from "../util";
import { Virtuoso } from "react-virtuoso";
import VideoDisplay from "./videoDisplay";

export default function Queue() {
  // const [videos, setVideos] = useState<Video[]>([]);
  const [playlist, setPlaylist] = useState<Playlist>({
    nowPlaying: null,
    queue: [],
  });
  const bcQueue = useRef(new BroadcastChannel("youtube-queue"));

  useEffect(() => {
    bcQueue.current.onmessage = (event) => {
      console.debug("event data", event.data);
      // setVideos(event.data);
      setPlaylist(event.data);
    };
  }, []);

  return (
    <div className="h-screen w-full nowrap text-white bg-gray-500">
      <Virtuoso
        // data={videos}
        data={playlist.queue}
        className="no-scrollbar"
        followOutput={"smooth"}
        itemContent={(index, video) => {
          // return <VideoDisplay index={index} input={input} relays={relays} />;
          return <VideoDisplay video={video} />;
        }}
      />
    </div>
  );
}
