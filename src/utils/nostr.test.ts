import { getZapAmountFromReceipt, parseZapRequest } from "./nostr";
import { Event } from "nostr-tools";

const testRequest: Event<9734> = {
  kind: 9734,
  content: "Zap!",
  tags: [
    [
      "relays",
      "wss://nostr-pub.wellorder.com",
      "wss://anotherrelay.example.com",
    ],
    ["amount", "21000"],
    [
      "lnurl",
      "lnurl1dp68gurn8ghj7um5v93kketj9ehx2amn9uh8wetvdskkkmn0wahz7mrww4excup0dajx2mrv92x9xp",
    ],
    ["p", "04c915daefee38317fa734444acee390a8269fe5810b2241e5e6dd343dfbecc9"],
    ["e", "9ae37aa68f48645127299e9453eb5d908a0cbb6058ff340d528ed4d37c8994fb"],
  ],
  pubkey: "97c70a44366a6535c145b333f973ea86dfdc2d7a99da618c40c64705ad98e322",
  created_at: 1679673265,
  id: "30efed56a035b2549fcaeec0bf2c1595f9a9b3bb4b1a38abaf8ee9041c4b7d93",
  sig: "f2cb581a84ed10e4dc84937bd98e27acac71ab057255f6aa8dfa561808c981fe8870f4a03c1e3666784d82a9c802d3704e174371aa13d63e2aeaf24ff5374d9d",
};

describe("parseZapRequest()", () => {
  it("should work", () => {
    const parsed = parseZapRequest(testRequest);
    if (!parsed) throw new Error("should have worked");

    expect(parsed.content).toBe(testRequest.content);
    expect(parsed.relays).toStrictEqual([
      "wss://nostr-pub.wellorder.com",
      "wss://anotherrelay.example.com",
    ]);
  });
});
