const detailUnionUserRolPermission = (sequelize, type) => {
    return sequelize.define('detailUnionUserRolPermission', {
        idDetailUnionUserRolPermission: {
            type: type.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            comment: 'Campo unico de detalle de la union del rol y el permiso'
        },
        createDetailUnionUserRolPermission: {
            type: type.STRING,
            comment: 'Crear de detalle de la union del rol y el permiso'
        },
        updateDetailUnionUserRolPermission: {
            type: type.STRING,
            comment: 'Actualizar de detalle de la union del rol y el permiso'
        }
    }, {
        timestamps: false,
        comment: 'Tabla de detalle de la union del rol y el permiso'
    })
}

module.exports = detailUnionUserRolPermission