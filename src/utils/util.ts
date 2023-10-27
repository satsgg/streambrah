export const MAX_MSG_LEN = 200;
export const fmtMsg = (content: string, maxLen: number = MAX_MSG_LEN) => {
  if (content.length > maxLen) {
    return content.slice(0, maxLen).trim() + "...";
  }
  return content;
};

export const fmtNumber = (number: number, compact: boolean = false) => {
  let notation: Intl.NumberFormatOptions | undefined = undefined;
  if (compact) notation = { notation: "compact", maximumSignificantDigits: 3 };
  return Intl.NumberFormat("en", notation).format(number);
};
