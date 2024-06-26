const orm = require('../Database/dataBase.orm')
const sql = require('../Database/dataBase.sql')
const path = require('path')
const { validationResult } = require('express-validator');
const { or } = require('sequelize');

const sell = {}

sell.mostrar = async (req, res) => {
    try {
        const ids = req.params.id
        const [rows] = await sql.promise().query('SELECT MAX(idSell) AS Maximo FROM sells');
        const [rows2] = await sql.promise().query('SELECT * FROM clientecompania WHERE idClient = ?', [ids])
        res.render('sell/add', { lista: rows, listaPagina: rows2, csrfToken: req.csrfToken() });
    } catch (error) {
        console.error('Error en la consulta:', error.message);
        res.status(500).send('Error al realizar la consulta')
    }
}

sell.mandar = async (req, res) => {
    const ids = req.params.id;
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { idSell, namePersonSell, companySell, cellPhoneSell, salesValueSell, payTypeSell } = req.body
        const newSpeciality = {
            idSell,
            namePersonSell,
            companySell,
            cellPhoneSell,
            salesValueSell,
            payTypeSell,
            stateSell: 'Activo',
            pageIdPage: ids,
            createSell: new Date().toLocaleString(),
        }
        const newdetailclients = {
            sellIdSell: idSell
        }
        await orm.sell.create(newSpeciality)
        orm.detailClients.findOne({ where: { idDetailClients: idSell } })
            .then((result) => {
                result.update(newdetailclients)
            })
        req.flash('success', 'Se creo el comprador')
        res.redirect('/sell/list/' + ids);
    } catch (error) {
        req.flash('message', 'Error al guardar el comprador')
        res.redirect('/sell/add/' + ids);
    }
}

sell.lista = async (req, res) => {
    try {
        const id = req.params.id
        const [pagina] = await sql.promise().query('select * from pages where idPage = ?', [id])
        const [rows] = await sql.promise().query('SELECT * FROM clientecomprador WHERE pageIdPage = ? ', [id])
        res.render('sell/list', { lista: rows, listaPagina:pagina, csrfToken: req.csrfToken() });
    } catch (error) {
        console.error('Error en la consulta:', error.message);
        res.status(500).send('Error al realizar la consulta')
    }
}

sell.traerDatos = async (req, res) => {
    try {
        const id = req.params.id
        const [rows] = await sql.promise().query('SELECT * FROM clientecomprador where idSell = ?', [id])
        res.render('sell/add', { listas: rows, csrfToken: req.csrfToken() });
    } catch (error) {
        console.error('Error en la consulta:', error.message);
        res.status(500).send('Error al realizar la consulta')
    }
}

sell.actualizar = async (req, res) => {
    const ids = req.params.id;
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { namePersonSell, companySell, cellPhoneSell, salesValueSell, payTypeSell, stateSell } = req.body
        const newSpeciality = {
            namePersonSell,
            companySell,
            cellPhoneSell,
            salesValueSell,
            payTypeSell,
            stateSell,
            updateSell: new Date().toLocaleString(),
        }
        await orm.sell.findOne({ where: { idSell: ids } })
            .then((result) => {
                result.update(newSpeciality)
                req.flash('success', 'Se Actualizo el comprador')
                res.redirect('/sell/list/' + ids);
            })
    } catch (error) {
        req.flash('message', 'Error al Actualizar el comprador')
        res.redirect('/sell/add/' + ids);
    }
}

sell.desabilitar = async (req, res) => {
    const ids = req.params.id;
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const newSpeciality = {
            stateSell: 'inhabilitado',
            updateSell: new Date().toLocaleString(),
        }
        await orm.sell.findOne({ where: { idSell: ids } })
            .then((result) => {
                result.update(newSpeciality)
                req.flash('success', 'Se Desabilito el comprador')
                res.redirect('/sell/list/' + ids);
            })
    } catch (error) {
        req.flash('message', 'Error al Desabilitar el comprador')
        res.redirect('/sell/add/' + ids);
    }
}

module.exports = sell