const { app, BrowserWindow } = require('electron');
const path = require('path');
const expressApp = require('./app'); // Importar tu aplicación Express

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  });

  // Iniciar el servidor Express
  const port = process.env.PORT|| 4001; // Cambiar el puerto a 4001 si 4000 está en uso
  const server = expressApp.listen(port, () => {
    console.log(`Servidor corriendo en el puerto ${port}`);
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`El puerto ${port} ya está en uso. Por favor, usa un puerto diferente.`);
      process.exit(1);
    }
  });

  // Cargar tu aplicación web en la ventana de Electron
  mainWindow.loadURL(`http://localhost:${port}`);

  mainWindow.on('closed', function () {
    mainWindow = null;
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