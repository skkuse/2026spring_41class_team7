export type Project = {
  name: string;
  path: string;
  editor?: string;
};

export type Settings = {
  commandToOpen: string;
  projects: Project[];
};

export type ProjectChoice = {
  name: string;
  path: string;
  editor?: string;
};
