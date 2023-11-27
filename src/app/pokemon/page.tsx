"use client";
import { useEffect, useRef, useState } from "react";
// @ts-ignore
import { WasmBoy } from "wasmboy";
// @ts-ignore
import rom from "@/assets/Pokemon-Blue.gb";
import { useSearchParams } from "next/navigation";
import { useInputQueue } from "./useInputQueue";
import {
  DEFAULT_SETTINGS,
  Input,
  Settings,
  executeMove,
  getSettingsFromLS,
  jsonToState,
  stateToJson,
} from "./util";
import useStreamConfig from "../useStreamConfig";

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
  const d = searchParams.get("d");
  const relays = searchParams.getAll("relay");
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const streamConfig = useStreamConfig();

  const { inputs, setInputs } = useInputQueue(
    streamConfig?.pubkey || pubkey,
    streamConfig?.d || d,
    streamConfig?.relays || relays
  );

  useEffect(() => {
    const settings = getSettingsFromLS();
    setSettings(settings);
  }, []);

  const bcQueue = useRef(new BroadcastChannel("pokemon-inputs"));
  const bcDock = useRef(new BroadcastChannel("pokemon-dock"));

  useEffect(() => {
    console.debug("sending inputs over channel");
    bcQueue.current.postMessage(inputs);
  }, [inputs]);

  useEffect(() => {
    bcDock.current.onmessage = (event) => {
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
        case "settings":
          setSettings(event.data.data);
          return;
        default:
          break;
      }
    };
  }, []);

  useEffect(() => {
    loadWasmBoy();
  }, []);

  const loadWasmBoy = async () => {
    console.debug("loading wasmboy");
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
    console.debug("isPlaying", isPlaying, "inputTimer", settings.inputTimer);
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
    }, settings.inputTimer);

    return () => {
      clearInterval(inputInterval);
    };
  }, [isPlaying, settings.inputTimer]);

  useEffect(() => {
    if (!isPlaying || !settings.autoSave) return;
    const saveInterval = setInterval(async () => {
      autoSaveState();
    }, settings.autoSaveTimer * 60 * 1000);

    return () => {
      clearInterval(saveInterval);
    };
  }, [isPlaying, settings.autoSave, settings.autoSaveTimer]);

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

  const downloadLocalState = async () => {
    // make sure paused already?
    if (!WasmBoy.isLoadedAndStarted()) {
      console.error("Cannot save. WasmBoy is not started");
      return;
    }
    const shouldContinuePlaying = WasmBoy.isPlaying();
    const state = await WasmBoy.saveState();

    if (shouldContinuePlaying) {
      WasmBoy.play();
    }

    const jsonState = stateToJson(state);
    console.debug("save jsonState", jsonState);
    bcDock.current.postMessage({
      type: "save",
      data: jsonState,
    });
  };

  const loadLocalState = async (jsonState: string) => {
    const state = jsonToState(jsonState);
    console.debug("load jsonState", jsonState);
    await WasmBoy.loadState(state);
    WasmBoy.play();
    setTimeout(() => {
      WasmBoy.pause();
    }, 50);
  };

  const autoSaveState = async () => {
    if (!WasmBoy.isLoadedAndStarted()) {
      console.error("Cannot save. WasmBoy is not started");
      return;
    }
    const state = await WasmBoy.saveState();
    WasmBoy.play();

    const jsonState = stateToJson(state);
    bcDock.current.postMessage({
      type: "autoSave",
      data: jsonState,
    });
  };

  return (
    <div className="fixed w-full h-full justify-center">
      <div className="flex h-full justify-center">
        <div className="flex h-full">
          <canvas width="100%" height="100%" id="wasmboy-canvas" />
        </div>
      </div>
    </div>
  );
}
