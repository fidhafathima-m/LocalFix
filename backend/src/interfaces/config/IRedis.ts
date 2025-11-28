export interface IRedis {
  connect(): Promise<void>;
  get(key: string): Promise<string | null>;
  setex(key: string, seconds: number, value: string): Promise<void>;
  del(key: string): Promise<void>;
  disconnect(): Promise<void>;
}
