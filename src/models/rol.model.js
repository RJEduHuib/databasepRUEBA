const rol = (sequelize, type) => {
    return sequelize.define('rol', {
        idRol: {
            type: type.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            Comment: 'Campo Unico de Rol'
        },
        nameRol: {
            type: type.STRING,
            comment: 'Nombre de Rol'
        },
        stateRol: {
            type: type.STRING,
            comment: 'Estado de Rol'
        },
        createRol: {
            type: type.STRING,
            comment: 'Crear de Permisos'
        },
        updateRol: {
            type: type.STRING,
            comment: 'Actualizar de Permisos'
        }
    }, {
        timestamps: false,
        comment: 'Tabla de Rol'
    })
}

module.exports = rol