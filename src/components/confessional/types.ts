export type ConfessionalPhase =
  | "idle"
  | "listening"
  | "swallowing"
  | "drained"
  | "wrong"
  | "done";

export const PIN_LENGTH = 6;

export interface PoemSnippet {
  id: string;
  title: string;
  content: string;
}
