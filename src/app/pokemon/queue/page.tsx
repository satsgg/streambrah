"use client";
import { useRef, useEffect, useState } from "react";
import { Virtuoso } from "react-virtuoso";
import { InputDisplay } from "./input";
import { InputAndAuthor } from "../util";
import { useSearchParams } from "next/navigation";

export default function Queue() {
  const [events, setEvents] = useState<InputAndAuthor[]>([]);
  const searchParams = useSearchParams();
  const relays = searchParams.getAll("relay");

  const bc = useRef(new BroadcastChannel("pokemon-inputs"));

  useEffect(() => {
    bc.current.onmessage = (event) => {
      setEvents(event.data);
    };
  }, []);

  return (
    <div className="flex justify-center h-screen w-full nowrap text-white">
      <Virtuoso
        data={events}
        className="no-scrollbar"
        itemContent={(index, input) => {
          return <InputDisplay input={input} relays={relays} />;
        }}
      />
    </div>
  );
}
