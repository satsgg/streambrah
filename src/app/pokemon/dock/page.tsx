"use client";
import { useZodForm } from "@/utils/useZodForm";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import {
  AUTOSAVE_KEY,
  DEFAULT_SETTINGS,
  SETTINGS_KEY,
  Settings,
  getAutoSaveFromLS,
  getSettingsFromLS,
} from "../util";
import Button from "@/app/Button";
import GameboySVG from "@/svgs/gameboy.svg";
import GameboyStateSVG from "@/svgs/gameboyState.svg";
import SettingsSVG from "@/svgs/settings.svg";

const partialInput = {
  pubkey: "e9038e10916d910869db66f3c9a1f41535967308b47ce3136c98f1a6a22a6150",
  amount: 0,
};

export default function PokemonDock() {
  const [view, setView] = useState<"home" | "state" | "settings">("home");
  const [saveState, setSaveState] = useState("");
  const [loadState, setLoadState] = useState("");
  const [autoSaveState, setAutoSaveState] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useZodForm({
    mode: "onChange",
    schema: z.object({
      inputTimer: z.number().positive(),
      autoSaveTimer: z.number().positive(),
      autoSave: z.boolean(),
    }),
    defaultValues: DEFAULT_SETTINGS,
  });

  useEffect(() => {
    reset(getSettingsFromLS());
    setAutoSaveState(getAutoSaveFromLS());
  }, []);

  const bc = useRef(new BroadcastChannel("pokemon-dock"));

  const sendInput = (input: string) => {
    const fullInput = {
      ...partialInput,
      id: (Math.random() + 1).toString(36).substring(2),
      input: input,
    };
    bc.current.postMessage({
      action: "input",
      input: fullInput,
    });
  };

  const sendAction = (action: string, data?: string) => {
    bc.current.postMessage({
      action: action,
      data: data,
    });
  };

  const onSubmit = (data: Settings) => {
    console.debug("onSubmit", data);
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(data));

    bc.current.postMessage({
      action: "settings",
      data: data,
    });
  };

  useEffect(() => {
    bc.current.onmessage = (event) => {
      const type = event.data.type;
      switch (type) {
        case "save":
          console.debug("event.data", event.data);
          setSaveState(event.data.data);
          return;
        case "autoSave":
          console.debug("autoSave", event.data);
          window.localStorage.setItem(AUTOSAVE_KEY, event.data.data);
          setAutoSaveState(event.data.data);
        default:
          break;
      }
    };
  }, []);

  const saveStateToDate = (text: string) => {
    const json = JSON.parse(text);
    if (!json.date) return "";
    const options: Intl.DateTimeFormatOptions = {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    };
    return new Date(json.date).toLocaleDateString("en-us", options);
  };

  return (
    <div className="flex flex-col justify-between h-screen text-sm whitespace-nowrap p-2 bg-stone-800 text-white">
      {
        {
          home: (
            <div className="flex flex-col gap-y-2">
              <div className="flex flex-wrap gap-2">
                <button
                  className="bg-gray-600 hover:bg-gray-500 rounded px-2 py-1"
                  onClick={() => sendAction("play")}
                >
                  Play
                </button>
                <button
                  className="bg-gray-600 hover:bg-gray-500 rounded px-2 py-1"
                  onClick={() => sendAction("pause")}
                >
                  Pause
                </button>
              </div>
              <div className="flex flex-wrap gap-x-2 gap-y-2">
                <button
                  className="bg-gray-600 hover:bg-gray-500 rounded px-2 py-1"
                  onClick={() => sendInput("a")}
                >
                  A
                </button>
                <button
                  className="bg-gray-600 hover:bg-gray-500 rounded px-2 py-1"
                  onClick={() => sendInput("b")}
                >
                  B
                </button>
                <button
                  className="bg-gray-600 hover:bg-gray-500 rounded px-2 py-1"
                  onClick={() => sendInput("up")}
                >
                  Up
                </button>
                <button
                  className="bg-gray-600 hover:bg-gray-500 rounded px-2 py-1"
                  onClick={() => sendInput("left")}
                >
                  Left
                </button>
                <button
                  className="bg-gray-600 hover:bg-gray-500 rounded px-2 py-1"
                  onClick={() => sendInput("down")}
                >
                  Down
                </button>
                <button
                  className="bg-gray-600 hover:bg-gray-500 rounded px-2 py-1"
                  onClick={() => sendInput("right")}
                >
                  Right
                </button>
                <button
                  className="bg-gray-600 hover:bg-gray-500 rounded px-2 py-1"
                  onClick={() => sendInput("start")}
                >
                  Start
                </button>
                <button
                  className="bg-gray-600 hover:bg-gray-500 rounded px-2 py-1"
                  onClick={() => sendInput("select")}
                >
                  Select
                </button>
              </div>
            </div>
          ),
          state: (
            <div className="flex flex-col gap-4 overflow-auto">
              <div className="flex flex-col gap-2">
                <div className="flex flex-col">
                  <input
                    readOnly
                    className="focus:shadow-outline h-8 w-full resize-none appearance-none rounded border border-gray-500 bg-gray-600 py-2 px-3 leading-tight text-white shadow placeholder:italic focus:border-primary focus:bg-slate-900 focus:outline-none"
                    placeholder="copy after saving..."
                    type="text"
                    value={saveState}
                  />
                  <label className="text-xs">
                    {saveState ? saveStateToDate(saveState) : ""}
                  </label>
                </div>
                <Button onClick={() => sendAction("save")}>Save</Button>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex flex-col">
                  <input
                    type="text"
                    className="focus:shadow-outline h-8 w-full resize-none appearance-none rounded border border-gray-500 bg-gray-600 py-2 px-3 leading-tight text-white shadow placeholder:italic focus:border-primary focus:bg-slate-900 focus:outline-none"
                    placeholder="paste save state text here..."
                    value={loadState}
                    onChange={(e) => setLoadState(e.target.value)}
                  />
                  <label className="text-xs">
                    {loadState ? saveStateToDate(loadState) : ""}
                  </label>
                </div>
                <Button
                  disabled={loadState === ""}
                  onClick={() => sendAction("load", loadState)}
                >
                  Load
                </Button>
              </div>

              <div className="flex flex-col">
                <label className="text-xs">Auto save</label>
                <input
                  readOnly
                  className="focus:shadow-outline h-8 w-full resize-none appearance-none rounded border border-gray-500 bg-gray-600 py-2 px-3 leading-tight text-white shadow placeholder:italic focus:border-primary focus:bg-slate-900 focus:outline-none"
                  placeholder="auto save state"
                  type="text"
                  value={autoSaveState}
                />
                <label className="text-xs">
                  {autoSaveState ? saveStateToDate(autoSaveState) : ""}
                </label>
              </div>
            </div>
          ),
          settings: (
            <div className="flex flex-col gap-2">
              <div className="flex flex-col">
                <label>Input execution timer in ms</label>
                <input
                  type="number"
                  min={1}
                  className={`
                    focus:shadow-outline h-8 w-full resize-none appearance-none rounded border border-gray-500 bg-gray-600 py-2 px-3 leading-tight text-white shadow placeholder:italic focus:border-primary focus:bg-slate-900 focus:outline-none
                    ${errors.inputTimer && "border-red-600"} 
                  `}
                  {...register("inputTimer", {
                    valueAsNumber: true,
                  })}
                />
                {errors.inputTimer && (
                  <p className="text-xs text-red-600">
                    {errors.inputTimer.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col">
                <label>Autosave interval in minutes</label>
                <input
                  type="number"
                  min={1}
                  className={`
                    focus:shadow-outline h-8 w-full resize-none appearance-none rounded border border-gray-500 bg-gray-600 py-2 px-3 leading-tight text-white shadow placeholder:italic focus:border-primary focus:bg-slate-900 focus:outline-none
                    ${errors.autoSaveTimer && "border-red-500"} 
                  `}
                  {...register("autoSaveTimer", {
                    valueAsNumber: true,
                  })}
                />
                {errors.autoSaveTimer && (
                  <p className="text-xs text-red-600">
                    {errors.autoSaveTimer.message}
                  </p>
                )}
              </div>

              <div className="flex gap-2 items-center">
                <label>Enable auto save</label>
                <input
                  className="w-4 h-4"
                  type="checkbox"
                  {...register("autoSave")}
                />
              </div>

              <button
                className="bg-gray-600 enabled:hover:bg-gray-500 rounded px-2 py-1 mt-2"
                disabled={!isValid}
                onClick={handleSubmit(onSubmit)}
              >
                Update
              </button>
            </div>
          ),
        }[view]
      }
      <div className="flex justify-center gap-4 mt-auto">
        <button
          className="bg-gray-600 p-1 rounded hover:cursor-pointer hover:bg-gray-500"
          onClick={() => setView("home")}
        >
          <GameboySVG height={20} width={20} alt="gameboy" />
        </button>

        <button
          className="bg-gray-600 p-1 rounded hover:cursor-pointer hover:bg-gray-500"
          onClick={() => setView("state")}
        >
          <GameboyStateSVG height={20} width={20} alt="gameboy state" />
        </button>

        <button
          className="bg-gray-600 p-1 rounded hover:cursor-pointer hover:bg-gray-500"
          onClick={() => setView("settings")}
        >
          <SettingsSVG
            height={20}
            width={20}
            strokeWidth={1.5}
            alt="settings"
          />
        </button>
      </div>
    </div>
  );
}
