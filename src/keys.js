// Configuración de variables de entorno para la conexión a la base de datos MySQL
const MYSQLHOST = process.env.MYSQLHOST ?? '65.21.94.181'; // Host de la base de datos
const MYSQLUSER = process.env.MYSQLUSER ?? 'ditelcom_database'; // Usuario de la base de datos
const MYSQLPASSWORD = process.env.MYSQLPASSWORD ?? 'Database@15121982.'; // Contraseña de la base de datos
const MYSQLDATABASE = process.env.MYSQLDATABASE ?? 'ditelcom_solutiontec'; // Nombre de la base de datos
const MYSQLPORT = process.env.MYSQLPORT ?? '3306'; // Puerto de la base de datos
const MYSQL_URI = process.env.MYSQL_URI ?? ''; // URI de conexión a la base de datos (si es necesario)

// Exportar las variables de configuración
module.exports = {
    MYSQLHOST,
    MYSQLUSER,
    MYSQLPASSWORD,
    MYSQLDATABASE,
    MYSQLPORT,
    MYSQL_URI
};