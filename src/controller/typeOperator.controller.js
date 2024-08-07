const orm = require('../Database/dataBase.orm')
const sql = require('../Database/dataBase.sql')
const path = require('path')
const { validationResult } = require('express-validator');

const typeOperators = {}

typeOperators.mostrar = async (req, res) => {
    try {
        const ids = req.params.id
        const [row] = await sql.promise().query('select * from pages where idPage = ?', [ids])
        res.render('typeOperators/add', { listaPagina: row, csrfToken: req.csrfToken() });
    } catch (error) {
        console.error('Error en la consulta:', error.message);
        res.status(500).send('Error al realizar la consulta')
    }
}

typeOperators.mandar = async (req, res) => {
    const ids = req.params.id;
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { nameTypeOperator } = req.body
        const newSpeciality = {
            nameTypeOperator,
            stateTypeOperator: 'Activo',
            pageIdPage: ids,
            createTypeOperator: new Date().toLocaleString(),
        }
        await orm.typeOperator.create(newSpeciality)
        req.flash('success', 'Se creo el tipo de espesialización')
        res.redirect('/operatiors/list/' + ids);
    } catch (error) {
        req.flash('message', 'Error al guardar el tipo de espesialización')
        res.redirect('/operatiors/add/' + ids);
    }
}

typeOperators.lista = async (req, res) => {
    try {
        const id = req.params.id
        const [pagina] = await sql.promise().query('select * from pages where idPage = ?', [id])
        const [row] = await sql.promise().query('SELECT * FROM typeOperators where pageIdPage = ?', [id])
        res.render('typeOperators/list', { lista: row, listaPagina: pagina, csrfToken: req.csrfToken() });
    } catch (error) {
        console.error('Error en la consulta:', error.message);
        res.status(500).send('Error al realizar la consulta')
    }
}

typeOperators.traerDatos = async (req, res) => {
    try {
        const id = req.params.id
        const [pagina] = await sql.promise().query('select * from usuarioPagina where userIdUser = ?', [req.user.idUser])
        const [row] = await sql.promise().query('SELECT * FROM typeOperators where idTypeOperator = ?', [id])
        res.render('typeOperators/update', { lista: row, listaPagina: pagina, csrfToken: req.csrfToken() });
    } catch (error) {
        console.error('Error en la consulta:', error.message);
        res.status(500).send('Error al realizar la consulta')
    }
}

typeOperators.actualizar = async (req, res) => {
    const ids = req.params.id;
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const [pagina] = await sql.promise().query('select * from usuarioPagina where userIdUser = ?', [req.user.idUser])
        const { nameTypeOperator, stateTypeOperator } = req.body
        const newSpeciality = {
            nameTypeOperator,
            stateTypeOperator,
            updateTypeOperator: new Date().toLocaleString(),
        }
        await orm.typeOperator.findOne({ where: { idTypeOperator: ids } })
            .then((result) => {
                result.update(newSpeciality)
                req.flash('success', 'Se Actualizo el tipo de espesialización')
                res.redirect('/operatiors/list/' + pagina[0].idPage);
            })
    } catch (error) {
        console.log(error)
        req.flash('message', 'Error al Actualizar el tipo de espesialización')
        res.redirect('/operatiors/update/' + ids);
    }
}

typeOperators.desabilitar = async (req, res) => {
    const ids = req.params.id;
    const rol = await orm.rolUser.findOne({ where: { userIdUser: req.user.idUser } })
    if (rol.userIdUser == '1') {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            const newSpeciality = {
                stateTypeOperator: 'inhabilitado',
                updateSpecialType: new Date().toLocaleString(),
            }
            await orm.typeOperator.findOne({ where: { idTypeOperator: ids } })
                .then((result) => {
                    result.update(newSpeciality)
                    req.flash('success', 'Se Desabilito el tipo de espesialización')
                    res.redirect('/operatiors/list/' + ids);
                })
        } catch (error) {
            req.flash('message', 'Error al Desabilitar el tipo de espesialización')
            res.redirect('/operatiors/update/' + ids);
        }
    } else {
        return res.redirect("/listBase/list/" + req.user.idUser);
    }
}

module.exports = typeOperators