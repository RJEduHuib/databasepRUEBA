const puppeteer = require('puppeteer');
const ExcelJS = require('exceljs');
const chromium = require('chromium');
const orm = require('../Database/dataBase.orm');
const consulta = {}

consulta.iniciarSesionYConsultarMovistar = async (req, res) => {
  const id = req.params.id
  const numbers = await orm.detailBaseInitial.findAll({ where: { InitialBaseIdInitialBase: id } });
  const currentTime = new Date();
  const currentDate = currentTime.toISOString().slice(0, 10);
  const currentMinutes = currentTime.getMinutes();
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Consulta Resultados');
  worksheet.addRow(['Número de Celular', 'Cliente', 'Valor pendiente', 'Operador', 'Fecha de consulta']);
  try {
    const browser = await puppeteer.launch({
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


    let contador = 0
    const batchSize = 90; // Tamaño del lote

    for (let batchStart = 0; batchStart < numbers.length; batchStart += batchSize) {
      const batchEnd = Math.min(batchStart + batchSize, numbers.length);
      const currentBatch = numbers.slice(batchStart, batchEnd);

      for (const number of currentBatch) {
        contador = contador+1
        console.log(contador)
        try {
          await page.goto('https://www.redcargamovil.com/Account/ServiciosDW.aspx?p=ue5aXpv7xKz4beF5JOsZGjDjT9VsDXyW', { timeout: 150000 });
          await page.waitForSelector('#MainContent_txtDatoConsultaProveedor');

          await page.type('[name="ctl00$MainContent$txtDatoConsultaProveedor"]', number.numerosBaseInicial);
          await page.waitForSelector('[name="ctl00$MainContent$btoSubmit"]', { visible: true });
          await page.click('[name="ctl00$MainContent$btoSubmit"]');

          await page.waitForSelector('#MainContent_lblMsgError', { timeout: 10000 });
          console.log(`Número incorrecto: ${number.numerosBaseInicial}`);
        } catch (error) {
          const clienteElement = await page.$('#MainContent_lblNombreCliente');
          const cliente = clienteElement ? await page.evaluate(el => el.textContent, clienteElement) : 'No disponible';
          const valorElement = await page.$('#MainContent_lblValorPendiente');
          const valor = valorElement ? await page.evaluate(el => el.textContent, valorElement) : 'No disponible';

          let selectedOption = 'No disponible';
          const selectElement = await page.$('[name="ctl00$MainContent$cboOperador"]');
          if (selectElement) {
            selectedOption = await page.evaluate((select) => {
              const selectedIndex = select.selectedIndex;
              return select.options[selectedIndex].text;
            }, selectElement);
          }

          worksheet.addRow([number.numerosBaseInicial, cliente, valor, selectedOption, `${currentDate} ${currentMinutes}`]);
        }
      }
    }

    await browser.close();
  } catch (error) {
    console.error('Error en el proceso:', error.message);
  } finally {
    const filePath = `C:\\Users\\Public\\Downloads\\consulta_${currentDate}_${currentMinutes}min.xlsx`;
    await workbook.xlsx.writeFile(filePath);
    console.log('Archivo Excel creado:', filePath);
  }
};

consulta.iniciarSesionYConsultarClaro = async (req, res) => {
  try {
    const browser = await puppeteer.launch({
      executablePath: chromium.path,
      headless: false, // Mostrar el navegador con interfaz gráfica
    });
    const page = await browser.newPage();

    // Iniciar sesión
    await page.goto('https://www.redcargamovil.com/Account/Login.aspx');
    await page.waitForSelector('[name="ctl00$MainContent$LoginUser$UserName"]');
    await page.type('[name="ctl00$MainContent$LoginUser$UserName"]', '1725819781');
    await page.type('[name="ctl00$MainContent$LoginUser$Password"]', 'Ditelcom123@');
    await page.click('[name="ctl00$MainContent$LoginUser$LoginButton"]');
    await page.waitForNavigation(); // Esperar a que se complete la redirección

    // Acceder al enlace deseado
    await page.goto('https://www.redcargamovil.com/Account/ServiciosDW.aspx?p=JUQAQJ9m7n/tdsneXG9wcSH/w+/T9Ejkva6ySG+9iXo=', { timeout: 60000 });
    await page.waitForSelector('#MainContent_txtDatoConsultaProveedor');

    // Arreglo de números a consultar
    const { numbers } = req.body;

    // Crear un archivo Excel y agregar los encabezados
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Consulta Resultados');
    worksheet.addRow(['Número de Celular', 'Cliente', 'Valor pendiente', 'Operador', 'Fecha de consulta']);

    const currentTime = new Date();
    const currentDate = currentTime.toISOString().slice(0, 10); // Formato YYYY-MM-DD
    const currentMinutes = currentTime.getMinutes();

    // Iterar sobre cada número y realizar la consulta
    for (let i = 0; i < numbers.length; i++) {
      await page.type('[name="ctl00$MainContent$txtDatoConsultaProveedor"]', numbers[i]);
      await page.waitForSelector('[name="ctl00$MainContent$btoSubmit"]', { visible: true });
      await page.click('[name="ctl00$MainContent$btoSubmit"]');

      // Esperar a que aparezca el elemento con el id #MainContent_lblMsgError o los otros elementos
      try {
        await page.waitForSelector('#MainContent_lblMsgError', { timeout: 5000 });
        console.log(`Número incorrecto: ${numbers[i]}`);
        await page.goto('https://www.redcargamovil.com/Account/ServiciosDW.aspx?p=JUQAQJ9m7n/tdsneXG9wcSH/w+/T9Ejkva6ySG+9iXo=', { timeout: 60000 });
        await page.waitForSelector('#MainContent_txtDatoConsultaProveedor');
      } catch (error) {
        // Capturar los datos
        const clienteElement = await page.$('#MainContent_lblNombreCliente');
        const cliente = clienteElement ? await page.evaluate(el => el.textContent, clienteElement) : 'No disponible';
        const valorElement = await page.$('#MainContent_lblValorPendiente');
        const valor = valorElement ? await page.evaluate(el => el.textContent, valorElement) : 'No disponible';

        // Obtener el operador (si es posible)
        let selectedOption = 'No disponible';
        const selectElement = await page.$('[name="ctl00$MainContent$cboOperador"]');
        if (selectElement) {
          selectedOption = await page.evaluate((select) => {
            const selectedIndex = select.selectedIndex;
            return select.options[selectedIndex].text;
          }, selectElement);
        }

        // Agregar los datos al archivo Excel
        worksheet.addRow([numbers[i], cliente, valor, selectedOption, `${currentDate} ${currentMinutes}`]);
      }

      // Volver a la página de consulta para el siguiente número
      await page.goto('https://www.redcargamovil.com/Account/ServiciosDW.aspx?p=JUQAQJ9m7n/tdsneXG9wcSH/w+/T9Ejkva6ySG+9iXo=', { timeout: 60000 });
      await page.waitForSelector('#MainContent_txtDatoConsultaProveedor');
    }

    // Guardar el archivo Excel
    const filePath = `C:\\Users\\Public\\Downloads\\consulta_${currentDate}_${currentMinutes}min.xlsx`;
    await workbook.xlsx.writeFile(filePath);
    console.log('Archivo Excel creado:', filePath);

    // Cierra el navegador
    await browser.close();
  } catch (error) {
    console.error('Error en el proceso:', error.message);
  }
};

consulta.iniciarSesionYConsultarCnt = async (req, res) => {
  try {
    const browser = await puppeteer.launch({
      executablePath: chromium.path,
      headless: false, // Mostrar el navegador con interfaz gráfica
    });
    const page = await browser.newPage();

    // Iniciar sesión
    await page.goto('https://www.redcargamovil.com/Account/Login.aspx');
    await page.waitForSelector('[name="ctl00$MainContent$LoginUser$UserName"]');
    await page.type('[name="ctl00$MainContent$LoginUser$UserName"]', '1725819781');
    await page.type('[name="ctl00$MainContent$LoginUser$Password"]', 'Ditelcom123@');
    await page.click('[name="ctl00$MainContent$LoginUser$LoginButton"]');
    await page.waitForNavigation(); // Esperar a que se complete la redirección

    // Acceder al enlace deseado
    await page.goto('https://www.redcargamovil.com/Account/ServiciosDW.aspx?p=JUQAQJ9m7n%2ftdsneXG9wcSH%2fw+%2fT9Ejkva6ySG+9iXo%3d', { timeout: 60000 });
    await page.waitForSelector('#MainContent_txtDatoConsultaProveedor');

    // Arreglo de números a consultar
    const { numbers } = req.body;

    // Crear un archivo Excel y agregar los encabezados
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Consulta Resultados');
    worksheet.addRow(['Número de Celular', 'Cliente', 'Valor pendiente', 'Operador', 'Fecha de consulta']);

    const currentTime = new Date();
    const currentDate = currentTime.toISOString().slice(0, 10); // Formato YYYY-MM-DD
    const currentMinutes = currentTime.getMinutes();

    // Iterar sobre cada número y realizar la consulta
    for (let i = 0; i < numbers.length; i++) {
      await page.type('[name="ctl00$MainContent$txtDatoConsultaProveedor"]', numbers[i]);
      await page.waitForSelector('[name="ctl00$MainContent$btoSubmit"]', { visible: true });
      await page.click('[name="ctl00$MainContent$btoSubmit"]');

      // Esperar a que aparezca el elemento con el id #MainContent_lblMsgError o los otros elementos
      try {
        await page.waitForSelector('#MainContent_lblMsgError', { timeout: 5000 });
        console.log(`Número incorrecto: ${numbers[i]}`);
        await page.goto('https://www.redcargamovil.com/Account/ServiciosDW.aspx?p=JUQAQJ9m7n%2ftdsneXG9wcSH%2fw+%2fT9Ejkva6ySG+9iXo%3d', { timeout: 60000 });
        await page.waitForSelector('#MainContent_txtDatoConsultaProveedor');
      } catch (error) {
        // Capturar los datos
        const clienteElement = await page.$('#MainContent_lblNombreCliente');
        const cliente = clienteElement ? await page.evaluate(el => el.textContent, clienteElement) : 'No disponible';
        const valorElement = await page.$('#MainContent_lblValorPendiente');
        const valor = valorElement ? await page.evaluate(el => el.textContent, valorElement) : 'No disponible';

        // Obtener el operador (si es posible)
        let selectedOption = 'No disponible';
        const selectElement = await page.$('[name="ctl00$MainContent$cboOperador"]');
        if (selectElement) {
          selectedOption = await page.evaluate((select) => {
            const selectedIndex = select.selectedIndex;
            return select.options[selectedIndex].text;
          }, selectElement);
        }

        // Agregar los datos al archivo Excel
        worksheet.addRow([numbers[i], cliente, valor, selectedOption, `${currentDate} ${currentMinutes}`]);
      }

      // Volver a la página de consulta para el siguiente número
      await page.goto('https://www.redcargamovil.com/Account/ServiciosDW.aspx?p=JUQAQJ9m7n%2ftdsneXG9wcSH%2fw+%2fT9Ejkva6ySG+9iXo%3d', { timeout: 60000 });
      await page.waitForSelector('#MainContent_txtDatoConsultaProveedor');
    }

    // Guardar el archivo Excel
    const filePath = `C:\\Users\\Public\\Downloads\\consulta_${currentDate}_${currentMinutes}min.xlsx`;
    await workbook.xlsx.writeFile(filePath);
    console.log('Archivo Excel creado:', filePath);

    // Cierra el navegador
    await browser.close();
  } catch (error) {
    console.error('Error en el proceso:', error.message);
  }
};

// Ejemplo de uso
module.exports = consulta;