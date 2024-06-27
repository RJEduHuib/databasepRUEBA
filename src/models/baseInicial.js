const baseInicial = (sequelize, type) => {
    return sequelize.define('InitialBase',{
        idInitialBase: {
            type: type.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            Comment: 'Campo unico de la base inicial'
        },
        baseDoc: type.STRING,
    },{
        timestamps: false
    })
}

module.exports = baseInicial