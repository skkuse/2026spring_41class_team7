declare module "gitignore-parser" {
  export function compile(content: string): {
    accepts: (input: string) => boolean;
    denies: (input: string) => boolean;
    maybe: (input: string) => boolean;
  };
}

declare module "didyoumean" {
  function didYouMean(
    str: string,
    list: string[],
  ): string | null;
  export = didYouMean;
}
