const detailListBase = (sequelize, type) =>{
    return sequelize.define('deatilBaseList',{
        idDetailBaseList: {
            type: type.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            comment: 'Campo unico de Detalle de lista de base'
        },
        createDetailListBase: {
            type: type.STRING,
            comment: 'Crear de Detalle de lista de base'
        },
        updateDetailListBase: {
            type: type.STRING,
            comment: 'Actualizar de Detalle de lista de base'
        }
    }, {
        timestamps: false,
        comment: 'Tabla de Detalle de lista de base'
    })
}

module.exports = detailListBase