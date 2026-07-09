import { Request, Response, NextFunction } from 'express';
import { verifySession } from '../db/auth.ts';

export interface AuthRequest extends Request {
  user?: any;
}

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: Missing token' });
    return;
  }

  const token = authHeader.split('Bearer ')[1];

  const username = verifySession(token);
  
  if (username) {
    req.user = { username };
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};
