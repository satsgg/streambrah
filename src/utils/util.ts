export const MAX_MSG_LEN = 200;
export const fmtMsg = (content: string) => {
  if (content.length > MAX_MSG_LEN) {
    return content.slice(0, MAX_MSG_LEN).trim() + "...";
  }
  return content;
};
