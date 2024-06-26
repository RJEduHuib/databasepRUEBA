const listBase = (sequelize, type) =>{
    return sequelize.define('listBase',{
        idListBase: {
            type: type.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            comment: 'Campo unico de lista de base'
        },
        nameListBase: {
            type: type.STRING,
            comment: 'Nombre de lista de base'
        },
        dateListBase: {
            type: type.STRING,
            comment: 'Fecha de lista de base'
        },
        stateListBase: {
            type: type.STRING,
            comment: 'Estado de lista de base'
        },
        createListBase: {
            type: type.STRING,
            comment: 'Crear de lista de base'
        },
        updateListBase: {
            type: type.STRING,
            comment: 'Actualizar de lista de base'
        }
    }, {
        timestamps: false,
        comment: 'Tabla de lista de base'
    })
}

module.exports = listBase