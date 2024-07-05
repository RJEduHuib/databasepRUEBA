const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const expressApp = require('./app'); // Importar tu aplicación Express
const cors = require('cors');
const { exec } = require('child_process');

let mainWindow;
let consoleWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  });

  // Configurar CORS
  expressApp.use(cors());

  // Iniciar el servidor Express
  const port = process.env.PORT || 4001; // Cambiar el puerto a 4001 si 4000 está en uso
  const server = expressApp.listen(port, () => {
    console.log(`Servidor corriendo en el puerto ${port}`);
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`El puerto ${port} ya está en uso. Por favor, usa un puerto diferente.`);
      process.exit(1);
    }
  });

  // Manejo de errores global
  expressApp.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  });

  // Cargar tu aplicación web en la ventana de Electron
  mainWindow.loadURL(`http://localhost:${port}`);
  mainWindow.webContents.openDevTools();
  mainWindow.on('closed', function () {
    mainWindow = null;
  });

  // Crear el menú de la aplicación
  const menuTemplate = [
    {
      label: 'View',
      submenu: [
        {
          label: 'Open Console',
          click() {
            openConsole();
          }
        },
        {
          label: 'Close Console',
          click() {
            closeConsole();
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);
}

function openConsole() {
  // Abre la consola del sistema operativo
  exec(`start cmd /k "echo Starting Console... && echo && node ./src/app.js"`, (err, stdout, stderr) => {
    if (err) {
      console.error(err);
      return;
    }
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});