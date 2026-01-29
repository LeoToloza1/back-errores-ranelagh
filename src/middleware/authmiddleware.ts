import { Request, Response, NextFunction } from "express";

export const authRequired = (req: Request, res: Response, next: NextFunction) => {
    if (req.session?.user) {
        return next();
    }

    // Si la petición espera un JSON (por ejemplo, una llamada de fetch/AJAX)
    if (req.xhr || req.headers.accept?.indexOf('json') !== -1) {
        return res.status(401).json({ error: "No autorizado. Inicie sesión." });
    }

    // Si es una navegación normal por el navegador, lo mandamos al login
    return res.redirect("/login");
};