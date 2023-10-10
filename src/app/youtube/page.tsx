"use client";
import { useState } from "react";
import YouTube, { YouTubeProps } from "react-youtube";

export default function YouTubePlayer() {
  const [nowPlaying, setNowPlaying] = useState<string | null>("JTBJ3tW2Lr0");
  const [queue, setQueue] = useState<string[]>(["xzpndHtdl9A", "2g811Eo7K8U"]);

  const onPlayerReady: YouTubeProps["onReady"] = (event) => {
    // access to player in all event handlers via event.target
    // event.target.pauseVideo();
  };

  const onPlayerStateChange: YouTubeProps["onStateChange"] = (event) => {
    console.log("event", event);
    if (event.data === 0) {
      if (!queue) {
        setNowPlaying(null);
        return;
      }

      setNowPlaying(queue[0]);
      setQueue((prev) => {
        return [...prev.slice(1)];
      });
    }
  };

  const opts = {
    height: "390",
    width: "640",
    playerVars: {
      // https://developers.google.com/youtube/player_parameters
      autoplay: 1,
    },
  };

  return (
    <>
      {nowPlaying && (
        <YouTube
          videoId={nowPlaying}
          opts={opts}
          onReady={onPlayerReady}
          onStateChange={onPlayerStateChange}
        />
      )}
    </>
  );
}
