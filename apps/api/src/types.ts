export type Env = {
  Variables: {
    requestId: string;
    userId: string;
    userMeta: {
      fullName: string;
      email: string;
      avatarUrl: string | null;
    };
  };
};
