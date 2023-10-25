"use client";
import { useRef, useEffect, useState } from "react";
import { Virtuoso } from "react-virtuoso";
import { InputDisplay } from "./input";
import { InputAndAuthor } from "../util";
import { useSearchParams } from "next/navigation";

export default function Queue() {
  const [inputs, setInputs] = useState<InputAndAuthor[]>([]);
  const searchParams = useSearchParams();
  const relays = searchParams.getAll("relay");

  const bc = useRef(new BroadcastChannel("pokemon-inputs"));

  useEffect(() => {
    bc.current.onmessage = (event) => {
      console.debug("event data received", event.data);
      setInputs(event.data);
    };
  }, []);

  return (
    <div className="h-screen w-full text-white bg-gray-400">
      <Virtuoso
        data={inputs}
        className="no-scrollbar"
        itemContent={(index, input) => {
          return <InputDisplay input={input} relays={relays} />;
        }}
      />
    </div>
  );
}
