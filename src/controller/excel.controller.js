const orm = require('../Database/dataBase.orm')
const sql = require('../Database/dataBase.sql')
const path = require('path')
const fs = require('fs');
const mysql = require('mysql2/promise'); // Asegúrate de importar el módulo 'path'
const { MYSQLHOST, MYSQLUSER, MYSQLPASSWORD, MYSQLDATABASE } = require("../keys");

const dbConfig = {
    host: MYSQLHOST,
    user: MYSQLUSER,
    password: MYSQLPASSWORD,
    database: MYSQLDATABASE
};

const base = {}

base.mostrar = async (req, res) => {
    try {
        const id = req.params.id
        const [rows] = await sql.promise().query('SELECT MAX(idInitialBase) AS Maximo FROM initialbases');
        const [pagina] = await sql.promise().query('SELECT * FROM pages where idPage = ?', [id])
        res.render('excel/add', { lista: rows, listaPagina: pagina, csrfToken: req.csrfToken() });
    } catch (error) {
        console.error('Error en la consulta:', error.message);
        res.status(500).send('Error al realizar la consulta')
    }
}

base.mandar = async (req, res) => {
    const id = req.params.id
    try {
        const { idBase } = req.body
        const imagenUsuario = req.files.excelSubir;
        const validacion = path.extname(imagenUsuario.name);
        const extencion = [".csv"];

        if (!extencion.includes(validacion)) {
            return req.flash("message", "Excel no compatible.");
        }

        if (!req.files) {
            return req.flash("message", "Excel no insertada.");
        }

        const filePath = __dirname + '/../public/excel/' + imagenUsuario.name;

        imagenUsuario.mv(filePath, (err) => {
            if (err) {
                console.error(err);
                return req.flash("message", "Error al guardar el excel.");
            } else {
                sql.promise().query("INSERT INTO initialbases(baseDoc, pageIdPage) VALUES (?, ?)", [imagenUsuario.name, id])
                /* const formData = {
                    image: {
                        value: fs.createReadStream(filePath),
                        options: {
                            filename: imagenUsuario.name,
                            contentType: imagenUsuario.mimetype,
                        },
                    },
                };
 
                const postRequesten = request.post({
                    url: 'http://localhost:5000/imagenEvento',
                    formData: formData,
                });
 
                req.setTimeout(0);
 
                postRequesten.on('error', function (err) {
                    console.error('upload failed:', err);
                    req.flash("success", "Error al subir imagen.");
                });
 
                postRequesten.on('response', function (response) {
                    console.log('Upload successful! Server responded with:', response.statusCode);
                }); */
            }
        });

        const excelSubir = path.join(__dirname, '../public/excel/' + imagenUsuario.name);

        const csvData = fs.readFileSync(excelSubir, { encoding: 'utf-8' });

        // Parsea los datos del CSV
        const rows = csvData.split('\n'); // Divide el contenido en filas
        const connection = await mysql.createConnection(dbConfig);
        for (const row of rows) {
            const numeroBase = row.trim(); // Elimina espacios en blanco alrededor del número
            if (numeroBase) { // Verifica que no sea una fila vacía
                const numerosSinComas = numeroBase.replace(/;/g, ''); // Elimina las comas
                await connection.execute('INSERT INTO detailinitialbases (numerosBaseInicial, createDetailInitialBase, InitialBaseIdInitialBase) VALUES (?, ?, ?)', [numerosSinComas, new Date().toLocaleString(), idBase]);
            }
        }
        await connection.end();

        console.log('Datos importados correctamente');
        res.send('Datos importados correctamente');

        req.flash('success', 'Exito al guardar');
        res.redirect('/listBase/list/' + id);
    } catch (error) {
        // Manejo de errores mejorado
        console.error(error);
        req.flash('message', 'Error al guardar');
        res.redirect('/listBase/add/' + id);
    }
};

base.lista = async (req, res) => {
    try {
        const id = req.params.id
        const [pagina] = await sql.promise().query('SELECT * FROM pages where idPage = ?', [id])
        const [operadoraMovistar] = await sql.promise().query('SELECT * FROM typeOperators WHERE pageIdPage = ? and idTypeOperator = "1"', [id])
        const [operadoraCnt] = await sql.promise().query('SELECT * FROM typeOperators WHERE pageIdPage = ? and idTypeOperator = "2"', [id])
        const [operadoraClaro] = await sql.promise().query('SELECT * FROM typeOperators WHERE pageIdPage = ? and idTypeOperator = "3"', [id])
        const [row] = await sql.promise().query('SELECT * FROM initialbases where pageIdPage = ?', [id])
        res.render('excel/list', { lista: row, listaPagina: pagina, listaOperadoraMovistar: operadoraMovistar, listaOperadoraClaro: operadoraClaro, listaOperadoraCnt: operadoraCnt, csrfToken: req.csrfToken() });
    } catch (error) {
        console.error('Error en la consulta:', error.message);
        res.status(500).send('Error al realizar la consulta')
    }
}

base.listaDetalleMovistar = async (req, res) => {
    try {
        const id = req.params.id
        const [pagina] = await sql.promise().query('SELECT * FROM pages where idPage = ?', [id])
        const [row2] = await sql.promise().query('SELECT * FROM initialbases where pageIdPage = ?', [id])
        const [row] = await sql.promise().query('SELECT * FROM detailinitialbases where InitialBaseIdInitialBase = ?', [id])
        res.render('excel/baseMovistar', { lista: row, listaPagina: pagina, listaInicial: row2, csrfToken: req.csrfToken() });
    } catch (error) {
        console.error('Error en la consulta:', error.message);
        res.status(500).send('Error al realizar la consulta')
    }
}

base.listaDetalleClaro = async (req, res) => {
    try {
        const id = req.params.id
        const [pagina] = await sql.promise().query('SELECT * FROM pages where idPage = ?', [id])
        const [row2] = await sql.promise().query('SELECT * FROM initialbases where pageIdPage = ?', [id])
        const [row] = await sql.promise().query('SELECT * FROM detailinitialbases where InitialBaseIdInitialBase = ?', [id])
        res.render('excel/baseClaro', { lista: row, listaPagina: pagina, listaInicial: row2, csrfToken: req.csrfToken() });
    } catch (error) {
        console.error('Error en la consulta:', error.message);
        res.status(500).send('Error al realizar la consulta')
    }
}

base.listaDetalleCnt = async (req, res) => {
    try {
        const id = req.params.id
        const [pagina] = await sql.promise().query('SELECT * FROM pages where idPage = ?', [id])
        const [row2] = await sql.promise().query('SELECT * FROM initialbases where pageIdPage = ?', [id])
        const [row] = await sql.promise().query('SELECT * FROM detailinitialbases where InitialBaseIdInitialBase = ?', [id])
        res.render('excel/baseCnt', { lista: row, listaPagina: pagina, listaInicial: row2, csrfToken: req.csrfToken() });
    } catch (error) {
        console.error('Error en la consulta:', error.message);
        res.status(500).send('Error al realizar la consulta')
    }
}

module.exports = base