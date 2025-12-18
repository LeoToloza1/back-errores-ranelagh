import { Request, Response, NextFunction } from "express";

export const authRequired = (req: Request, res: Response, next: NextFunction) => {
    if (req.session && req.session.user) {
        return next();
    }
    return res.status(401).json({ error: "No autorizado. Inicie sesión." });
};