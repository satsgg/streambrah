"use client";
import { useRef, useEffect, useState } from "react";
import { Virtuoso } from "react-virtuoso";
import { InputDisplay } from "./InputDisplay";
import { InputAndAuthor, Playlist } from "../util";
import { useSearchParams } from "next/navigation";

export default function Queue() {
  const [playlist, setPlaylist] = useState<Playlist>({
    nowPlaying: null,
    queue: [],
  });
  const searchParams = useSearchParams();
  const relays = searchParams.getAll("relay");

  const bc = useRef(new BroadcastChannel("pokemon-inputs"));

  useEffect(() => {
    bc.current.onmessage = (event) => {
      setPlaylist(event.data);
    };
  }, []);

  return (
    <div className="h-screen w-full text-white">
      {playlist.nowPlaying && (
        <InputDisplay input={playlist.nowPlaying} relays={relays} nowPlaying />
      )}
      <Virtuoso
        data={playlist.queue}
        className="no-scrollbar"
        itemContent={(index, input) => {
          return <InputDisplay input={input} relays={relays} />;
        }}
      />
    </div>
  );
}
