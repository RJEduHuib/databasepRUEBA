const orm = require('../Database/dataBase.orm')
const sql = require('../Database/dataBase.sql')
const path = require('path')
const helpers = require('../lib/helpers');
const bcrypt = require('bcrypt');
const { cifrarDatos, descifrarDatos } = require('../lib/encrypDates');
const { validationResult } = require('express-validator');

const users = {}

users.mostrar = async (req, res) => {
    const rol = await orm.rolUser.findOne({ where: { userIdUser: req.user.idUser } })
    if (rol.userIdUser == '1' || rol.userIdUser == '2') {
        try {
            const ids = req.params.id
            const [rows] = await sql.promise().query('SELECT MAX(idUser) AS Maximo FROM users');
            const [pagina] = await sql.promise().query('SELECT * FROM pages where idPage = ?', [ids])
            const [rols] = await sql.promise().query('SELECT * FROM rolspagina WHERE pageIdPage = ? AND idRolUser > 1', [ids])
            const [permision] = await sql.promise().query('SELECT * FROM permisosrol WHERE pageIdPage = ? AND idPermission > 1', [ids])
            res.render('users/add', { listaPagina: pagina, listaRol: rols, lista: rows, listaPermisos: permision, csrfToken: req.csrfToken() });
        } catch (error) {
            console.error('Error en la consulta:', error.message);
            res.status(500).send('Error al realizar la consulta')
        }
    } else{
        return res.redirect("/listBase/list/" + req.user.idUser);
    }
}

