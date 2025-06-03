export interface Poem {
  id: string;
  title: string;
  content: string;
  backgroundColor?: string;
}

export const poems: Poem[] = [
  {
    id: "quiet-fire",
    title: "Quiet Fire",
    content: "i am made of quiet fire.\nburning slow and steady,\nwarming those who come close enough\nto feel my light.",
    backgroundColor: "bg-blush"
  },
  {
    id: "doorway",
    title: "Doorway",
    content: "each verse is a doorway.\nstepping through,\ni find myself in worlds\ni didn't know existed\nuntil i wrote them into being.",
    backgroundColor: "bg-blush"
  },
  {
    id: "fragments",
    title: "Fragments",
    content: "these fragments i've collected—\nmoments of light,\nshards of feeling,\nechoes of memory—\nare the pieces that make me whole.",
    backgroundColor: "bg-blush"
  }
];

export function getPoemById(id: string): Poem | undefined {
  return poems.find(poem => poem.id === id);
}

export function getAllPoemIds(): string[] {
  return poems.map(poem => poem.id);
}
