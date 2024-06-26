const typeOperator = (sequelize, type) =>{
    return sequelize.define('typeOperator',{
        idTypeOperator: {
            type: type.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            comment: 'Campo Unico de Tipo Operadora'
        },
        nameTypeOperator: {
            type: type.STRING,
            comment: 'Nombre de Tipo Operadora'
        },
        stateTypeOperator: {
            type: type.STRING,
            comment: 'Estado de Tipo Operadora'
        },
        createTypeOperator: {
            type: type.STRING,
            comment: 'Crear de Tipo Operadora'
        },
        updateTypeOperator: {
            type: type.STRING,
            comment: 'Actualizar de Tipo Operadora'
        }
    }, {
        timestamps: false,
        comment: 'Tabla de Tipo Operadora'
    })
}

module.exports = typeOperator