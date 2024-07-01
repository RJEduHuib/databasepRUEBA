const orm = require('../Database/dataBase.orm')
const sql = require('../Database/dataBase.sql')
const path = require('path')
const fs = require('fs');
const puppeteer = require('puppeteer');
const ExcelJS = require('exceljs');
const chromium = require('chromium');
const mysql = require('mysql2/promise'); // Asegúrate de importar el módulo 'path'
const { MYSQLHOST, MYSQLUSER, MYSQLPASSWORD, MYSQLDATABASE } = require("../keys");

const dbConfig = {
    host: MYSQLHOST,
    user: MYSQLUSER,
    password: MYSQLPASSWORD,
    database: MYSQLDATABASE
};

const base = {}

base.mostrarMovistar = async (req, res) => {
    try {
        const id = req.params.id
        const [rows] = await sql.promise().query('SELECT MAX(idInitialBase) AS Maximo FROM InitialBases');
        const [pagina] = await sql.promise().query('SELECT * FROM pages where idPage = ?', [id])
        res.render('excel/baseMovistar', { lista: rows, listaPagina: pagina, csrfToken: req.csrfToken() });
    } catch (error) {
        console.error('Error en la consulta:', error.message);
        res.status(500).send('Error al realizar la consulta')
    }
}

base.mostrarCnt = async (req, res) => {
    try {
        const id = req.params.id
        const [rows] = await sql.promise().query('SELECT MAX(idInitialBase) AS Maximo FROM InitialBases');
        const [pagina] = await sql.promise().query('SELECT * FROM pages where idPage = ?', [id])
        res.render('excel/baseCnt', { lista: rows, listaPagina: pagina, csrfToken: req.csrfToken() });
    } catch (error) {
        console.error('Error en la consulta:', error.message);
        res.status(500).send('Error al realizar la consulta')
    }
}

base.mostrarClaro = async (req, res) => {
    try {
        const id = req.params.id
        const [rows] = await sql.promise().query('SELECT MAX(idInitialBase) AS Maximo FROM InitialBases');
        const [pagina] = await sql.promise().query('SELECT * FROM pages where idPage = ?', [id])
        res.render('excel/baseClaro', { lista: rows, listaPagina: pagina, csrfToken: req.csrfToken() });
    } catch (error) {
        console.error('Error en la consulta:', error.message);
        res.status(500).send('Error al realizar la consulta')
    }
}

function delay(time) {
    return new Promise(function(resolve) {
        setTimeout(resolve, time);
    });
}

