// Importar módulos necesarios
const express = require('express');
const morgan = require('morgan');
const path = require('path');
const exphbs = require('express-handlebars');
const session = require('express-session');
const passport = require('passport');
const flash = require('connect-flash');
const MySQLStore = require('express-mysql-session')(session);
const bodyparser = require('body-parser');
const fileUpload = require("express-fileupload");
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const csurf = require('csurf');
const cookieParser = require('cookie-parser');

// Importar módulos locales
const { MYSQLHOST, MYSQLUSER, MYSQLPASSWORD, MYSQLDATABASE, MYSQLPORT } = require("./keys");
require('./lib/passport');

// Crear aplicación Express
const app = express();
// Configurar almacenamiento de sesiones
const options = {
    host: MYSQLHOST,
    port: MYSQLPORT,
    user: MYSQLUSER,
    password: MYSQLPASSWORD,
    database: MYSQLDATABASE,
    createDatabaseTable: true
};
const sessionStore = new MySQLStore(options);

// Configurar Handlebars
const handlebars = exphbs.create({
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views', 'layouts'),
    partialsDir: path.join(__dirname, 'views', 'partials'),
    extname: '.hbs',
    helpres: require('./lib/handlebars')
});

// Configurar motor de vistas
app.set('port', process.env.PORT || 4000);
app.set('views', path.join(__dirname, 'views'));
app.engine('.hbs', handlebars.engine);
app.set('view engine', '.hbs');

// Configurar middleware
app.use(cookieParser());
app.use(fileUpload({ createParentPath: true }));
app.use(morgan('dev'));
app.use(express.json({ limit: '300mb' }));
app.use(express.urlencoded({ extended: true, limit: '300mb' }));
app.use(session({
    key: 'session_cookie_name',
    secret: 'session_cookie_secret',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production', // Configura según tus necesidades
        httpOnly: true,
        maxAge: 30 * 60 * 1000,
        sameSite: 'Strict' // Cambiado a 'Strict'
    }
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

// Middleware de manejo de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Error interno del servidor');
});

// Configurar variables globales
app.use((req, res, next) => {
    app.locals.message = req.flash('message');
    app.locals.success = req.flash('success');
    app.locals.user = req.user;
    next();
});

app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"], // Permitir estilos en línea
            imgSrc: ["'self'", "data:"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
            childSrc: ["'self'"],
            workerSrc: ["'self'"],
            frameAncestors: ["'none'"],
            formAction: ["'self'"],
            upgradeInsecureRequests: [],
        },
    })
);


// Limitación de la tasa de solicitudes
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100 // limita cada IP a 100 solicitudes por windowMs
});
app.use(limiter);

// Protección CSRF
app.use(csurf({ cookie: true }));
const csrfMiddleware = csurf({
    cookie: true
  });
app.use(csrfMiddleware);

app.use(function (err, req, res, next) {
    if (err.code !== 'EBADCSRFTOKEN') return next(err);

    // Manejo del error CSRF aquí
    res.status(403);
    res.send('La validación del token CSRF ha fallado. Por favor, recarga la página.');
});

// Configurar archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));
app.use('/src/public', express.static(path.join(__dirname, 'src/public'))); // agrege
// Rutas - Definir tus rutas aquí
app.use(require('./router/index.router'))
app.use('/sell', require('./router/sell.router'))
app.use('/page', require('./router/page.router'))
app.use('/user', require('./router/admin.router'))
app.use('/listBase', require('./router/excel.router'))
app.use('/rol', require('./router/rol.router'))
app.use('/permissions', require('./router/permision.router'))
app.use('/clients', require('./router/client.router'))
app.use('/sell', require('./router/sell.router'))
app.use('/operatiors', require('./router/typeOperator'))
// Exportar la aplicación

module.exports = app