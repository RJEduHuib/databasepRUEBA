const orm = require('../Database/dataBase.orm')
const sql = require('../Database/dataBase.sql')
const path = require('path')
const { validationResult } = require('express-validator');
const page = {}

page.mostrar = async (req, res) => {
    const rol = await orm.rolUser.findOne({ where: { userIdUser: req.user.idUser } })
    if (rol.userIdUser == '1') {
        try {
            const id = req.params.id
            const [pagina] = await sql.promise().query('SELECT * FROM usuarioPagina WHERE userIdUser = ?', [id]);
            const [rows] = await sql.promise().query('SELECT MAX(idPage) AS Maximo FROM pages');
            const [rows2] = await sql.promise().query('SELECT * FROM usuarioPagina WHERE userIdUser = ?', [req.user.idUser])
            res.render('page/add', { lista: rows, validacion: rows2, listaPagina: pagina, csrfToken: req.csrfToken() });
        } catch (error) {
            console.error('Error en la consulta:', error.message);
            res.status(500).send('Error al realizar la consulta');
        }
    } else {
        return res.redirect("/listBase/list/" + req.user.idUser);
    }
};

page.mandar = async (req, res) => {
    const ids = req.params.id;
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const id = req.user.idUser;
        const { idPage, namePage, descriptionPage, misonPage, visonPage, cellPhonePage, emailPage } = req.body;
        const newPage = {
            idPage,
            namePage,
            descriptionPage,
            misonPage,
            visonPage,
            cellPhonePage,
            emailPage,
            createPage: new Date().toLocaleString(),
            statePage: 'Activo',
            userIdUser: id
        };
        await orm.page.create(newPage);

        const newRol = {
            pageIdPage: idPage
        }
        await orm.rolUser.findOne({ where: { userIdUser: ids } })
            .then((result) => {
                result.update(newRol)
            })
        const imagenUsuario = req.files.photoPage;
        const validacion = path.extname(imagenUsuario.name);
        const extencion = [".PNG", ".JPG", ".JPEG", ".GIF", ".TIF", ".png", ".jpg", ".jpeg", ".gif", ".tif"];

        if (!extencion.includes(validacion)) {
            return req.flash("message", "Imagen no compatible.");
        }

        if (!req.files) {
            return req.flash("message", "Imagen no insertada.");
        }

        const filePath = __dirname + '/../public/img/page/' + imagenUsuario.name;

        imagenUsuario.mv(filePath, (err) => {
            if (err) {
                console.error(err);
                return req.flash("message", "Error al guardar la imagen.");
            } else {
                sql.promise().query("UPDATE pages SET photoPage = ? WHERE idPage = ?", [imagenUsuario.name, idPage])
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
        await sql.promise().execute('INSERT INTO typeOperators(idTypeOperator, nameTypeOperator, stateTypeOperator, createTypeOperator, pageIdPage) VALUES ("1","Movistar", "Activo", ?, ?)', [new Date().toLocaleString(), idPage])
        await sql.promise().execute('INSERT INTO typeOperators(idTypeOperator, nameTypeOperator, stateTypeOperator, createTypeOperator, pageIdPage) VALUES ("2","Cnt", "Activo", ?, ?)', [new Date().toLocaleString(), idPage])
        await sql.promise().execute('INSERT INTO typeOperators(idTypeOperator, nameTypeOperator, stateTypeOperator, createTypeOperator, pageIdPage) VALUES ("3","Claro", "Activo", ?, ?)', [new Date().toLocaleString(), idPage])
        req.flash('success', 'Exito al guardar');
        res.redirect('/page/list/' + id);
    } catch (error) {
        // Manejo de errores mejorado
        console.error(error);
        req.flash('message', 'Error al guardar');
        res.redirect('/page/add/' + ids);
    }
}

page.lista = async (req, res) => {
    const rol = await orm.rolUser.findOne({ where: { userIdUser: req.user.idUser } })
    if (rol.userIdUser == '1') {
        try {
            const ids = req.params.id
            const [row] = await sql.promise().query('SELECT * FROM usuarioPagina WHERE userIdUser = ?', [ids])
            res.render('page/list', { listaPagina: row })
        } catch (error) {
            console.error('Error en la consulta:', error.message);
            res.status(500).send('Error al realizar la consulta');
        }
    } else {
        return res.redirect("/listBase/list/" + req.user.idUser);
    }
}

page.traerDatos = async (req, res) => {
    const rol = await orm.rolUser.findOne({ where: { userIdUser: req.user.idUser } })
    if (rol.userIdUser == '1') {
        try {
            const id = req.params.id
            const [pagina] = await sql.promise().query('SELECT * FROM pages WHERE idPage = ?', [id])
            const [row] = await sql.promise().query('SELECT * FROM pages WHERE idPage = ?', [id])
            res.render('page/Update', { lista: row, listaPagina: pagina, csrfToken: req.csrfToken() })
        } catch (error) {
            console.error('Error en la consulta:', error.message);
            res.status(500).send('Error al realizar la consulta');
        }
    } else {
        return res.redirect("/listBase/list/" + req.user.idUser);
    }
}

page.Actualizar = async (req, res) => {
    const ids = req.params.id;
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const id = req.user.idUser;
        const { namePage, descriptionPage, misonPage, visonPage, cellPhonePage, emailPage } = req.body;
        const newPage = {
            namePage,
            descriptionPage,
            misonPage,
            visonPage,
            cellPhonePage,
            emailPage,
            updatePage: new Date().toLocaleString()
        };
        await orm.page.findOne({ where: { idPage: ids } })
            .then((result) => {
                result.update(newPage)
            })
        const imagenUsuario = req.files.photoPage;
        const validacion = path.extname(imagenUsuario.name);
        const extencion = [".PNG", ".JPG", ".JPEG", ".GIF", ".TIF", ".png", ".jpg", ".jpeg", ".gif", ".tif"];

        if (!extencion.includes(validacion)) {
            return req.flash("message", "Imagen no compatible.");
        }

        if (!req.files) {
            return req.flash("message", "Imagen no insertada.");
        }

        const filePath = __dirname + '/../public/img/page/' + imagenUsuario.name;

        imagenUsuario.mv(filePath, (err) => {
            if (err) {
                console.error(err);
                return req.flash("message", "Error al guardar la imagen.");
            } else {
                sql.promise().query("UPDATE pages SET photoPage = ? WHERE idPage = ?", [imagenUsuario.name, ids])
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
        req.flash('success', 'Exito al guardar');
        res.redirect('/page/list/' + id);
    } catch (error) {
        console.error(error);
        req.flash('message', 'Error al Actualizar');
        res.redirect('/page/Update/' + ids);
    }
}


module.exports = page