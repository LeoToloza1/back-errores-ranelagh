import express from "express";
import morgan from "morgan";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import session from "express-session";
import { fileURLToPath } from 'url';

// Repositorios
import { RepoPostgresUsuario } from "./repo/RepoPostgresUsuario.js";
import { RepoPostgresPersonal } from "./repo/RepoPostgresPersonal.js";
import { RepoPostrgresError } from "./repo/RepoPostrgresError.js";
// Servicios
import { AuthService } from "./services/authService.js";
import { LoginService } from "./services/loginService.js";
import { PersonalService } from "./services/PersonalService.js";
// Controladores
import { LoginController } from "./controller/LoginController.js";
import { PersonalController } from "./controller/PersonalController.js";
// Routers
import { LoginRouter } from "./Router/loginRouter.js";
import { ErroresRouter } from "./Router/router.js";
import { PersonalRouter } from "./Router/PersonalRouter.js";
// Configuración inicial
dotenv.config();
const app = express();
const puerto = process.env.PUERTO || 3000;

// --- CONFIGURACIÓN DE RUTAS Y ARCHIVOS ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set("view engine", "pug");
app.set("views", path.join(__dirname, 'views'));

// --- MIDDLEWARES GLOBALES ---
app.use(morgan("dev"));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// Configuración de Sesión
app.use(session({
    secret: process.env.SESSION_SECRET || 'clave_secreta_muy_segura',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Cambiar a true si usas HTTPS
        httpOnly: true,
        maxAge: 3600000 // 1 hora de sesión
    }
}));

// --- INYECCIÓN DE DEPENDENCIAS (EL "WIRING") ---

// 1. Capa de Datos (Repositorios)
const repoUsuario = new RepoPostgresUsuario();
const repoPersonal = new RepoPostgresPersonal();
const repoErrores = new RepoPostrgresError();

// 2. Capa de Negocio (Servicios)
const authService = new AuthService();
const loginService = new LoginService(repoUsuario, authService);
const personalService = new PersonalService(repoPersonal);

// 3. Capa de Presentación (Controladores)
const loginController = new LoginController(loginService);
const personalController = new PersonalController(personalService);
// Nota: Si ErroresRouter necesita un controlador, instáncialo aquí también.

// 4. Orquestación de Rutas (Routers)
const loginRouter = new LoginRouter(loginController);
const erroresRouter = new ErroresRouter(repoErrores); // O el controlador correspondiente
const personalRouter = new PersonalRouter(personalController);
// --- DEFINICIÓN DE RUTAS ---

// Montamos el router de autenticación (Login, Logout, Me, Cambiar Pass)
app.use("/api/auth", loginRouter.getRouter());
app.use("/api/personal", personalRouter.getRouter());

// Montamos el router de errores
app.use("/api/errores", erroresRouter.getRouter());

// Ruta para las vistas (Pug)
app.get("/", (req, res) => {
    res.render("index", { title: "Gestión de Errores" });
});
app.get("/login", (req, res) => {
    res.render("login", { title: "Gestión de Errores" });
});
app.get("/admin", (req, res) => {
    res.render("admin", { title: "Gestión de Errores" });
});

// Manejo de rutas no encontradas (404)
app.use((req, res) => {
    res.status(404).json({ error: "Ruta no encontrada" });
});

// --- LANZAMIENTO DEL SERVIDOR ---
app.listen(puerto, () => {
    console.log(`
    🚀 Servidor corriendo exitosamente
    Address: http://localhost:${puerto}
    Environment: ${process.env.NODE_ENV || 'development'}
    `);
});