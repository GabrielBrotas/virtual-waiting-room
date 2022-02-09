import { ForbiddenException, Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken';

@Injectable()
export class EnsureAuth implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization

    if (!authHeader) throw new ForbiddenException("JWT token is missing"); 

    const [, token] = authHeader.split(' ');

    try {
        const decoded = verify(token, process.env.JWT_SECRET_KEY as string);

        const { sub } = decoded;
        
        (req as any).user = {
            _id: sub,
        };

        return next();
    } catch (err) {
        throw new ForbiddenException("Token expired"); 
    }

  }
}
