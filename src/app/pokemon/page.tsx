"use client";
import { MouseEvent, useEffect, useRef, useState } from "react";
// @ts-ignore
import { WasmBoy } from "wasmboy";
// @ts-ignore
import rom from "@/assets/Pokemon-Blue.gb";
import { useSearchParams } from "next/navigation";
import { useInputQueue } from "./useInputQueue";
import { Input, executeMove, jsonToState, stateToJson } from "./util";

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
  const [stateDownloadUrl, setStateDownloadUrl] = useState<string>("");
  const inputStateFile = useRef<HTMLInputElement | null>(null);
  const saveStateFile = useRef<HTMLAnchorElement | null>(null);

  const { inputs, setInputs } = useInputQueue(pubkey, relays);

  const bcQueue = useRef(new BroadcastChannel("pokemon-inputs"));
  const bcDock = useRef(new BroadcastChannel("pokemon-dock"));

  useEffect(() => {
    console.debug("sending inputs over channel");
    bcQueue.current.postMessage(inputs);
  }, [inputs]);

  useEffect(() => {
    bcDock.current.onmessage = (event) => {
      // const input = event.data.input;
      const action = event.data.action;
      if (!action) return;

      if (action === "input") {
        const input = event.data.input;
        console.log("adding input", input);
        setInputs((prev) => {
          return [...prev, input];
        });
        return;
      }

      switch (action) {
        case "play":
          WasmBoy.play();
          return;
        case "pause":
          WasmBoy.pause();
          return;
        case "save":
          downloadLocalState();
          return;
        case "load":
          loadLocalState(event.data.data);
          return;
        default:
          break;
      }

      console.log("adding input", event.data);
      setInputs((prev) => {
        return [...prev, event.data];
      });
    };
  }, []);

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

  useEffect(() => {
    if (!isPlaying) return;
    const inputInterval = setInterval(() => {
      setInputs((prev) => {
        if (prev.length == 0) return [];
        // @ts-ignore
        const input = Input[prev[0].input];
        // TODO: saveInterval isn't called twice... even with strict mode. it's still fine tho
        // maybe should execute move outside of this
        executeMove(input);
        return prev.slice(1);
      });
    }, 2000);

    const saveInterval = setInterval(async () => {
      // TODO: Fix auto save to local storage
      // const saveState = await WasmBoy.saveState();
      // saveGameState(saveState);
      // WasmBoy.play();
    }, 3000);

    return () => {
      clearInterval(inputInterval);
      clearInterval(saveInterval);
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

  // TODO: Fix load auto save from local storage
  // const loadSaveState = async () => {
  //   // pick which save state to load?
  //   // still can't save externally.
  //   const jsonSaveState = localStorage.getItem("autoSave");
  //   if (!jsonSaveState) return;
  //   const saveState = convertJsonSaveState(jsonSaveState);
  //   await WasmBoy.loadState(saveState);
  // };

  const downloadLocalState = async () => {
    console.debug("downloading local state");
    // make sure paused already?
    if (!WasmBoy.isLoadedAndStarted()) {
      console.error("Cannot save. WasmBoy is not started");
      return;
    }
    const shouldContinuePlaying = WasmBoy.isPlaying();
    // console.debug("shouldContinuePlaying", shouldContinuePlaying);
    const state = await WasmBoy.saveState();

    if (shouldContinuePlaying) {
      WasmBoy.play();
    }

    const jsonState = stateToJson(state);
    console.debug("jsonState", jsonState);
    bcDock.current.postMessage({
      type: "save",
      data: jsonState,
    });
    // output = JSON.stringify({states: this.state.data},
    //   null, 4); // null, 4? helpful for us?
  };

  const loadLocalState = async (jsonState: string) => {
    console.debug("loadlocalstate");
    // inputStateFile.current?.click();
    const state = jsonToState(jsonState);
    await WasmBoy.loadState(state);
    WasmBoy.play();
    setTimeout(() => {
      WasmBoy.pause();
    }, 50);
  };

  // const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   setTimeout(() => {
  //     if (!WasmBoy.isLoadedAndStarted()) {
  //       // TODO: Should require user to load and start WasmBoy before displaying
  //       // any options
  //       // maybe just a big start button or something they have to click first
  //       console.error("Cannot load state. WasmBoy isn't started");
  //       return;
  //     }
  //     if (!event.target.files || !event.target.files[0]) {
  //       console.error("no file available");
  //       return;
  //     }
  //     const fileObj = event.target.files[0];
  //     console.debug("loaded file", fileObj);
  //     const reader = new FileReader();

  //     reader.onload = async (e: ProgressEvent<FileReader>) => {
  //       if (!e.target) {
  //         console.error("Failed to load state file");
  //         return;
  //       }
  //       const state = jsonToState(e.target.result);
  //       await WasmBoy.loadState(state);
  //     };
  //     reader.readAsText(fileObj);
  //   }, 50);
  // };

  return (
    <div className="fixed w-full h-full justify-center">
      <div className="flex h-full justify-center">
        <div className="flex h-full">
          <canvas width="100%" height="100%" id="wasmboy-canvas" />
          {/* {!isPlaying && (
            <div className="fixed flex flex-col gap-y-2 bg-slate-800 text-white">
              <input
                type="file"
                id="file"
                accept=".json"
                multiple={false}
                ref={inputStateFile}
                onChange={handleFileInput}
                className="hidden"
              />
            </div>
          )} */}
        </div>
      </div>
    </div>
  );
}