base.mandarMovistar = async (req, res) => {
    const id = req.params.id;
    try {
        const { idBase } = req.body;
        const imagenUsuario = req.files.excelSubir;
        const validacion = path.extname(imagenUsuario.name);
        const extensionesValidas = [".csv"];

        if (!extensionesValidas.includes(validacion)) {
            req.flash("message", "Excel no compatible.");
            return res.redirect(`/listBase/add/${id}`);
        }

        if (!req.files || Object.keys(req.files).length === 0) {
            req.flash("message", "Excel no insertado.");
            return res.redirect(`/listBase/baseMovistar/${id}`);
        }

        const filePath = path.join(__dirname, '../public/excel/' + imagenUsuario.name);

        imagenUsuario.mv(filePath, async (err) => {
            if (err) {
                console.error(err);
                req.flash("message", "Error al guardar el excel.");
                return res.redirect(`/listBase/baseMovistar/${id}`);
            }

            try {
                const csvData = fs.readFileSync(filePath, { encoding: 'utf-8' });
                const rows = csvData.split('\n');
                const currentTime = new Date();
                const currentDate = currentTime.toISOString().slice(0, 10);
                const currentMinutes = currentTime.getMinutes();
                const workbook = new ExcelJS.Workbook();
                const worksheet = workbook.addWorksheet('Consulta Resultados');
                worksheet.addRow(['Número de Celular', 'Cliente', 'Valor pendiente', 'Operador', 'Fecha de consulta']);

                let browser;
                try {
                    browser = await puppeteer.launch({
                        executablePath: chromium.path,
                        headless: false,
                        defaultViewport: null,
                        timeout: 0,
                        args: ['--disable-web-security'],
                    });

                    const page = await browser.newPage();
                    await page.goto('https://www.redcargamovil.com/Account/Login.aspx');
                    await page.waitForSelector('[name="ctl00$MainContent$LoginUser$UserName"]');
                    await page.type('[name="ctl00$MainContent$LoginUser$UserName"]', '1725819781');
                    await page.type('[name="ctl00$MainContent$LoginUser$Password"]', 'Ditelcom123@');
                    await page.click('[name="ctl00$MainContent$LoginUser$LoginButton"]');
                    await page.waitForNavigation();

                    const urlConsulta = 'https://www.redcargamovil.com/Account/ServiciosDW.aspx?p=ue5aXpv7xKz4beF5JOsZGjDjT9VsDXyW';

                    for (const row of rows) {
                        const numeroBase = row.trim();
                        if (numeroBase) {
                            const numerosSinComas = numeroBase.replace(/;/g, '');
                            console.log('Número a procesar:', numerosSinComas);
                            try {
                                await page.goto(urlConsulta, { waitUntil: 'networkidle0' });
                                await page.waitForSelector('#MainContent_txtDatoConsultaProveedor');
                                await page.type('[name="ctl00$MainContent$txtDatoConsultaProveedor"]', numerosSinComas);
                                await page.click('[name="ctl00$MainContent$btoSubmit"]');

                                // Esperar 2 segundos después de enviar el formulario
                                await delay(3000);

                                const clienteElement = await page.$('#MainContent_lblNombreCliente');
                                const cliente = clienteElement ? await page.evaluate(el => el.textContent.trim(), clienteElement) : 'No disponible';
                                const valorElement = await page.$('#MainContent_lblValorPendiente');
                                const valor = valorElement ? await page.evaluate(el => el.textContent.trim(), valorElement) : 'No disponible';

                                let selectedOption = 'No disponible';
                                const selectElement = await page.$('[name="ctl00$MainContent$cboOperador"]');
                                if (selectElement) {
                                    selectedOption = await page.evaluate((select) => {
                                        const selectedIndex = select.selectedIndex;
                                        return select.options[selectedIndex].text.trim();
                                    }, selectElement);
                                }

                                worksheet.addRow([numerosSinComas, cliente, valor, selectedOption, `${currentDate} ${currentMinutes}`]);

                                // Esperar 2 segundos antes de volver atrás para asegurar que los datos se recuperen
                                await delay(3000);

                                await page.goBack({ waitUntil: 'networkidle0' });
                            } catch (error) {
                                console.error(`Error para número ${numerosSinComas}:`, error.message);

                                // Esperar 2 segundos antes de volver atrás en caso de error
                                await delay(3000);

                                await page.goBack({ waitUntil: 'networkidle0' });
                            }
                        }
                    }
                } catch (error) {
                    console.error('Error en el proceso:', error.message);
                } finally {
                    if (browser) {
                        await browser.close();
                    }
                    const excelFileName = `consulta_${currentDate}_${currentMinutes}min.xlsx`;
                    const excelFilePath = path.join('C:\\Users\\Public\\Downloads', excelFileName);
                    await workbook.xlsx.writeFile(excelFilePath);
                    console.log('Archivo Excel creado:', excelFilePath);

                    fs.unlinkSync(filePath);

                    console.log('Datos importados correctamente');
                    req.flash('success', 'Datos importados correctamente');
                    return res.redirect(`/listBase/list/${id}`);
                }
            } catch (error) {
                console.error('Error en el proceso:', error.message);
                req.flash('message', 'Error al guardar');
                return res.redirect(`/listBase/baseMovistar/${id}`);
            }
        });
    } catch (error) {
        console.error('Error general:', error.message);
        req.flash('message', 'Error al guardar');
        return res.redirect(`/listBase/baseMovistar/${id}`);
    }
};

