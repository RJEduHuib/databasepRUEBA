const page = (sequelize, type) =>{
    return sequelize.define('page',{
        idPage: {
            type: type.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            comment: 'Campo unico de Pagina'
        },
        photoPage: {
            type: type.STRING,
            comment: 'Imagen de Pagina'
        },
        namePage: {
            type: type.STRING,
            comment: 'Nombre de Pagina'
        },
        descriptionPage: {
            type: type.TEXT,
            comment: 'Description de Pagina'
        },
        misonPage: {
            type: type.TEXT,
            comment: 'Mison de Pagina'
        },
        visonPage: {
            type: type.TEXT,
            comment: 'Vision de Pagina'
        },
        rankingPage: {
            type: type.STRING,
            comment: 'ranking de Pagina'
        },
        cellPhonePage: {
            type: type.STRING,
            comment: 'Celular de Pagina'
        },
        emailPage: {
            type: type.STRING,
            comment: 'Correo de Pagina'
        },
        statePage: {
            type: type.STRING,
            comment: 'Estado de Pagina'
        },
        createPage: {
            type: type.STRING,
            comment: 'Crear de Pagina'
        },
        updatePage: {
            type: type.STRING,
            comment: 'Actualizacion de Pagina'
        },
    }, {
        timestamps: false,
        comment: 'Tabla de Pagina'
    })
}

module.exports = page