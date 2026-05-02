declare module "gitignore-parser" {
  export function compile(content: string): {
    accepts: (input: string) => boolean;
    denies: (input: string) => boolean;
    maybe: (input: string) => boolean;
  };
}
