const sell = (sequelize, type) =>{
    return sequelize.define('sells',{
        idSell: {
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            comment: 'Campo Unico de Ventas'
        },
        namePersonSell: {
            type: type.STRING,
            comment: 'Nombre de persona de Ventas'
        },
        companySell: {
            type: type.STRING,
            comment: 'Compania de venta de Ventas'
        },
        cellPhoneSell: {
            type: type.STRING,
            comment: 'Celular de Ventas'
        },
        salesValueSell: {
            type: type.STRING,
            comment: 'Valor de Ventas'
        },
        payTypeSell: {
            type: type.STRING,
            comment: 'Tipo de Pago de Ventas'
        },
        stateSell: {
            type: type.STRING,
            comment: 'Estado de Ventas'
        },
        createSell: {
            type: type.STRING,
            comment: 'Crear de Venta'
        },
        updateSell: {
            type: type.STRING,
            comment: 'Actualizar de Venta'
        }
    }, {
        timestamps: false,
        comment: 'Tabla de Ventas'
    })
}

module.exports = sell