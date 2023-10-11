"use client";
import { useEffect, useState } from "react";
import { WasmBoy } from "wasmboy";
import rom from "@/assets/Pokemon-Blue.gb";

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

let inputMap = {
  A: "KeyX",
  B: "KeyZ",
  UP: "KeyW",
  LEFT: "KeyA",
  DOWN: "KeyS",
  RIGHT: "KeyD",
  START: "enter",
  SELECT: "ShiftRight",
  PAUSE: "space",
};

export default function Pokemon() {
  const [isPlaying, setIsPlaying] = useState(false);

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

  const executeMove = (move) => {
    if (move) {
      console.log("executing input: " + move);
      window.dispatchEvent(
        new KeyboardEvent("keydown", { code: inputMap[move] })
      );
      setTimeout(
        () =>
          window.dispatchEvent(
            new KeyboardEvent("keyup", { code: inputMap[move] })
          ),
        100
      );
    } else {
      // console.log("Skipping move")
    }
  };

  const handleWasmBoyIsPlayingChange = () => {
    // Set timeout is temporary fix for isPlaying() bug
    // https://github.com/torch2424/wasmboy/issues/292
    // console.log("is playing change")
    setTimeout(() => {
      if (WasmBoy.isLoadedAndStarted() && WasmBoy.isPlaying()) {
        console.log("set is playing: true");
        setIsPlaying(true);
      } else {
        console.log("set is playing: false");
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
      </div>
    </div>
  );
}
