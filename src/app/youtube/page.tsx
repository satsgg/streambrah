"use client";
import { useEffect, useState } from "react";
import YouTube, { YouTubeProps } from "react-youtube";

export default function YouTubePlayer() {
  // const [nowPlaying, setNowPlaying] = useState<string | null>("JTBJ3tW2Lr0");
  const [nowPlaying, setNowPlaying] = useState<string | null>("4ASKMcdCc3g");
  // const [queue, setQueue] = useState<string[]>(["xzpndHtdl9A", "2g811Eo7K8U"]);
  const [queue, setQueue] = useState<string[]>(["xzpndHtdl9A", "4ASKMcdCc3g"]);

  const onPlayerReady: YouTubeProps["onReady"] = (event) => {
    event.target.playVideo();
  };

  const startNextVideo = () => {
    if (!queue) {
      setNowPlaying(null);
      return;
    }

    setNowPlaying(queue[0]);
    setQueue((prev) => {
      return [...prev.slice(1)];
    });
  };

  const opts = {
    height: "390",
    width: "640",
    playerVars: {
      // https://developers.google.com/youtube/player_parameters
      autoplay: 1,
      end: 300,
    },
  };

  return (
    <>
      {nowPlaying && (
        <YouTube
          videoId={nowPlaying}
          opts={opts}
          onReady={onPlayerReady}
          onEnd={() => startNextVideo()}
        />
      )}
    </>
  );
}
