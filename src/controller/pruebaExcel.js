const fs = require('fs');
const csvParser = require('csv-parse');
const mysql = require('mysql2/promise');
const path = require('path'); // Asegúrate de importar el módulo 'path'
const { MYSQLHOST, MYSQLUSER, MYSQLPASSWORD, MYSQLDATABASE } = require("../keys");

// Configura la conexión a MySQL (igual que antes)
const dbConfig = {
    host: MYSQLHOST,
    user: MYSQLUSER,
    password: MYSQLPASSWORD,
    database: MYSQLDATABASE
};

// Maneja la carga de archivos desde la vista
const cargarArchivoCSV = async (req, res) => {
    try {
        const excelSubir = req.files.excelSubir;
        // Lee el archivo CSV
        const csvData = fs.readFileSync(excelSubir.tempFilePath, { encoding: 'utf-8' });

        // Parsea los datos del CSV
        const data = await new Promise((resolve, reject) => {
            csvParser(csvData, { delimiter: ',' }, (err, parsedData) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(parsedData);
                }
            });
        });

        // Inserta los datos en la tabla (asumiendo que la tabla se llama 'mi_tabla')
        const connection = await mysql.createConnection(dbConfig);
        for (const row of data) {
            await connection.execute('INSERT INTO bases (numberBase) VALUES (?)', [row[0]]);
        }
        await connection.end();

        console.log('Datos importados correctamente');
        res.send('Datos importados correctamente'); // Envía una respuesta al cliente
    } catch (error) {
        console.error('Error al importar datos:', error.message);
        res.status(500).send('Error al importar datos'); // Maneja errores
    }
};

module.exports = { cargarArchivoCSV };