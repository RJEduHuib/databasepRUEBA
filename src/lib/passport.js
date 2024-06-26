const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const orm = require('../Database/dataBase.orm');
const sql = require('../Database/dataBase.sql');
const helpers = require('./helpers');
const bcrypt = require('bcrypt');
const { cifrarDatos, descifrarDatos } = require('./encrypDates');

// Validación de entrada
const validateInput = (input) => {
    // Verifica que la entrada no esté vacía
    if (!input) {
        console.log('La entrada no puede estar vacía.');
        return false;
    }

    // Verifica que la entrada tenga al menos 8 caracteres
    if (input.length < 8) {
        console.log('La entrada debe tener al menos 8 caracteres.');
        return false;
    }

    // Verifica que la entrada solo contenga caracteres permitidos
    const allowedCharactersRegex = /^[a-z0-9'!@#$%^&*()]+$/i;
    if (!allowedCharactersRegex.test(input)) {
        console.log('La entrada contiene caracteres no permitidos.');
        return false;
    }

    // Si todas las validaciones pasan, la entrada es válida
    return true;
};


passport.use(
    'local.signin',
    new LocalStrategy(
        {
            usernameField: 'username',
            passwordField: 'password',
            passReqToCallback: true,
        },
        async (req, username, password, done) => {
            if (!validateInput(username) || !validateInput(password)) {
                return done(null, false, req.flash("message", "Entrada inválida."));
            }
            const users = await sql.query('select * from users')
            for (let i = 0; i < users.length; i++) {
                const user = await orm.user.findOne({ where: { usernameUser: users[i].usernameUser } });
                let decryptedUsername = descifrarDatos(user.usernameUser)
                if (decryptedUsername == username) {
                    const validPassword = await bcrypt.compare(password, user.passwordUser);
                    if (validPassword) {
                        return done(null, user, req.flash("success", "Bienvenido" + " " + username));
                    } else {
                        return done(null, false, req.flash("message", "Datos incorrecta"));
                    }
                }
            }
            return done(null, false, req.flash("message", "El nombre de usuario no existe."));
        }
    )
);

passport.use(
    'local.signup',
    new LocalStrategy(
        {
            usernameField: 'username',
            passwordField: 'password',
            passReqToCallback: true,
        },
        async (req, username, password, done) => {
            try {
                if (!validateInput(username) || !validateInput(password)) {
                    return done(null, false, req.flash("message", "Entrada inválida."));
                }
                const existingUser = await orm.user.findOne({ where: { usernameUser: cifrarDatos(username) } });
                if (existingUser) {
                    return done(null, false, req.flash('message', 'El nombre de usuario ya existe.'));
                } else {
                    const hashedPassword = await helpers.hashPassword(password);
                    const {
                        idUser,
                        completeNameUser,
                        identificationCardUser,
                        emailUser,
                        cellPhoneUser
                    } = req.body;

                    let newClient = {
                        idUser: idUser,
                        identificationCardUser: cifrarDatos(identificationCardUser),
                        cellPhoneUser: cifrarDatos(cellPhoneUser),
                        emailUser: cifrarDatos(emailUser),
                        completeNameUser: cifrarDatos(completeNameUser),
                        usernameUser: cifrarDatos(username),
                        passwordUser: hashedPassword,
                        rolUser: 'superAdministrador',
                        stateUser: 'activado',
                        createUser: new Date().toLocaleString()
                    };

                    const newadmin = {
                        nameRol: 'superAdministrador',
                        stateRol: 'Activo',
                        createRol: new Date().toLocaleString()
                    }

                    const newRolUser = {
                        createRolUser: new Date().toLocaleString(),
                        userIdUser: idUser,
                        rolIdRol: '1'
                    }

                    const newPermissions = {
                        namePermission: 'controlTotal',
                        statePermission: 'Activo',
                        rolUserIdRolUser: '1',
                        createPermission: new Date().toLocaleString()
                    }

                    const guardar = await orm.user.create(newClient);
                    await orm.rol.create(newadmin);
                    await orm.rolUser.create(newRolUser);
                    await orm.permission.create(newPermissions);

                    const imagenUsuario = req.files.photoUse;
                    const validacion = path.extname(imagenUsuario.name);
                    const extencion = [".PNG", ".JPG", ".JPEG", ".GIF", ".TIF", ".png", ".jpg", ".jpeg", ".gif", ".tif"];

                    if (!extencion.includes(validacion)) {
                        return req.flash("message", "Imagen no compatible.");
                    }

                    if (!req.files) {
                        return req.flash("message", "Imagen no insertada.");
                    }

                    const filePath = __dirname + '/../public/img/usuario/' + imagenUsuario.name;

                    imagenUsuario.mv(filePath, (err) => {
                        if (err) {
                            console.error(err);
                            return req.flash("message", "Error al guardar la imagen.");
                        } else {
                            sql.promise().query("UPDATE users SET photoUser = ? WHERE idUser = ?", [imagenUsuario.name, idUser])
                            /* const formData = {
                                image: {
                                    value: fs.createReadStream(filePath),
                                    options: {
                                        filename: imagenUsuario.name,
                                        contentType: imagenUsuario.mimetype,
                                    },
                                },
                            };
    
                            const postRequesten = request.post({
                                url: 'http://localhost:5000/imagenEvento',
                                formData: formData,
                            });
    
                            req.setTimeout(0);
    
                            postRequesten.on('error', function (err) {
                                console.error('upload failed:', err);
                                req.flash("success", "Error al subir imagen.");
                            });
    
                            postRequesten.on('response', function (response) {
                                console.log('Upload successful! Server responded with:', response.statusCode);
                            }); */
                        }
                    });

                    newClient.id = guardar.insertId
                    return done(null, newClient);
                }
            } catch (error) {
                return done(error);
            }
        }
    )
);

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

module.exports = passport;