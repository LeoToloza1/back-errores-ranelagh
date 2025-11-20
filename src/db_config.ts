import { Pool } from "pg";
import dotenv from "dotenv";
dotenv.config();

class ConfigDB {
    private readonly conexion: Pool;

    /**
     * Constructor de la clase ConfigDB
     *
     * Crea una conexión a la base de datos utilizando la cadena de conexión
     * especificada en la variable de entorno `DATABASE_URL` o, si no se proporciona,
     * una cadena de conexión predeterminada para una base de datos local.
     *
     * Establece la zona horaria para la conexión en 'America/Argentina/Buenos_Aires'
     * para que las fechas se almacenen y se recuperen con la hora correcta.
     *
     * @remarks
     * La zona horaria se establece en el evento 'connect' de la conexión para
     * asegurarnos de que se establezca cada vez que se abre una nueva conexión.
     * Si falla al establecer la zona horaria, se muestra un mensaje de error en
     * la consola.
     */
    constructor() {
        this.conexion = new Pool({
            connectionString: process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/registro_errores",
        });
        const timeZone = 'America/Argentina/Buenos_Aires';
        this.conexion.on('connect', async (client) => {
            try {
                await client.query(`SET TIMEZONE TO '${timeZone}';`);
                console.log(`[DB Conexión] Zona horaria establecida a ${timeZone} para la conexión.`);
            } catch (err) {
                console.error(`[DB Conexión] Error al establecer la zona horaria:`, err);
            }
        });
    }

    getConexion() {
        return this.conexion;
    }

}

const db = new ConfigDB();
export default db;