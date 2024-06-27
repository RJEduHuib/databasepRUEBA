const detailInitialBase = (sequelize, type) =>{
    return sequelize.define('detailInitialBase',{
        idDetailBaseList: {
            type: type.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            comment: 'Campo unico de Detalle de base inicial'
        },
        numerosBaseInicial: type.STRING,
        createDetailInitialBase: {
            type: type.STRING,
            comment: 'Crear de Detalle de base inicial'
        },
        updateDetailInitialBase: {
            type: type.STRING,
            comment: 'Actualizar de Detalle de base inicial'
        }
    }, {
        timestamps: false,
        comment: 'Tabla de Detalle de base inicial'
    })
}

module.exports = detailInitialBase