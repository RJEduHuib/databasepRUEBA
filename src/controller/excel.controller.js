const orm = require('../Database/dataBase.orm')
const sql = require('../Database/dataBase.sql')
const path = require('path')
const csv = require('csv-parser');
const fs = require('fs');
const streamifier = require('streamifier');

const base = {}

base.mostrar = async (req, res) => {
    try {
        const id = req.params.id
        const [rows] = await sql.promise().query('SELECT MAX(idListBase) AS Maximo FROM listbases');
        const [pagina] = await sql.promise().query('SELECT * FROM pages where idPage = ?', [id])
        res.render('excel/add', { lista: rows, listaPagina: pagina, csrfToken: req.csrfToken() });
    } catch (error) {
        console.error('Error en la consulta:', error.message);
        res.status(500).send('Error al realizar la consulta')
    }
}

base.mandar = async (req, res) => {
    try {
        const buffer = req.file.buffer;
        const results = [];

        // Crea un flujo legible a partir del búfer
        const readableStream = streamifier.createReadStream(buffer);

        // Procesar el archivo CSV
        readableStream
            .pipe(csv({ separator: ',' })) // Ajusta el separador según tu archivo (puede ser ',' o ';')
            .on('data', (row) => {
                // Agregar cada fila a los resultados
                results.push(row);
            })
            .on('end', async () => {
                // Guardar los datos en la base de datos
                for (const row of results) {
                    await orm.base.create({
                        numberBase: row['TELEFONO'],
                        dateBase: new Date().toLocaleString(),
                    });
                }
                req.flash('success', 'Datos guardados correctamente');
                res.redirect('/ruta-de-redirección'); // Ajusta la ruta de redirección según tu aplicación
            });
    } catch (error) {
        console.error(error);
        req.flash('message', 'Error al procesar el archivo CSV');
        res.redirect('/ruta-de-error'); // Ajusta la ruta de error según tu aplicación
    }
};

base.lista = async (req, res) => {
    try {
        const id = req.params.id
        const [pagina] = await sql.promise().query('SELECT * FROM pages where idPage = ?', [id])
        const [row] = await sql.promise().query('SELECT * FROM bases ')
        res.render('excel/base', { lista: row, listaPagina: pagina, csrfToken: req.csrfToken() });
    } catch (error) {
        console.error('Error en la consulta:', error.message);
        res.status(500).send('Error al realizar la consulta')
    }
}

module.exports = base