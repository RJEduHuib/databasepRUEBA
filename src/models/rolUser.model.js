const rolUser = (sequelize, type) =>{
    return sequelize.define('rolUser',{
        idRolUser: {
            type: type.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            comment: 'Campo unico de Rol de usuario'
        },
        createRolUser: {
            type: type.STRING,
            comment: 'Crear de Rol de usuario'
        },
        updateRolUser: {
            type: type.STRING,
            comment: 'Actualizar de Rol de usuario'
        }
    }, {
        timestamps: false,
        comment: 'Tabla de Rol de usuario'
    })
}

module.exports = rolUser