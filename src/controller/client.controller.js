const orm = require('../Database/dataBase.orm')
const sql = require('../Database/dataBase.sql')
const path = require('path')
const helpers = require('../lib/helpers');
const bcrypt = require('bcrypt');
const { cifrarDatos, descifrarDatos } = require('../lib/encrypDates');
const { validationResult } = require('express-validator')

const client = {}

client.mostrar = async (req, res) => {
    try {
        const ids = req.params.id
        const [rows] = await sql.promise().query('SELECT MAX(idClient) AS Maximo FROM clients');
        const [pagina] = await sql.promise().query('SELECT * FROM usuarioPagina where idPage = ?', [ids])
        res.render('clients/add', { lista: rows, listaPagina: pagina, csrfToken: req.csrfToken() });
    } catch (error) {
        console.error('Error en la consulta:', error.message);
        res.status(500).send('Error al realizar la consulta')
    }
}

client.mandar = async (req, res) => {
    const ids = req.params.id;
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { idClient, completeNameClient, identificationCardClient, emailClient, cellPhoneClient, usernameClient, passwordClient } = req.body
        const hashedPassword = await helpers.hashPassword(passwordClient);
        let newClient = {
            idClient,
            completeNameClient: cifrarDatos(completeNameClient),
            identificationCardClient: cifrarDatos(identificationCardClient),
            emailClient: cifrarDatos(emailClient),
            cellPhoneClient: cifrarDatos(cellPhoneClient),
            usernameClient: cifrarDatos(usernameClient),
            passwordClient: hashedPassword,
            stateClient: 'activado',
            createClient: new Date().toLocaleString()
        };

        const newDetailClient = {
            createdetailClients: new Date().toLocaleString(),
            clientIdClient: idClient,
            pageIdPage: ids
        }

        await orm.client.create(newClient)
        await orm.detailClients.create(newDetailClient)

        const imagenUsuario = req.files.photoClient;
        const validacion = path.extname(imagenUsuario.name);
        const extencion = [".PNG", ".JPG", ".JPEG", ".GIF", ".TIF", ".png", ".jpg", ".jpeg", ".gif", ".tif"];

        if (!extencion.includes(validacion)) {
            return req.flash("message", "Imagen no compatible.");
        }

        if (!req.files) {
            return req.flash("message", "Imagen no insertada.");
        }

        const filePath = __dirname + '/../public/img/cliente/' + imagenUsuario.name;

        imagenUsuario.mv(filePath, (err) => {
            if (err) {
                console.error(err);
                return req.flash("message", "Error al guardar la imagen.");
            } else {
                sql.promise().query("UPDATE clients SET photoClient = ? WHERE idClient = ?", [imagenUsuario.name, idClient])
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
        req.flash('success', 'Se creo el cliente')
        res.redirect('/clients/list/' + ids);
    } catch (error) {
        console.log(error)
        req.flash('message', 'Error al guardar el cliente')
        res.redirect('/clients/add/' + ids);
    }
}

client.lista = async (req, res) => {
    try {
        const id = req.params.id
        const [pagina] = await sql.promise().query('SELECT * FROM usuarioPagina WHERE idPage = ?', [id])
        const [rows] = await sql.promise().query('SELECT * FROM clienteCompania WHERE idPage = ?', [id])
        res.render('clients/list', { lista: rows, listaPagina: pagina, csrfToken: req.csrfToken() });
    } catch (error) {
        res.status(500).send('Error al realizar la consulta')
    }
}

client.traerDatos = async (req, res) => {
    try {
        const id = req.params.id
        const [rows] = await sql.promise().query('SELECT * FROM clienteCompania where idClient = ?', [id])
        res.render('clients/update', { lista: rows, csrfToken: req.csrfToken() });
    } catch (error) {
        console.error('Error en la consulta:', error.message);
        res.status(500).send('Error al realizar la consulta')
    }
}

client.actualizar = async (req, res) => {
    const ids = req.params.id;
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { completeNameClient, identificationCardClient, emailClient, cellPhoneClient, usernameClient, passwordClient, stateClient } = req.body
        const newSpeciality = {
            completeNameClient,
            identificationCardClient,
            emailClient,
            cellPhoneClient,
            usernameClient,
            passwordClient,
            stateClient,
            updateClient: new Date().toLocaleString()
        }
        await orm.client.findOne({ where: { idClient: ids } })
            .then((result) => {
                result.update(newSpeciality)
                req.flash('success', 'Se Actualizo el tipo de espesialización')
                res.redirect('/clients/list/' + ids);
            })
    } catch (error) {
        req.flash('message', 'Error al Actualizar el tipo de espesialización')
        res.redirect('/clients/update/' + ids);
    }
}

client.desabilitar = async (req, res) => {
    const ids = req.params.id;
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const newSpeciality = {
            stateClient: 'inhabilitado',
            updateClient: new Date().toLocaleString(),
        }
        await orm.client.findOne({ where: { idClient: ids } })
            .then((result) => {
                result.update(newSpeciality)
                req.flash('success', 'Se Desabilito el tipo de espesialización')
                res.redirect('/clients/list/' + ids);
            })
    } catch (error) {
        req.flash('message', 'Error al Desabilitar el tipo de espesialización')
        res.redirect('/clients/update/' + ids);
    }
}

module.exports = client