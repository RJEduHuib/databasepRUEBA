const permission = (sequelize, type) =>{
    return sequelize.define('permission', {
        idPermission: {
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            comment: 'Campo unico de Permisos'
        },
        namePermission: {
            type: type.STRING,
            comment: 'Nombre de Permisos'
        },
        statePermission: {
            type: type.STRING,
            comment: 'Estado de Permisos'
        },
        createPermission: {
            type: type.STRING,
            comment: 'Crear de Permisos'
        },
        updatePermission: {
            type: type.STRING,
            comment: 'Actualizar de Permisos'
        }
    }, {
        timestamps: false,
        comment: 'Tabla de Permisos'
    })
}

module.exports = permission