'use strict';

class Estado {
    constructor() {
        this._idestado = document.getElementById('idestado');
        this._activarBtn = document.getElementById('activarBtn');
        this._desactivarBtn = document.getElementById('desactivarBtn')
    }
    inicio() {
        if (this._idestado.value == 'Activo') {
            this._activarBtn.disabled = true
            this._desactivarBtn.disabled = false
        }else{
            this._desactivarBtn.disabled = true
            this._activarBtn.disabled = false
        }
    }

    deshabilitar() {
        if (this._idestado.value == 'Activo') {
            this._idestado.value = 'inhabilitado';
            this._activarBtn.disabled = false
            this._desactivarBtn.disabled = true
        }
    }

    habilitar() {
        if (this._idestado.value == 'inhabilitado') {
            this._idestado.value = 'Activo';
            this._desactivarBtn.disabled = false
            this._activarBtn.disabled = true
        }
    }
}

const elecciones = new Estado();
window.onload = elecciones.inicio()

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('activarBtn').addEventListener('click', function () {
        elecciones.habilitar();
    });

    document.getElementById('desactivarBtn').addEventListener('click', function () {
        elecciones.deshabilitar();
    });
});