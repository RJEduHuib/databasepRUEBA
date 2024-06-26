const Client = (sequelize, type) => {
    return sequelize.define('clients', {
        idClient: {
            type: type.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            comment: 'Campo unico de usuario'
        },
        photoClient: {
            type: type.STRING,
            comment: 'Foto de usuario'
        },
        completeNameClient: {
            type: type.STRING,
            comment: 'Nombre completo de usuario'
        },
        identificationCardClient: {
            type: type.STRING,
            comment: 'Cedula de usuario'
        },
        emailClient: {
            type: type.STRING,
            comment: 'correo de usuario'
        }, 
        cellPhoneClient: {
            type: type.STRING,
            comment: 'Celular de usuario'
        },
        usernameClient: {
            type: type.STRING,
            comment: 'sobre nombre de usuario'
        },
        passwordClient: {
            type: type.STRING,
            comment: 'contraseña de usuario'
        },
        stateClient: {
            type: type.STRING,
            comment: 'estado de usuario'
        },
        createClient: {
            type: type.STRING,
            comment: 'crear de usuario'
        },
        updateClient: {
            type: type.STRING,
            comment: 'actuazlizar de usuario'
        },
    }, {
        timestamps: false,
        comment: 'Tabla de usuarios'
    })
}

module.exports = Client