base.mandarCnt = async (req, res) => {
    const id = req.params.id;
    try {
        const { idBase } = req.body;
        const imagenUsuario = req.files.excelSubir;
        const validacion = path.extname(imagenUsuario.name);
        const extensionesValidas = [".csv"];

        if (!extensionesValidas.includes(validacion)) {
            req.flash("message", "Excel no compatible.");
            return res.redirect(`/listBase/add/${id}`);
        }

        if (!req.files || Object.keys(req.files).length === 0) {
            req.flash("message", "Excel no insertado.");
            return res.redirect(`/listBase/baseMovistar/${id}`);
        }

        const filePath = path.join(__dirname, '../public/excel/' + imagenUsuario.name);

        imagenUsuario.mv(filePath, async (err) => {
            if (err) {
                console.error(err);
                req.flash("message", "Error al guardar el excel.");
                return res.redirect(`/listBase/baseMovistar/${id}`);
            }

            try {
                const csvData = fs.readFileSync(filePath, { encoding: 'utf-8' });
                const rows = csvData.split('\n');
                const currentTime = new Date();
                const currentDate = currentTime.toISOString().slice(0, 10);
                const currentMinutes = currentTime.getMinutes();
                const workbook = new ExcelJS.Workbook();
                const worksheet = workbook.addWorksheet('Consulta Resultados');
                worksheet.addRow(['Número de Celular', 'Cliente', 'Valor pendiente', 'Operador', 'Fecha de consulta']);

                let browser;
                try {
                    browser = await puppeteer.launch({
                        executablePath: chromium.path,
                        headless: false,
                        defaultViewport: null,
                        timeout: 0,
                        args: ['--disable-web-security'],
                    });

                    const page = await browser.newPage();
                    await page.goto('https://www.redcargamovil.com/Account/Login.aspx');
                    await page.waitForSelector('[name="ctl00$MainContent$LoginUser$UserName"]');
                    await page.type('[name="ctl00$MainContent$LoginUser$UserName"]', '1725819781');
                    await page.type('[name="ctl00$MainContent$LoginUser$Password"]', 'Ditelcom123@');
                    await page.click('[name="ctl00$MainContent$LoginUser$LoginButton"]');
                    await page.waitForNavigation();

                    const urlConsulta = 'https://www.redcargamovil.com/Account/ServiciosDW.aspx?p=uogPrIErIvBEWhg5sLdhqtCsb/R6usCU';

                    for (const row of rows) {
                        const numeroBase = row.trim();
                        if (numeroBase) {
                            const numerosSinComas = numeroBase.replace(/;/g, '');
                            console.log('Número a procesar:', numerosSinComas);
                            try {
                                await page.goto(urlConsulta, { waitUntil: 'networkidle0' });
                                await page.waitForSelector('#MainContent_txtDatoConsultaProveedor');
                                await page.type('[name="ctl00$MainContent$txtDatoConsultaProveedor"]', numerosSinComas);
                                await page.click('[name="ctl00$MainContent$btoSubmit"]');

                                // Esperar 2 segundos después de enviar el formulario
                                await delay(3000);

                                const clienteElement = await page.$('#MainContent_lblNombreCliente');
                                const cliente = clienteElement ? await page.evaluate(el => el.textContent.trim(), clienteElement) : 'No disponible';
                                const valorElement = await page.$('#MainContent_lblValorPendiente');
                                const valor = valorElement ? await page.evaluate(el => el.textContent.trim(), valorElement) : 'No disponible';

                                let selectedOption = 'No disponible';
                                const selectElement = await page.$('[name="ctl00$MainContent$cboOperador"]');
                                if (selectElement) {
                                    selectedOption = await page.evaluate((select) => {
                                        const selectedIndex = select.selectedIndex;
                                        return select.options[selectedIndex].text.trim();
                                    }, selectElement);
                                }

                                worksheet.addRow([numerosSinComas, cliente, valor, selectedOption, `${currentDate} ${currentMinutes}`]);

                                // Esperar 2 segundos antes de volver atrás para asegurar que los datos se recuperen
                                await delay(3000);

                                await page.goBack({ waitUntil: 'networkidle0' });
                            } catch (error) {
                                console.error(`Error para número ${numerosSinComas}:`, error.message);

                                // Esperar 2 segundos antes de volver atrás en caso de error
                                await delay(3000);

                                await page.goBack({ waitUntil: 'networkidle0' });
                            }
                        }
                    }
                } catch (error) {
                    console.error('Error en el proceso:', error.message);
                } finally {
                    if (browser) {
                        await browser.close();
                    }
                    const excelFileName = `consulta_${currentDate}_${currentMinutes}min.xlsx`;
                    const excelFilePath = path.join('C:\\Users\\Public\\Downloads', excelFileName);
                    await workbook.xlsx.writeFile(excelFilePath);
                    console.log('Archivo Excel creado:', excelFilePath);

                    fs.unlinkSync(filePath);

                    console.log('Datos importados correctamente');
                    req.flash('success', 'Datos importados correctamente');
                    return res.redirect(`/listBase/list/${id}`);
                }
            } catch (error) {
                console.error('Error en el proceso:', error.message);
                req.flash('message', 'Error al guardar');
                return res.redirect(`/listBase/baseMovistar/${id}`);
            }
        });
    } catch (error) {
        console.error('Error general:', error.message);
        req.flash('message', 'Error al guardar');
        return res.redirect(`/listBase/baseMovistar/${id}`);
    }
};

