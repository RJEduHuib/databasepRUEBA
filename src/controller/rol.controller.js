const orm = require('../Database/dataBase.orm')
const sql = require('../Database/dataBase.sql')
const path = require('path')
const { validationResult } = require('express-validator');

const rol = {}

rol.mostrar = async (req, res) => {
    const rol = await orm.rolUser.findOne({ where: { userIdUser: req.user.idUser } })
    if (rol.userIdUser == '1') {
        try {
            const id = req.params.id
            const [pagina] = await sql.promise().query('SELECT * FROM pages where idPage = ?', [id])
            const [rol] = await sql.promise().query('SELECT MAX(idRol) AS maximo FROM rols')
            res.render('rol/add', { listaPagina: pagina, listaRol: rol, csrfToken: req.csrfToken() });
        } catch (error) {
            console.error('Error en la consulta:', error.message);
            res.status(500).send('Error al realizar la consulta')
        }
    } else {
        return res.redirect("/listBase/list/" + req.user.idUser);
    }
}

rol.mandar = async (req, res) => {
    const ids = req.params.id;
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { idRol, nameRol } = req.body
        const newSpeciality = {
            idRol,
            nameRol,
            stateRol: 'Activo',
            pageIdPage: ids,
            createRol: new Date().toLocaleString(),
        }
        const newRolUse = {
            userIdUser: req.user.idUser,
            rolIdRol: idRol,
            createRolUser: new Date().toLocaleString(),
            pageIdPage: ids
        }

        await orm.rol.create(newSpeciality)
        await orm.rolUser.create(newRolUse)
        req.flash('success', 'Se creo el rol')
        res.redirect('/rol/list/' + ids);
    } catch (error) {
        req.flash('message', 'Error al guardar el rol')
        res.redirect('/rol/add/' + ids);
    }
}

rol.lista = async (req, res) => {
    try {
        const id = req.params.id
        const [pagina] = await sql.promise().query('SELECT * FROM usuariopagina where userIdUser = ?', [req.user.idUser])
        const [row] = await sql.promise().query('SELECT * FROM rols')
        res.render('rol/list', { lista: row, listaPagina: pagina, csrfToken: req.csrfToken() });
    } catch (error) {
        console.error('Error en la consulta:', error.message);
        res.status(500).send('Error al realizar la consulta')
    }
}

rol.traerDatos = async (req, res) => {
    const rol = await orm.rolUser.findOne({ where: { userIdUser: req.user.idUser } })
    if (rol.userIdUser == '1') {
        try {
            const id = req.params.id
            const [pagina] = await sql.promise().query('SELECT * FROM pages where idPage = ?', [id])
            const [row] = await sql.promise().query('SELECT * FROM rolspagina where idRol = ?', [id])
            res.render('rol/update', { lista: row, listaPagina: pagina, csrfToken: req.csrfToken() });
        } catch (error) {
            console.error('Error en la consulta:', error.message);
            res.status(500).send('Error al realizar la consulta')
        }
    } else {
        return res.redirect("/listBase/list/" + req.user.idUser);
    }
}

rol.actualizar = async (req, res) => {
    const ids = req.params.id;
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { idpage, nameRol, stateRol } = req.body
        const newSpeciality = {
            nameRol,
            stateRol,
            updateRol: new Date().toLocaleString(),
        }
        await orm.rol.findOne({ where: { idRol: ids } })
            .then((result) => {
                result.update(newSpeciality)
                req.flash('success', 'Se Actualizo el rol')
                res.redirect('/rol/list/' + idpage);
            })
    } catch (error) {
        req.flash('message', 'Error al Actualizar el rol')
        res.redirect('/rol/update/' + ids);
    }
}

rol.desabilitar = async (req, res) => {
    const ids = req.params.id;
    const rol = await orm.rolUser.findOne({ where: { userIdUser: req.user.idUser } })
    if (rol.userIdUser == '1') {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            const [idPage] = await sql.promise().query('SELECT pageIdPage AS paginaId FROM rolspagina where idRol = ? ', [ids])
            const newSpeciality = {
                stateRol: 'inhabilitado',
                updateRol: new Date().toLocaleString(),
            }
            await orm.rol.findOne({ where: { idRol: ids } })
                .then((result) => {
                    result.update(newSpeciality)
                    req.flash('success', 'Se Desabilito el rol')
                    res.redirect('/rol/list/' + idPage[0].paginaId);
                })
        } catch (error) {
            req.flash('message', 'Error al Desabilitar el rol')
            res.redirect('/rol/list/' + ids);
        }
    } else {
        return res.redirect("/listBase/list/" + req.user.idUser);
    }
}

module.exports = rol