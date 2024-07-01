const express = require("express");
const router = express.Router();
const { lista, mostrarMovistar, mandarClaro, mostrarClaro, mandarMovistar, mostrarCnt, mandarCnt } = require("../controller/excel.controller");
const isLoggedIn = require("../lib/auth");


router.get('/baseCosultaMovistar/:id', isLoggedIn, mostrarMovistar);
router.post('/baseCosultaMovistar/:id', isLoggedIn, mandarMovistar)
router.get('/baseCosultaClaro/:id', isLoggedIn, mostrarClaro);
router.post('/baseCosultaClaro/:id', isLoggedIn, mandarClaro)
router.get('/baseCosultaCnt/:id', isLoggedIn, mostrarCnt);
router.post('/baseCosultaCnt/:id', isLoggedIn, mandarCnt)
router.get('/list/:id', isLoggedIn, lista)


module.exports = router;