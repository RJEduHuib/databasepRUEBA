const express = require("express");
const router = express.Router();
const { mostrar, mandar, lista, listaDetalleMovistar, listaDetalleClaro, listaDetalleCnt } = require("../controller/excel.controller");
const isLoggedIn = require("../lib/auth");
const {iniciarSesionYConsultarMovistar, iniciarSesionYConsultarClaro, iniciarSesionYConsultarCnt} = require("../controller/consulta.controller");


router.get('/add/:id', isLoggedIn, mostrar);
router.post('/add/:id', isLoggedIn, mandar)
router.get('/list/:id', isLoggedIn, lista)
router.get('/baseCosultaMovistar/:id', isLoggedIn, listaDetalleMovistar)
router.post('/baseCosultaMovistar/:id', isLoggedIn, iniciarSesionYConsultarMovistar)
router.get('/baseCosultaClaro/:id', isLoggedIn, listaDetalleClaro)
router.post('/baseCosultaClaro/:id', isLoggedIn, iniciarSesionYConsultarClaro)
router.get('/baseCosultaCnt/:id', isLoggedIn, listaDetalleCnt)
router.post('/baseCosultaCnt/:id', isLoggedIn, iniciarSesionYConsultarCnt)


module.exports = router;