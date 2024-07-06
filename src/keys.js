// Configuración de variables de entorno para la conexión a la base de datos MySQL
const MYSQLHOST = process.env.MYSQLHOST ?? 'bv5ubtbegiqlkmgpwmsf-mysql.services.clever-cloud.com'; // Host de la base de datos
const MYSQLUSER = process.env.MYSQLUSER ?? 'u0fu6cwfcydtkgx0'; // Usuario de la base de datos
const MYSQLPASSWORD = process.env.MYSQLPASSWORD ?? 'qZK75Y9U5HCncC2Y65Ak'; // Contraseña de la base de datos
const MYSQLDATABASE = process.env.MYSQLDATABASE ?? 'bv5ubtbegiqlkmgpwmsf'; // Nombre de la base de datos
const MYSQLPORT = process.env.MYSQLPORT ?? '3306'; // Puerto de la base de datos
const MYSQL_URI = process.env.MYSQL_URI ?? 'mysql://u0fu6cwfcydtkgx0:qZK75Y9U5HCncC2Y65Ak@bv5ubtbegiqlkmgpwmsf-mysql.services.clever-cloud.com:3306/bv5ubtbegiqlkmgpwmsf'; // URI de conexión a la base de datos (si es necesario)

// Exportar las variables de configuración
module.exports = {
    MYSQLHOST,
    MYSQLUSER,
    MYSQLPASSWORD,
    MYSQLDATABASE,
    MYSQLPORT,
    MYSQL_URI
};