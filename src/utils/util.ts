export const MAX_MSG_LEN = 200;
export const fmtMsg = (content: string, maxLen: number = MAX_MSG_LEN) => {
  if (content.length > maxLen) {
    return content.slice(0, maxLen).trim() + "...";
  }
  return content;
};
