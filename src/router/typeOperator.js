const express = require("express");
const router = express.Router();
const { mostrar, mandar, lista, actualizar, traerDatos, desabilitar } = require("../controller/typeOperator.controller");
const isLoggedIn = require("../lib/auth");


router.get('/add/:id', isLoggedIn, mostrar);
router.post('/add/:id', isLoggedIn, mandar)
router.get('/list/:id', isLoggedIn, lista)
router.get('/update/:id', isLoggedIn, traerDatos)
router.post('/update/:id', isLoggedIn, actualizar)
router.get('/delete/:id', isLoggedIn, desabilitar)


module.exports = router;