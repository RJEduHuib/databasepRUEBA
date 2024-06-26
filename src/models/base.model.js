const base = (sequelize, type) => {
    return sequelize.define('base', {
        idBase: {
            type: type.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            comment: 'Campo unico de Base'
        },
        namePersonDataBase: {
            type: type.STRING,
            comment: 'numero de Base'
        },
        numberBase: {
            type: type.STRING,
            comment: 'numero de Base'
        },
        debtsBase: {
            type: type.STRING,
            comment: 'Deudas de Base'
        },
        namePostBase: {
            type: type.STRING,
            comment: 'nombre de persona encargada de Base'
        },
        dateBase: {
            type: type.STRING,
            comment: 'Fecha de Base'
        }
    }, {
        timestamps: false,
        comment: 'Tabla de Base'
    })
}

module.exports = base