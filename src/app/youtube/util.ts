export type Video = {
  pubkey: string;
  eventId: string;
  amount: number;
  id: string;
  title: string;
  author: string;
  thumbnail: string;
};

export type Playlist = {
  nowPlaying: Video | null;
  queue: Video[];
};

export const queryVideo = async (id: string) => {
  const cleanedVideoUrl = "https://www.youtube.com/watch?v=" + id;
  const oembedUrl = "https://www.youtube.com/oembed?url=";
  const query =
    oembedUrl + encodeURIComponent(cleanedVideoUrl + "&format=json");

  const res = await fetch(query);
  if (res.ok) {
    const resJson = await res.json();
    console.debug("resJson", resJson);
    return {
      title: resJson.title,
      author: resJson.author_name,
      thumbnail: resJson.thumbnail_url,
    };
  }

  return null;
};

const VIDEO_ID_REGEX = /(watch\?v=)?([\w\-\d]{11})/;
export const parseVideoId = (content: string): string | null => {
  if (content === "") return null;

  const parsedUrl = VIDEO_ID_REGEX.exec(content);
  if (!parsedUrl || !parsedUrl[2]) return null;

  return parsedUrl[2];
};

export const testVideos = [
  {
    pubkey: "e9038e10916d910869db66f3c9a1f41535967308b47ce3136c98f1a6a22a6150",
    eventId: "123",
    amount: 123,
    id: "Yaxq3iggMdM",
  },
  {
    pubkey: "e9038e10916d910869db66f3c9a1f41535967308b47ce3136c98f1a6a22a6150",
    eventId: "311",
    amount: 69,
    id: "4ASKMcdCc3g",
  },
  {
    pubkey: "e9038e10916d910869db66f3c9a1f41535967308b47ce3136c98f1a6a22a6150",
    eventId: "619",
    amount: 420,
    id: "xzpndHtdl9A",
  },
  {
    pubkey: "e9038e10916d910869db66f3c9a1f41535967308b47ce3136c98f1a6a22a6150",
    eventId: "300000",
    amount: 18,
    id: "aqx8K3n6Rlo",
  },
];