users.mandar = async (req, res) => {
    const ids = req.params.id;
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const {
            idUser,
            completeNameUser,
            identificationCardUser,
            emailUser,
            cellPhoneUser,
            idRol,
            usernameUser,
            passwordUser,
            permiso
        } = req.body;
        const hashedPassword = await helpers.hashPassword(passwordUser);
        let newClient = {
            idUser: idUser,
            identificationCardUser: cifrarDatos(identificationCardUser),
            cellPhoneUser: cifrarDatos(cellPhoneUser),
            emailUser: cifrarDatos(emailUser),
            completeNameUser: cifrarDatos(completeNameUser),
            usernameUser: cifrarDatos(usernameUser),
            passwordUser: hashedPassword,
            stateUser: 'activado',
            createUser: new Date().toLocaleString()
        };
        const newrol = {
            idUnionUserRolPermission: idUser,
            rolIdRol: idRol,
            userIdUser: idUser,
            createUnionUserRolPermission: new Date().toLocaleString()
        }
        const newrolusers = {
            userIdUser: idUser,
            rolIdRol: idRol,
            createRolUser: new Date().toLocaleString(),
            pageIdPage: ids
        }

        await orm.user.create(newClient);
        await orm.rolUser.create(newrolusers)
        await orm.unionUserRolPermissions.create(newrol)
        for (let i = 0; i < permiso.length; i++) {
            await sql.promise().query('INSERT INTO detailunionuserrolpermissions(createDetailUnionUserRolPermission, unionUserRolPermissionIdUnionUserRolPermission, permissionIdPermission) VALUES (?,?,?)', [new Date().toLocaleString(), idUser, permiso[i]])
        }

        const imagenUsuario = req.files.photoUser;
        const validacion = path.extname(imagenUsuario.name);
        const extencion = [".PNG", ".JPG", ".JPEG", ".GIF", ".TIF", ".png", ".jpg", ".jpeg", ".gif", ".tif"];

        if (!extencion.includes(validacion)) {
            return req.flash("message", "Imagen no compatible.");
        }

        if (!req.files) {
            return req.flash("message", "Imagen no insertada.");
        }

        const filePath = __dirname + '/../public/img/usuario/' + imagenUsuario.name;

        imagenUsuario.mv(filePath, (err) => {
            if (err) {
                console.error(err);
                return req.flash("message", "Error al guardar la imagen.");
            } else {
                sql.promise().query("UPDATE users SET photoUser = ? WHERE idUser = ?", [imagenUsuario.name, idUser])
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
        req.flash('success', 'Se creo la materia')
        res.redirect('/user/list/' + ids);
    } catch (error) {
        req.flash('message', 'Error al guardar la materia')
        console.log(error)
        res.redirect('/user/add/' + ids);
    }
}

users.lista = async (req, res) => {
    const rol = await orm.rolUser.findOne({ where: { userIdUser: req.user.idUser } })
    if (rol.userIdUser == '1' || rol.userIdUser == '2') {
        try {
            const id = req.params.id
            const [pagina] = await sql.promise().query('SELECT * FROM usuariopagina where userIdUser = ?', [id])
            const [rows] = await sql.promise().query('SELECT * FROM listarolusuariocreado where pageIdPage = ?', pagina[0].idPage)
            const datos = rows.map(row => ({
                completeNameUser: descifrarDatos(row.completeNameUser),
                identificationCardUser: descifrarDatos(row.identificationCardUser),
                photoUser: row.photoUser,
                emailUser: descifrarDatos(row.emailUser),
                cellPhoneUser: descifrarDatos(row.cellPhoneUser),
                usernameUser: descifrarDatos(row.usernameUser),
                stateUser: row.stateUser,
                nameRol: row.nameRol,
                namePermission: row.namePermission,
                idUser: row.idUser
            }));
            res.render('users/list', { lista: datos, listaPagina: pagina, csrfToken: req.csrfToken() });
        } catch (error) {
            console.error('Error en la consulta:', error.message);
            res.status(500).send('Error al realizar la consulta')
        }
    } else {
        return res.redirect("/listBase/list/" + req.user.idUser);
    }
}

users.traerDatos = async (req, res) => {
    const rol = await orm.rolUser.findOne({ where: { userIdUser: req.user.idUser } })
    if (rol.userIdUser == '1' || rol.userIdUser == '2') {
        try {
            const id = req.params.id
            const [pagina] = await sql.promise().query('SELECT * FROM usuariopagina where userIdUser = ?', [id])
            const [rows] = await sql.promise().query('SELECT * FROM usuariopagina where idUser = ?', [id])
            const datos = rows.map(row => ({
                completeNameUser: descifrarDatos(row.completeNameUser),
                identificationCardUser: descifrarDatos(row.identificationCardUser),
                photoUser: row.photoUser,
                emailUser: descifrarDatos(row.emailUser),
                cellPhoneUser: descifrarDatos(row.cellPhoneUser),
                usernameUser: descifrarDatos(row.usernameUser),
                stateUser: row.stateUser,
                nameRol: row.nameRol,
                namePermission: row.namePermission
            }));
            const [permisos] = await sql.promise().query('SELECT * FROM permisosrol WHERE userIdUser = ?', [id])
            const [Totalpermisos] = await sql.promise().query('SELECT * FROM permissions')
            const [TotalRol] = await sql.promise().query('SELECT * FROM rols')
            res.render('users/update', { listaRol: TotalRol, lista: datos, listaPagina: pagina, listaPermisos: permisos, total: Totalpermisos, csrfToken: req.csrfToken() });
        } catch (error) {
            console.error('Error en la consulta:', error.message);
            res.status(500).send('Error al realizar la consulta')
        }
    } else {
        return res.redirect("/listBase/list/" + req.user.idUser);
    }
}

users.actualizar = async (req, res) => {
    const ids = req.params.id;
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const hashedPassword = await helpers.hashPassword(password);
        const {
            idUser,
            completeNameUser,
            identificationCardUser,
            emailUser,
            cellPhoneUser,
            namePermission
        } = req.body;

        let newClient = {
            idUser: idUser,
            identificationCardUser: cifrarDatos(identificationCardUser),
            cellPhoneUser: cifrarDatos(cellPhoneUser),
            emailUser: cifrarDatos(emailUser),
            completeNameUser: cifrarDatos(completeNameUser),
            usernameUser: cifrarDatos(username),
            passwordUser: hashedPassword,
            stateUser: 'activado',
            createUser: new Date().toLocaleString()
        };

        const newadmin = {
            nameRol,
            stateRol: 'Activo',
            createRol: new Date().toLocaleString()
        }

        const newRolUser = {
            createRol: new Date().toLocaleString(),
            userIdUser: idUser,
            rolIdRol,
            permissionIdPermission,
        }

        const newPermissions = {
            namePermission,
            createPermission: new Date().toLocaleString()
        }

        await orm.user.findOne({ where: { idUser: idUser } })
            .then((result) => {
                result.update(newClient)
            })
        await orm.rol.findOne({ where: { idRol: idRol } })
            .then((result) => {
                result.update(newadmin)
            })
        await orm.permission.findOne({ where: { idPermission: idPermission } })
            .then((result) => {
                result.update(newPermissions)
            })
        await orm.rolUser.findOne({ where: { idRolUser: idRolUser } })
            .then((result) => {
                result.update(newRolUser)
            })

        const imagenUsuario = req.files.photoUse;
        const validacion = path.extname(imagenUsuario.name);
        const extencion = [".PNG", ".JPG", ".JPEG", ".GIF", ".TIF", ".png", ".jpg", ".jpeg", ".gif", ".tif"];

        if (!extencion.includes(validacion)) {
            return req.flash("message", "Imagen no compatible.");
        }

        if (!req.files) {
            return req.flash("message", "Imagen no insertada.");
        }

        const filePath = __dirname + '/../public/img/usuario/' + imagenUsuario.name;

        imagenUsuario.mv(filePath, (err) => {
            if (err) {
                console.error(err);
                return req.flash("message", "Error al guardar la imagen.");
            } else {
                sql.promise().query("UPDATE users SET photoUser = ? WHERE idUser = ?", [imagenUsuario.name, idUser])
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
        req.flash('success', 'Se Actualizo la materia')
        res.redirect('/users/list/' + ids);
    } catch (error) {
        req.flash('message', 'Error al Actualizar la materia')
        res.redirect('/users/update/' + ids);
    }
}

users.desabilitar = async (req, res) => {
    const ids = req.params.id;
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { stateusers } = req.body
        const newSpeciality = {
            stateusers,
            updateusers: new Date().toLocaleString(),
        }
        await orm.user.findOne({ where: { idusers: ids } })
            .then((result) => {
                result.update(newSpeciality)
                req.flash('success', 'Se Desabilito la materia')
                res.redirect('/users/list/' + ids);
            })
    } catch (error) {
        req.flash('message', 'Error al Desabilitar la materia')
        res.redirect('/users/update/' + ids);
    }
}

module.exports = users