base.mandarClaro = async (req, res) => {
    const id = req.params.id;
    try {
        const { idBase } = req.body;
        const imagenUsuario = req.files.excelSubir;
        const validacion = path.extname(imagenUsuario.name);
        const extensionesValidas = [".csv"];

        if (!extensionesValidas.includes(validacion)) {
            req.flash("message", "Excel no compatible.");
            return res.redirect(`/listBase/add/${id}`);
        }

        if (!req.files || Object.keys(req.files).length === 0) {
            req.flash("message", "Excel no insertado.");
            return res.redirect(`/listBase/baseMovistar/${id}`);
        }

        const filePath = path.join(__dirname, '../public/excel/' + imagenUsuario.name);

        imagenUsuario.mv(filePath, async (err) => {
            if (err) {
                console.error(err);
                req.flash("message", "Error al guardar el excel.");
                return res.redirect(`/listBase/baseMovistar/${id}`);
            }

            try {
                const csvData = fs.readFileSync(filePath, { encoding: 'utf-8' });
                const rows = csvData.split('\n');
                const currentTime = new Date();
                const currentDate = currentTime.toISOString().slice(0, 10);
                const currentMinutes = currentTime.getMinutes();
                const workbook = new ExcelJS.Workbook();
                const worksheet = workbook.addWorksheet('Consulta Resultados');
                worksheet.addRow(['Número de Celular', 'Cliente', 'Valor pendiente', 'Operador', 'Fecha de consulta']);

                let browser;
                try {
                    browser = await puppeteer.launch({
                        executablePath: chromium.path,
                        headless: false,
                        defaultViewport: null,
                        timeout: 0,
                        args: ['--disable-web-security'],
                    });

                    const page = await browser.newPage();
                    await page.goto('https://www.redcargamovil.com/Account/Login.aspx');
                    await page.waitForSelector('[name="ctl00$MainContent$LoginUser$UserName"]');
                    await page.type('[name="ctl00$MainContent$LoginUser$UserName"]', '1725819781');
                    await page.type('[name="ctl00$MainContent$LoginUser$Password"]', 'Ditelcom123@');
                    await page.click('[name="ctl00$MainContent$LoginUser$LoginButton"]');
                    await page.waitForNavigation();

                    const urlConsulta = 'https://www.redcargamovil.com/Account/ServiciosDW.aspx?p=uogPrIErIvBEWhg5sLdhqtCsb%2fR6usCU';

                    for (const row of rows) {
                        const numeroBase = row.trim();
                        if (numeroBase) {
                            const numerosSinComas = numeroBase.replace(/;/g, '');
                            console.log('Número a procesar:', numerosSinComas);
                            try {
                                await page.goto(urlConsulta, { waitUntil: 'networkidle0' });
                                await page.waitForSelector('#MainContent_txtDatoConsultaProveedor');
                                await page.type('[name="ctl00$MainContent$txtDatoConsultaProveedor"]', numerosSinComas);
                                await page.click('[name="ctl00$MainContent$btoSubmit"]');

                                // Esperar 2 segundos después de enviar el formulario
                                await delay(3000);

                                const clienteElement = await page.$('#MainContent_lblNombreCliente');
                                const cliente = clienteElement ? await page.evaluate(el => el.textContent.trim(), clienteElement) : 'No disponible';
                                const valorElement = await page.$('#MainContent_lblValorPendiente');
                                const valor = valorElement ? await page.evaluate(el => el.textContent.trim(), valorElement) : 'No disponible';

                                let selectedOption = 'No disponible';
                                const selectElement = await page.$('[name="ctl00$MainContent$cboOperador"]');
                                if (selectElement) {
                                    selectedOption = await page.evaluate((select) => {
                                        const selectedIndex = select.selectedIndex;
                                        return select.options[selectedIndex].text.trim();
                                    }, selectElement);
                                }

                                worksheet.addRow([numerosSinComas, cliente, valor, selectedOption, `${currentDate} ${currentMinutes}`]);

                                // Esperar 2 segundos antes de volver atrás para asegurar que los datos se recuperen
                                await delay(3000);

                                await page.goBack({ waitUntil: 'networkidle0' });
                            } catch (error) {
                                console.error(`Error para número ${numerosSinComas}:`, error.message);

                                // Esperar 2 segundos antes de volver atrás en caso de error
                                await delay(3000);

                                await page.goBack({ waitUntil: 'networkidle0' });
                            }
                        }
                    }
                } catch (error) {
                    console.error('Error en el proceso:', error.message);
                } finally {
                    if (browser) {
                        await browser.close();
                    }
                    const excelFileName = `consulta_${currentDate}_${currentMinutes}min.xlsx`;
                    const excelFilePath = path.join('C:\\Users\\Public\\Downloads', excelFileName);
                    await workbook.xlsx.writeFile(excelFilePath);
                    console.log('Archivo Excel creado:', excelFilePath);

                    fs.unlinkSync(filePath);

                    console.log('Datos importados correctamente');
                    req.flash('success', 'Datos importados correctamente');
                    return res.redirect(`/listBase/list/${id}`);
                }
            } catch (error) {
                console.error('Error en el proceso:', error.message);
                req.flash('message', 'Error al guardar');
                return res.redirect(`/listBase/baseMovistar/${id}`);
            }
        });
    } catch (error) {
        console.error('Error general:', error.message);
        req.flash('message', 'Error al guardar');
        return res.redirect(`/listBase/baseMovistar/${id}`);
    }
};


