export function toLocalTime(isoStringOrTimestamp: string | number): Date {
  let datumUtc: Date;
  if (typeof isoStringOrTimestamp === 'string') {
    if (isoStringOrTimestamp.endsWith("Z")) {
      datumUtc = new Date(isoStringOrTimestamp);
    } else {
      const isoStringUtc = isoStringOrTimestamp + "Z";
      datumUtc = new Date(isoStringUtc);
    }
  } else if (typeof isoStringOrTimestamp === 'number') {
    datumUtc = new Date(isoStringOrTimestamp);
    const zeitVerschiebungMinuten = new Date().getTimezoneOffset();
    const lokaleZeitInMs = datumUtc.getTime() - zeitVerschiebungMinuten * 60 * 1000;
    datumUtc = new Date(lokaleZeitInMs);
  } else {
    console.error("Ungültiger Eingabetyp. Erwartet wurde ein ISO-String oder ein UTC-Timestamp als Zahl.");
    return new Date(NaN);
  }

  return datumUtc;
}
