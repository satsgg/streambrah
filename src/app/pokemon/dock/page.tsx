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
    <div className="flex flex-col justify-between h-screen bg-gray-800 text-white text-sm whitespace-nowrap p-2">
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
                <button
                  className="bg-gray-600 hover:bg-gray-500 rounded px-2 py-1"
                  onClick={() => sendAction("save")}
                >
                  Save
                </button>
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
                <button
                  className="bg-gray-600 enabled:hover:bg-gray-500 rounded px-2 py-1"
                  disabled={loadState === ""}
                  onClick={() => sendAction("load", loadState)}
                >
                  Load
                </button>
              </div>

              <div className="flex flex-col">
                <label className="text-xs">auto save</label>
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
                <label>Enable autosave</label>
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
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="#ffffff"
            version="1.1"
            id="Capa_1"
            width={20}
            height={20}
            viewBox="0 0 576.859 576.859"
          >
            <g>
              <g>
                <path d="M464.695,0H112.161c-14.29,0-25.894,11.595-25.894,25.896v525.067c0,14.301,11.605,25.896,25.894,25.896h258.517    c66.229,0,119.915-53.688,119.915-119.906V25.896C490.593,11.595,478.987,0,464.695,0z M135.085,80.745    c0-11.744,9.523-21.255,21.259-21.255h264.168c11.736,0,21.257,9.511,21.257,21.255v149.381c0,11.745-9.521,21.255-21.257,21.255    H156.345c-11.736,0-21.259-9.51-21.259-21.255V80.745z M264.431,430.222c0,4.657-3.776,8.433-8.431,8.433h-31.23v31.228    c0,4.658-3.774,8.433-8.432,8.433h-40.82c-4.657,0-8.433-3.774-8.433-8.433v-31.228h-31.224c-4.658,0-8.434-3.776-8.434-8.433    V389.4c0-4.657,3.776-8.433,8.434-8.433h31.226v-31.229c0-4.657,3.776-8.432,8.433-8.432h40.823c4.657,0,8.431,3.773,8.431,8.432    v31.229h31.23c4.655,0,8.431,3.774,8.431,8.433v40.821H264.431z M353.756,490.33c-17.257,0-31.245-13.988-31.245-31.246    c0-17.257,13.988-31.247,31.245-31.247c17.258,0,31.246,13.988,31.246,31.247C385.004,476.342,371.014,490.33,353.756,490.33z     M411.442,394.188c-17.258,0-31.244-13.987-31.244-31.246c0-17.258,13.986-31.247,31.244-31.247    c17.259,0,31.247,13.987,31.247,31.247C442.689,380.2,428.701,394.188,411.442,394.188z" />
              </g>
            </g>
          </svg>
        </button>

        <button
          className="bg-gray-600 p-1 rounded hover:cursor-pointer hover:bg-gray-500"
          onClick={() => setView("state")}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={20}
            height={20}
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M18.1716 1C18.702 1 19.2107 1.21071 19.5858 1.58579L22.4142 4.41421C22.7893 4.78929 23 5.29799 23 5.82843V20C23 21.6569 21.6569 23 20 23H4C2.34315 23 1 21.6569 1 20V4C1 2.34315 2.34315 1 4 1H18.1716ZM4 3C3.44772 3 3 3.44772 3 4V20C3 20.5523 3.44772 21 4 21L5 21L5 15C5 13.3431 6.34315 12 8 12L16 12C17.6569 12 19 13.3431 19 15V21H20C20.5523 21 21 20.5523 21 20V6.82843C21 6.29799 20.7893 5.78929 20.4142 5.41421L18.5858 3.58579C18.2107 3.21071 17.702 3 17.1716 3H17V5C17 6.65685 15.6569 8 14 8H10C8.34315 8 7 6.65685 7 5V3H4ZM17 21V15C17 14.4477 16.5523 14 16 14L8 14C7.44772 14 7 14.4477 7 15L7 21L17 21ZM9 3H15V5C15 5.55228 14.5523 6 14 6H10C9.44772 6 9 5.55228 9 5V3Z"
              fill="#ffffff"
            />
          </svg>
        </button>

        <button
          className="bg-gray-600 p-1 rounded hover:cursor-pointer hover:bg-gray-500"
          onClick={() => setView("settings")}
        >
          <svg
            width={20}
            height={20}
            strokeWidth={1.5}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              d="M17.3 10.453l1.927.315a.326.326 0 01.273.322v1.793a.326.326 0 01-.27.321l-1.93.339c-.111.387-.265.76-.459 1.111l1.141 1.584a.326.326 0 01-.034.422l-1.268 1.268a.326.326 0 01-.418.037l-1.6-1.123a5.482 5.482 0 01-1.118.468l-.34 1.921a.326.326 0 01-.322.269H11.09a.325.325 0 01-.321-.272l-.319-1.911a5.5 5.5 0 01-1.123-.465l-1.588 1.113a.326.326 0 01-.418-.037L6.052 16.66a.327.327 0 01-.035-.42l1.123-1.57a5.497 5.497 0 01-.47-1.129l-1.901-.337a.326.326 0 01-.269-.321V11.09c0-.16.115-.296.273-.322l1.901-.317c.115-.393.272-.77.47-1.128l-1.11-1.586a.326.326 0 01.037-.417L7.34 6.052a.326.326 0 01.42-.034l1.575 1.125c.354-.194.73-.348 1.121-.46l.312-1.91a.326.326 0 01.322-.273h1.793c.159 0 .294.114.322.27l.336 1.92c.389.112.764.268 1.12.465l1.578-1.135a.326.326 0 01.422.033l1.268 1.268a.326.326 0 01.036.418L16.84 9.342c.193.352.348.724.46 1.11zM9.716 12a2.283 2.283 0 104.566 0 2.283 2.283 0 00-4.566 0z"
              clipRule="evenodd"
            ></path>
          </svg>
        </button>
      </div>
    </div>
  );
}
