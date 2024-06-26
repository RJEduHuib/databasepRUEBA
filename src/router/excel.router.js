const express = require("express");
const router = express.Router();
const { mostrar, mandar, lista, actualizar, traerDatos } = require("../controller/excel.controller");
const isLoggedIn = require("../lib/auth");
const iniciarSesionYConsultar = require("../controller/consulta.controller");
const { cargarArchivoCSV } = require("../controller/pruebaExcel");


router.get('/add/:id', isLoggedIn, mostrar);
router.post('/add/:id', isLoggedIn, cargarArchivoCSV)
router.get('/list/:id', isLoggedIn, lista)
router.post('/list/:id', isLoggedIn, iniciarSesionYConsultar)


module.exports = router;