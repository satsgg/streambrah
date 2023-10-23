"use client";
import { useEffect, useRef, useState } from "react";
import { WasmBoy } from "wasmboy";
import rom from "@/assets/Pokemon-Blue.gb";
import { useSearchParams } from "next/navigation";
import { useInputQueue } from "./useInputQueue";
import { Virtuoso } from "react-virtuoso";
import { Input } from "./util";
import { InputDisplay } from "./input";

let quickSpeed = false;
WasmBoy.ResponsiveGamepad.onInputsChange(
  [
    WasmBoy.ResponsiveGamepad.RESPONSIVE_GAMEPAD_INPUTS.LEFT_TRIGGER,
    WasmBoy.ResponsiveGamepad.RESPONSIVE_GAMEPAD_INPUTS.RIGHT_TRIGGER,
    WasmBoy.ResponsiveGamepad.RESPONSIVE_GAMEPAD_INPUTS.SPECIAL,
  ],
  (state: WasmBoy.state) => {
    // Quick Speed
    if (!quickSpeed && (state.LEFT_TRIGGER || state.RIGHT_TRIGGER)) {
      WasmBoy.setSpeed(3.0);
      quickSpeed = true;
    } else if (quickSpeed && !state.LEFT_TRIGGER && !state.RIGHT_TRIGGER) {
      WasmBoy.setSpeed(1.0);
      quickSpeed = false;
    }

    // Play / Pause (space button)
    if (WasmBoy.isPlaying() && state.SPECIAL) {
      WasmBoy.pause();
    } else if (!WasmBoy.isPlaying() && state.SPECIAL) {
      WasmBoy.play();
    }
  }
);

export default function Pokemon() {
  const [isPlaying, setIsPlaying] = useState(false);
  const searchParams = useSearchParams();
  const pubkey = searchParams.get("pubkey");
  const relays = searchParams.getAll("relay");

  const { inputs, setInputs } = useInputQueue(pubkey, relays);

  useEffect(() => {
    loadWasmBoy();
  }, []);

  const loadWasmBoy = async () => {
    const canvasElement = document.querySelector("#wasmboy-canvas");
    await WasmBoy.config({
      isGbcEnabled: true,
      isGbcColorizationEnabled: true,
      isAudioEnabled: true,
      gameboyFrameRate: 60,
      maxNumberOfAutoSaveStates: 3,
      onPlay: () => {
        handleWasmBoyIsPlayingChange();
      },
      onPause: () => {
        handleWasmBoyIsPlayingChange();
      },
    });
    await WasmBoy.setCanvas(canvasElement);
    await WasmBoy.disableDefaultJoypad(); // doesn't do anything?
    await WasmBoy.loadROM(rom);
    // NOTE: Don't start until we initialize the audio context
    // The AudioContext was not allowed to start. It must be resumed (or created) after a user gesture on the page. <URL>
  };

  const executeMove = (input: string) => {
    console.log("executing input: " + input);
    window.dispatchEvent(new KeyboardEvent("keydown", { code: input }));
    setTimeout(
      () => window.dispatchEvent(new KeyboardEvent("keyup", { code: input })),
      100
    );
  };

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setInputs((prev) => {
        if (prev.length == 0) return [];
        const input = Input[prev[0].input];
        executeMove(input);
        return prev.slice(1);
      });
    }, 2000);

    return () => {
      clearInterval(interval);
    };
  }, [isPlaying]);

  const handleWasmBoyIsPlayingChange = () => {
    // Set timeout is temporary fix for isPlaying() bug
    // https://github.com/torch2424/wasmboy/issues/292
    // console.log("is playing change")
    setTimeout(() => {
      if (WasmBoy.isLoadedAndStarted() && WasmBoy.isPlaying()) {
        console.debug("set is playing: true");
        setIsPlaying(true);
      } else {
        console.debug("set is playing: false");
        setIsPlaying(false);
      }
    }, 50);
  };

  return (
    <div className="fixed w-full h-full justify-center">
      <div className="flex h-full justify-center">
        <div className="flex justify-center h-full">
          <canvas width="100%" height="100%" id="wasmboy-canvas" />
        </div>
        <div className="h-full w-full nowrap text-white pt-32">
          <Virtuoso
            data={inputs}
            className="no-scrollbar"
            followOutput={"smooth"}
            itemContent={(index, input) => {
              return (
                <InputDisplay index={index} input={input} relays={relays} />
              );
            }}
          />
        </div>
      </div>
    </div>
  );
}
