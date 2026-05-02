export type SavedProject = {
  name: string;
  path: string;
  editor?: string;
};

export type SavedProjectsSettings = {
  commandToOpen: string;
  projects: SavedProject[];
};
