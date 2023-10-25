"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import YouTube, { YouTubeProps } from "react-youtube";
import { Pool } from "../Pool";
import { Event as NostrEvent, utils } from "nostr-tools";
import { parseZapRequest } from "@/utils/nostr";
import { parseVideoId, queryVideo } from "./util";
import { Video } from "./util";
import { parse } from "path";

// TODO:
// configurable max play time
// minimum sats to play/sats per second
type Playlist = {
  nowPlaying: Video | null;
  queue: Video[];
};

export default function YouTubePlayer() {
  const [playlist, setPlaylist] = useState<Playlist>({
    nowPlaying: null,
    queue: [],
  });

  const bc = useRef(new BroadcastChannel("youtube-dock"));
  const bcQueue = useRef(new BroadcastChannel("youtube-queue"));

  useEffect(() => {
    console.debug("playlist", playlist);
    bcQueue.current.postMessage(playlist);
    if (!playlist.nowPlaying && playlist.queue.length > 0) {
      startNextVideo();
    }
  }, [playlist]);

  useEffect(() => {
    bc.current.onmessage = (event) => {
      const type = event.data.type;
      const value = event.data.value;
      console.debug("channel message", type, value);
      switch (type) {
        case "addTestVideo":
          setPlaylist((prev) => {
            return {
              nowPlaying: prev.nowPlaying,
              queue: [...prev.queue, value],
            };
          });

          break;
        case "skip":
          startNextVideo();
          break;
        default:
          console.error("invalid event message");
      }
    };
  }, []);

  const searchParams = useSearchParams();
  const pubkey = searchParams.get("pubkey");
  const relays = searchParams.getAll("relay");
  const now = useRef(Math.floor(Date.now() / 1000));

  useEffect(() => {
    console.log("subscribing to relays", relays);
    let sub = Pool.sub(relays, [
      {
        kinds: [9735],
        "#p": [pubkey || ""],
        since: now.current,
      },
    ]);

    sub.on("event", async (event: NostrEvent) => {
      // TODO: Fix zap parsing? think i did it in alerts
      const zap = parseZapRequest(event);
      if (!zap) return;

      const videoId = parseVideoId(zap.content);
      if (!videoId) return;

      const res = await queryVideo(videoId);
      if (!res) return;

      const { title, author, thumbnail } = res;
      const newVideo: Video = {
        pubkey: zap.pubkey,
        id: videoId,
        title: title,
        author: author,
        thumbnail: thumbnail,
      };

      setPlaylist((prev) => {
        return {
          nowPlaying: prev.nowPlaying,
          queue: [...prev.queue, newVideo],
        };
      });
    });

    return () => {
      Pool.close(relays);
    };
  }, []);

  const onPlayerReady: YouTubeProps["onReady"] = (event) => {
    event.target.playVideo();
  };

  const startNextVideo = () => {
    setPlaylist((prev) => {
      let nextToPlay = prev.queue[0] ?? null;
      return { nowPlaying: nextToPlay, queue: [...prev.queue.slice(1)] };
    });
  };

  const opts = {
    height: "720",
    width: "1280",

    playerVars: {
      autoplay: 1,
      end: 300,
      // end: 5,
      // might be able to force autohide off by simulating a mouse hovering...
      // this way the video title/author could stay up
      controls: 0,
    },
  };

  return (
    <div className="flex justify-center items-center h-screen w-full">
      {playlist.nowPlaying ? (
        <YouTube
          videoId={playlist.nowPlaying.id}
          opts={opts}
          onReady={onPlayerReady}
          onEnd={startNextVideo}
          onError={startNextVideo}
          // onStateChange={(event) => console.log("player event", event)}
        />
      ) : (
        // TODO: Streamer might want a transparent background...
        <div className="h-[720px] w-[1280px] bg-black"></div>
      )}
    </div>
  );
}
