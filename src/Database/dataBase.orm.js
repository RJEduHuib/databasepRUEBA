const { Sequelize } = require("sequelize");
const { MYSQLHOST, MYSQLUSER, MYSQLPASSWORD, MYSQLDATABASE, MYSQLPORT, MYSQL_URI } = require("../keys");
const isProduction = process.env.NODE_ENV === 'production';

let sequelize;

// Usar URI de conexión si está disponible
if (MYSQL_URI) {
    sequelize = new Sequelize(MYSQL_URI);
} else {
    // Configuración para parámetros individuales
    sequelize = new Sequelize(MYSQLDATABASE, MYSQLUSER, MYSQLPASSWORD, {
        host: MYSQLHOST,
        port: MYSQLPORT,
        logging: !isProduction, 
        dialect: 'mysql',
        pool: {
            max: 60,
            min: 2,
            acquire: 80000,
            idle: 5000
        }
    });
}

// Autenticar y sincronizar
sequelize.authenticate({ alter: true })
    .then(() => {
        console.log("Conexión establecida con la base de datos");
    })
    .catch((err) => {
        console.error("No se pudo conectar a la base de datos:", err.message);
    });

sequelize.sync({ force: false })
    .then(() => {
        console.log("Tablas sincronizadas");
    })
    .catch((err) => {
        console.error("Error al sincronizar las tablas:", err.message);
    });

//extracionModelos
const baseModel = require('../models/base.model');
const clientModel = require('../models/client.model');
const dataListBaseModel = require('../models/datailListBase.model');
const listBaseModel = require('../models/listBase.model');
const pageModel = require('../models/page.model');
const permissionModel = require('../models/permission.model');
const rolModel = require('../models/rol.model');
const rolUserModel = require('../models/rolUser.model');
const sellModel = require('../models/sell.model');
const typeOperatorModel = require('../models/typeOperator.model');
const userModel = require('../models/user.model');
const unionUserRolPermissionsModel = require('../models/unionUserRolPermission')
const detalleunionUserRolPermissionsModel = require('../models/detailUnionUserRolPermission')
const detailClientsModel = require('../models/detailClients.model')
const baseInitialModel = require('../models/baseInicial')
const detailBaseInitialModel = require('../models/detailBaseInitial')
//zincronia tablas
const base = baseModel(sequelize, Sequelize)
const client = clientModel(sequelize, Sequelize)
const datailListBase = dataListBaseModel(sequelize, Sequelize)
const listBase = listBaseModel(sequelize, Sequelize)
const page = pageModel(sequelize, Sequelize)
const permission = permissionModel(sequelize, Sequelize)
const rol = rolModel(sequelize, Sequelize)
const rolUser = rolUserModel(sequelize, Sequelize)
const sell = sellModel(sequelize, Sequelize)
const typeOperator = typeOperatorModel(sequelize, Sequelize)
const user = userModel(sequelize, Sequelize)
const unionUserRolPermissions = unionUserRolPermissionsModel(sequelize, Sequelize)
const detalleunionUserRolPermissions = detalleunionUserRolPermissionsModel(sequelize, Sequelize)
const detailClients = detailClientsModel(sequelize, Sequelize)
const baseInitial = baseInitialModel(sequelize, Sequelize)
const detailBaseInitial = detailBaseInitialModel(sequelize, Sequelize)
//relaciones

user.hasMany(unionUserRolPermissions)
unionUserRolPermissions.belongsTo(user)

rol.hasMany(unionUserRolPermissions)
unionUserRolPermissions.belongsTo(rol)

unionUserRolPermissions.hasMany(detalleunionUserRolPermissions)
detalleunionUserRolPermissions.belongsTo(unionUserRolPermissions)

permission.hasMany(detalleunionUserRolPermissions)
detalleunionUserRolPermissions.belongsTo(permission)

user.hasMany(rolUser)
rolUser.belongsTo(user)

rol.hasMany(rolUser)
rolUser.belongsTo(rol)

rolUser.hasMany(permission)
permission.belongsTo(rolUser)

page.hasMany(rolUser)
rolUser.belongsTo(page)

page.hasMany(datailListBase)
datailListBase.belongsTo(page)

base.hasMany(datailListBase)
datailListBase.belongsTo(base)

typeOperator.hasMany(base)
base.belongsTo(typeOperator)

listBase.hasMany(datailListBase)
datailListBase.belongsTo(listBase)

client.hasMany(datailListBase)
datailListBase.belongsTo(client)

client.hasMany(rolUser)
rolUser.belongsTo(client)

client.hasMany(detailClients)
detailClients.belongsTo(client)

sell.hasMany(detailClients)
detailClients.belongsTo(sell)

page.hasMany(detailClients)
detailClients.belongsTo(page)

page.hasMany(typeOperator)
typeOperator.belongsTo(page)

page.hasMany(baseInitial)
baseInitial.belongsTo(page)

baseInitial.hasMany(detailBaseInitial)
detailBaseInitial.belongsTo(baseInitial)

sequelize.sync()

// Exportar el objeto sequelize
module.exports = {
    base,
    client,
    datailListBase,
    listBase,
    page,
    permission,
    rol,
    rolUser,
    sell,
    typeOperator,
    user,
    unionUserRolPermissions,
    detalleunionUserRolPermissions,
    detailClients,
    baseInitial,
    detailBaseInitial
};