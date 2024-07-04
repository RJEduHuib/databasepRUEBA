const passport = require('passport')
const orm = require('../Database/dataBase.orm.js')
const sql = require('../Database/dataBase.sql')
const indexCtl = {}

indexCtl.mostrar = async (req, res) => {
    try {
        await sql.promise().execute('CREATE OR REPLACE VIEW clienteCompania AS SELECT c.*, d.*, p.* FROM clients c JOIN detailClients d ON d.clientIdClient = c.idClient JOIN pages p ON d.pageIdPage = p.idPage')
        await sql.promise().execute('CREATE OR REPLACE VIEW permisosRol AS SELECT p.*, r.* FROM rolUsers r JOIN permissions p ON p.rolUserIdRolUser = r.idRolUser')
        await sql.promise().execute('CREATE OR REPLACE VIEW rolsPagina AS SELECT p.*, r.* FROM rolUsers p JOIN rols r ON p.rolIdRol = r.idRol')
        await sql.promise().execute('CREATE OR REPLACE VIEW usuarioPagina AS SELECT p.*, r.*,u.*,g.* FROM rolUsers p JOIN rols r ON p.rolIdRol = r.idRol JOIN users u on p.userIdUser = u.idUser JOIN pages g ON p.pageIdPage = g.idPage')
        await sql.promise().execute('CREATE OR REPLACE VIEW usuariosCompletos AS SELECT u.*, r.*, o.*, p.* FROM users u JOIN rolUsers r JOIN rols o on r.rolIdRol = o.idRol JOIN permissions p ON p.rolUserIdRolUser = r.idRolUser');
        await sql.promise().execute('CREATE OR REPLACE VIEW clienteComprador AS SELECT c.*, s.*, d.* FROM clients c JOIN detailClients d ON d.clientIdClient = c.idClient JOIN sells s ON d.sellIdSell = s.idSell')
        await sql.promise().execute('CREATE OR REPLACE VIEW listaRolUsuarioCreado AS SELECT s.*, u.*, r.*, p.*, l.pageIdPage FROM users s JOIN unionuserrolpermissions u on u.userIdUser = s.idUser JOIN rols r ON u.rolIdRol = r.idRol JOIN rolusers l on l.rolIdRol = r.idRol JOIN permissions p on p.rolUserIdRolUser = l.idRolUser')
        const [row] = await sql.promise().query('SELECT * FROM pages WHERE idPage = 1')
        res.render('inicio', { lista: row, csrfToken: req.csrfToken() });
    } catch (error) {
        console.error('Error en la consulta SQL:', error.message);
        res.status(500).send('Error interno del servidor');
    }
};

indexCtl.Inicio = async (req, res) => {
    try {
        const [row] = await sql.promise().query('SELECT * FROM pages WHERE idPage = 1')
        res.render('login/index', { lista: row, csrfToken: req.csrfToken() });
    } catch (error) {
        console.error('Error en la consulta SQL:', error.message);
        res.status(500).send('Error al realizar la consulta');
        res.redirect('/')
    }
}

indexCtl.mostrarRegistro = async (req, res) => {
    try {
        const usuario = await sql.query('select COUNT(*) AS total from users')
        if (usuario[0].total === 0) {
            const [rows] = await sql.promise().query('SELECT MAX(idUser) AS Maximo FROM users');
            res.render('login/register', { lista: rows, csrfToken: req.csrfToken() });
        } else {
            res.redirect('/Login')
        }
    } catch (error) {
        console.error('Error en la consulta SQL:', error.message);
        res.status(500).send('Error al realizar la consulta');
    }
}

indexCtl.registro = passport.authenticate("local.signup", {
    successRedirect: "/closeSection",
    failureRedirect: "/Register",
    failureFlash: true,
    failureMessage: true
})

indexCtl.login = async (req, res, next) => {
    passport.authenticate("local.signin", (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.redirect("/Register");
        }
        req.logIn(user, async (err) => {
            if (err) {
                return next(err);
            }
            try {
                const [rows] = await sql.promise().query('SELECT * FROM rolusers WHERE userIdUser = ?', [req.user.idUser]);
                
                const rol = rows[0].userIdUser; 

                if (rol === 1) {
                    return res.redirect("/page/add/" + req.user.idUser);
                } else if (rol === 2) {
                    return res.redirect("/user/list/" + req.user.idUser);
                } else if (rol === 3) {
                    return res.redirect("/listBase/list/" + req.user.idUser);
                }
            } catch (error) {
                console.error('Error en la consulta SQL:', error.message);
                return res.status(500).send('Error interno del servidor');
            }
        });
    })(req, res, next);
};

indexCtl.CerrarSesion = (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash("success", "Cerrada la Sesión con éxito.");
        res.redirect("/Login");
    });
};

module.exports = indexCtl