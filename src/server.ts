import express, { Request, Response } from "express";
import morgan from "morgan";
import { ErroresRouter } from "./router.js";
import cors from "cors";
import { JsonRepositorio } from "./repo/jsonRepositorio.js";
import path from "path";
import { fileURLToPath } from 'url';
import { RepoPostrgresError } from "./repo/RepoPostrgresError.js";

import dotenv from "dotenv";
import { RepoPostgresPersonal } from "./repo/RepoPostgresPersonal.js";
dotenv.config();

const app = express();
const puerto = process.env.PUERTO || 3000;

// Middlewares
app.use(morgan("dev"));
app.use(express.json());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

app.use(cors());


app.set("view engine", "pug");
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.set("views", path.join(__dirname, 'views'));


const repo = new JsonRepositorio("json/personal.json");
const repoPostgres = new RepoPostrgresError();
const repoPersonal = new RepoPostgresPersonal();
// Rutas
app.use("/api", new ErroresRouter(repoPersonal, repoPostgres).router);
app.get("/", (_req: Request, res: Response) => res.render("index"));

// Servidor
app.listen(puerto, () => {
    console.log(`Servidor corriendo en http://localhost:${puerto}`);
});
