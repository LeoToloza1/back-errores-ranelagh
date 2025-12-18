import express, { Request, Response } from "express";
import morgan from "morgan";
import { ErroresRouter } from "./Router/router.js";
import cors from "cors";
import { JsonRepositorio } from "./repo/jsonRepositorio.js";
import path from "path";
import { fileURLToPath } from 'url';
import { RepoPostrgresError } from "./repo/RepoPostrgresError.js";

import dotenv from "dotenv";
import { RepoPostgresPersonal } from "./repo/RepoPostgresPersonal.js";
import { ViewsRouter } from "./Router/viewsRouter.js";
import session from "express-session";
import { RepoPostgresUsuario } from "./repo/RepoPostgresUsuario.js";
import { LoginController } from "./controller/LoginController.js";
dotenv.config();

const app = express();
const puerto = process.env.PUERTO || 3000;

// Middlewares
app.use(morgan("dev"));
app.use(express.json());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: process.env.SESSION_SECRET || 'default_secret', // Cambia esto en producción
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Cambia a true si usas HTTPS
}));

app.use(cors());


app.set("view engine", "pug");
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.set("views", path.join(__dirname, 'views'));

const repoPostgres = new RepoPostrgresError();
const repoPersonal = new RepoPostgresPersonal();
const repoUsuario = new RepoPostgresUsuario();
const loginController = new LoginController(repoUsuario);
// Rutas
app.use("/", new ViewsRouter(repoPersonal, repoPostgres).router);
app.use("/api", new ErroresRouter(repoPersonal, repoPostgres).router);

// Rutas de autenticación
app.post("/api/login", (req, res) => loginController.login(req, res));
app.post("/api/logout", (req, res) => loginController.logout(req, res));
app.get("/api/current-user", (req, res) => loginController.getCurrentUser(req, res));

// Servidor
app.listen(puerto, () => {
    console.log(`Servidor corriendo en http://localhost:${puerto}`);
});
