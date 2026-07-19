import type { NextFunction, Request, Response } from 'express';
import type { ZodTypeAny } from 'zod';

type RequestPart = 'body' | 'query' | 'params';

export function validate(schema: ZodTypeAny, part: RequestPart = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const parsed = schema.parse(req[part]);
    req[part] = parsed;
    next();
  };
}
