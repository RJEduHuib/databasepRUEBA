const express = require("express");
const router = express.Router();
const { mostrar, mandar, lista, Actualizar, traerDatos } = require("../controller/page.controller");
const isLoggedIn = require("../lib/auth");


router.get('/add/:id', isLoggedIn, mostrar);
router.post('/add/:id', isLoggedIn, mandar)
router.get('/list/:id', isLoggedIn, lista)
router.get('/Update/:id', isLoggedIn, traerDatos)
router.post('/Update/:id', isLoggedIn, Actualizar)


module.exports = router;