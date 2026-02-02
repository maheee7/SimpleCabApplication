import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { TokenPayload } from '../models/userModel';

const JWT_SECRET = process.env.JWT_SECRET || 'oJBpjyICNsMQPdw4H28Q69toyYUjjob1Z7VrxWR9525';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ message: 'Authorization header with Bearer token is required' });
        return;
    }

    const token = authHeader.substring(7);

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
        (req as any).user = decoded;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(401).json({ message: 'Invalid or expired token' });
    }
};

export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user as TokenPayload;

    if (!user || user.role !== 'ADMIN') {
        res.status(403).json({ message: 'Access denied: Admin only' });
        return;
    }

    next();
};
