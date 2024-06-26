const detailClients = (sequelize, type) =>{
    return sequelize.define('detailClients',{
        idDetailClients: {
            type: type.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            comment: 'Campo unico de Detalle de clientes'
        },
        createDetailClients: {
            type: type.STRING,
            comment: 'Crear de Detalle de clientes'
        },
        updateDetailClients: {
            type: type.STRING,
            comment: 'Actualizar de Detalle de clientes'
        }
    }, {
        timestamps: false,
        comment: 'Tabla de Detalle de clientes'
    })
}

module.exports = detailClients