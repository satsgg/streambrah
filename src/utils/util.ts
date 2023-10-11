export const MAX_MSG_LEN = 200;
export const fmtMsg = (content: string) => {
  if (content.length > MAX_MSG_LEN) {
    return content.slice(0, MAX_MSG_LEN).trim() + "...";
  }
  return content;
};

const VIDEO_ID_REGEX = /(watch\?v=)?([\w\-\d]{11})/;
export const parseVideoId = (content: string): string | null => {
  if (content === "") return null;

  const parsedUrl = VIDEO_ID_REGEX.exec(content);
  if (!parsedUrl || !parsedUrl[2]) return null;

  return parsedUrl[2];
};
