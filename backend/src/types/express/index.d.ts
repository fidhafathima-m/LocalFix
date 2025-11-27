export {};

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        roles: string[];
        email?: string;
        currentRole?: string;
      };

      body: any;
      params: any;
      query: any;
      file?: any;
      files?: any;
    }
  }
}
