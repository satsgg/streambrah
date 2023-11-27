export type StreamConfig = {
  pubkey: string;
  d: string;
  title: string;
  summary: string;
  image?: string;
  t?: string[];
  streaming: string;
  recording?: string;
  starts?: string;
  ends?: string;
  prevStatus?: "planned" | "live" | "ended";
  status?: "planned" | "live" | "ended";
  currentParticipants?: string;
  totalParticipants?: string;
  p: string[];
  relays: string[];
};