base.lista = async (req, res) => {
    try {
        const id = req.params.id
        const [pagina] = await sql.promise().query('SELECT * FROM pages where idPage = ?', [id])
        const [operadoraMovistar] = await sql.promise().query('SELECT * FROM typeOperators WHERE pageIdPage = ? and idTypeOperator = "1"', [id])
        const [operadoraCnt] = await sql.promise().query('SELECT * FROM typeOperators WHERE pageIdPage = ? and idTypeOperator = "2"', [id])
        const [operadoraClaro] = await sql.promise().query('SELECT * FROM typeOperators WHERE pageIdPage = ? and idTypeOperator = "3"', [id])
        const [row] = await sql.promise().query('SELECT * FROM InitialBases where pageIdPage = ?', [id])
        res.render('excel/list', { lista: row, listaPagina: pagina, listaOperadoraMovistar: operadoraMovistar, listaOperadoraClaro: operadoraClaro, listaOperadoraCnt: operadoraCnt, csrfToken: req.csrfToken() });
    } catch (error) {
        console.error('Error en la consulta:', error.message);
        res.status(500).send('Error al realizar la consulta')
    }
}

base.listaDetalleMovistar = async (req, res) => {
    try {
        const id = req.params.id
        const [pagina] = await sql.promise().query('SELECT * FROM pages where idPage = ?', [id])
        const [row2] = await sql.promise().query('SELECT * FROM InitialBases where idInitialBase = ?', [id])
        const [row] = await sql.promise().query('SELECT * FROM detailInitialBases where InitialBaseIdInitialBase = ?', [id])
        res.render('excel/baseMovistar', { lista: row, listaPagina: pagina, listaInicial: row2, csrfToken: req.csrfToken() });
    } catch (error) {
        console.error('Error en la consulta:', error.message);
        res.status(500).send('Error al realizar la consulta')
    }
}

base.listaDetalleClaro = async (req, res) => {
    try {
        const id = req.params.id
        const [pagina] = await sql.promise().query('SELECT * FROM pages where idPage = ?', [id])
        const [row2] = await sql.promise().query('SELECT * FROM InitialBases where pageIdPage = ?', [id])
        const [row] = await sql.promise().query('SELECT * FROM detailInitialBases where InitialBaseIdInitialBase = ?', [id])
        res.render('excel/baseClaro', { lista: row, listaPagina: pagina, listaInicial: row2, csrfToken: req.csrfToken() });
    } catch (error) {
        console.error('Error en la consulta:', error.message);
        res.status(500).send('Error al realizar la consulta')
    }
}

base.listaDetalleCnt = async (req, res) => {
    try {
        const id = req.params.id
        const [pagina] = await sql.promise().query('SELECT * FROM pages where idPage = ?', [id])
        const [row2] = await sql.promise().query('SELECT * FROM InitialBases where pageIdPage = ?', [id])
        const [row] = await sql.promise().query('SELECT * FROM detailInitialBases where InitialBaseIdInitialBase = ?', [id])
        res.render('excel/baseCnt', { lista: row, listaPagina: pagina, listaInicial: row2, csrfToken: req.csrfToken() });
    } catch (error) {
        console.error('Error en la consulta:', error.message);
        res.status(500).send('Error al realizar la consulta')
    }
}

module.exports = base