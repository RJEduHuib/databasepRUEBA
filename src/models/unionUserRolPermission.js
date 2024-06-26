const unionUserRolPermission = (sequelize, type) =>{
    return sequelize.define('unionUserRolPermission',{
        idUnionUserRolPermission: {
            type: type.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            comment: 'Campo unico de union del rol y el usuario'
        },
        createUnionUserRolPermission: {
            type: type.STRING,
            comment: 'Crear de union del rol y el usuario'
        },
        updateUnionUserRolPermission: {
            type: type.STRING,
            comment: 'Actualizar de union del rol y el usuario'
        }
    }, {
        timestamps: false,
        comment: 'Tabla de union del rol y el usuario'
    })
}

module.exports = unionUserRolPermission