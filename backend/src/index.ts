import app from './app';
import { getConnection } from './db';

const port = process.env.PORT ?? 4000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

const runQuery = async () => {
    const pool = await getConnection();

    if (pool) {
        try {
            // Ejemplo de consulta tipada
            const result = await pool.request()
                .query('SELECT * FROM subastas');
            
            console.log(result.recordset);
        } catch (error) {
            console.error("Error en la consulta: ", error);
        } finally {
            await pool.close(); // Cierra la conexión al finalizar
        }
    }
};

runQuery();
