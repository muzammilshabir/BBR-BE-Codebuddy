export interface IRedisGetPayload {
  prefix: string;
  key: string;
}

export interface IRedisSetPayload extends IRedisGetPayload {
  value: string;
  expiry?: number;
}

export interface RedisRepositoryInterface {
  get(payload: IRedisGetPayload): Promise<string | null>;
  set(payload: IRedisSetPayload): Promise<void>;
  delete(payload: IRedisGetPayload): Promise<void>;
}
