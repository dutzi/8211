export function jsonTryParse(str: string | null) {
  try {
    return JSON.parse(str!);
  } catch (err) {
    return null;
  }
}
