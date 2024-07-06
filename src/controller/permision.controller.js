const orm = require('../Database/dataBase.orm')
const sql = require('../Database/dataBase.sql')
const path = require('path')
const { validationResult } = require('express-validator');

const permissions = {}

permissions.mostrar = async (req, res) => {
    const rol = await orm.rolUser.findOne({ where: { userIdUser: req.user.idUser } })
    if (rol.userIdUser == '1') {
        try {
            const id = req.params.id
            const [rols] = await sql.promise().query('SELECT * FROM rolsPagina where idRol = ?', [id])
            const [pagina] = await sql.promise().query('SELECT * FROM usuarioPagina WHERE pageIdPage = ?', [rols[0].pageIdPage])
            const [rol] = await sql.promise().query('SELECT MAX(idPermission) AS maximo FROM permissions')
            res.render('permissions/add', { listaPagina: pagina, listaRolPagina: rols, listaRol: rol, csrfToken: req.csrfToken() });
        } catch (error) {
            console.error('Error en la consulta:', error.message);
            res.status(500).send('Error al realizar la consulta')
        }
    } else {
        return res.redirect("/listBase/list/" + req.user.idUser);
    }
}

permissions.mandar = async (req, res) => {
    const ids = req.params.id;
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const [pagina] = await sql.promise().query('SELECT * FROM rolsPagina where idRol = ?', [ids])
        const { idPermission, namePermission } = req.body
        const newSpeciality = {
            idPermission,
            namePermission,
            statePermission: 'Activo',
            createPermission: new Date().toLocaleString(),
            rolUserIdRolUser: pagina[0].idRolUser,
        }
        await orm.permission.create(newSpeciality)
        req.flash('success', 'Se creo el Permiso')
        res.redirect('/permissions/list/' + pagina[0].idRol);
    } catch (error) {
        console.log(error)
        req.flash('message', 'Error al guardar el Permiso')
        res.redirect('/permissions/add/' + ids);
    }
}

permissions.lista = async (req, res) => {
    const rol = await orm.rolUser.findOne({ where: { userIdUser: req.user.idUser } })
    if (rol.userIdUser == '1') {
        try {
            const ids = req.params.id
            const [idPage] = await sql.promise().query('SELECT * FROM rolsPagina where idRol = ? ', [ids])
            const [row] = await sql.promise().query('SELECT * FROM permisosRol where rolIdRol = ? and pageIdPage = ?', [ids, idPage[0].pageIdPage])
            const [pagina] = await sql.promise().query('SELECT * FROM usuarioPagina WHERE pageIdPage = ?', [idPage[0].pageIdPage])
            res.render('permissions/list', { lista: row, listaPermisos: idPage, listaPagina: pagina, csrfToken: req.csrfToken() });
        } catch (error) {
            console.error('Error en la consulta:', error.message);
            res.status(500).send('Error al realizar la consulta')
        }
    } else {
        return res.redirect("/listBase/list/" + req.user.idUser);
    }
}

permissions.traerDatos = async (req, res) => {
    const rol = await orm.rolUser.findOne({ where: { userIdUser: req.user.idUser } })
    if (rol.userIdUser == '1') {
        try {
            const id = req.params.id
            const [idPage] = await sql.promise().query('SELECT * FROM rolsPagina where idRol = ? ', [id])
            const [row] = await sql.promise().query('SELECT * FROM permisosRol where idPermission = ?', [id])
            const [pagina] = await sql.promise().query('SELECT * FROM usuarioPagina WHERE pageIdPage = ?', [idPage[0].pageIdPage])
            res.render('permissions/update', { lista: row, listaPagina: pagina, csrfToken: req.csrfToken() });
        } catch (error) {
            console.error('Error en la consulta:', error.message);
            res.status(500).send('Error al realizar la consulta')
        }
    } else {
        return res.redirect("/listBase/list/" + req.user.idUser);
    }
}

permissions.actualizar = async (req, res) => {
    const ids = req.params.id;
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { idRol, namePermission, statePermission } = req.body
        const newSpeciality = {
            namePermission,
            statePermission,
            updatePermission: new Date().toLocaleString(),
        }
        await orm.permission.findOne({ where: { idPermission: ids } })
            .then((result) => {
                result.update(newSpeciality)
                req.flash('success', 'Se Actualizo el Permiso')
                res.redirect('/permissions/list/' + idRol);
            })
    } catch (error) {
        req.flash('message', 'Error al Actualizar el Permiso')
        res.redirect('/permissions/update/' + ids);
    }
}

permissions.desabilitar = async (req, res) => {
    const ids = req.params.id;
    const rol = await orm.rolUser.findOne({ where: { userIdUser: req.user.idUser } })
    if (rol.userIdUser == '1') {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            const [idRol] = await sql.promise().query('SELECT rolIdRol AS idRols FROM permisosRol where idPermission = ? ', [ids])
            const newSpeciality = {
                statePermission: 'inhabilitado',
                updatePermission: new Date().toLocaleString(),
            }
            await orm.permission.findOne({ where: { idPermission: ids } })
                .then((result) => {
                    result.update(newSpeciality)
                    req.flash('success', 'Se Desabilito el Permiso')
                    res.redirect('/permissions/list/' + idRol[0].idRols);
                })
        } catch (error) {
            req.flash('message', 'Error al Desabilitar el Permiso')
            res.redirect('/permissions/update/' + ids);
        }
    } else {
        return res.redirect("/listBase/list/" + req.user.idUser);
    }
}

module.exports = permissions