'use strict';

class Seleccion {
    constructor() {
        this._idPermisos = document.getElementById('idPermisos');
        this._permisos = document.getElementById('permisos');
        this._listaValores = []; // Almacena los valores seleccionados
    }

    permisosLista() {
        const valorSeleccionado = this._idPermisos.value;
        if (valorSeleccionado) {
            this._listaValores.push(valorSeleccionado);
            this.actualizarLista();
        }
    }
    actualizarLista() {
        // Crea una lista de elementos <li> con los valores seleccionados y un botón de eliminación
        const listaHTML = this._listaValores.map(valor => `
            <li>
                <input name="permiso" value="${valor}">
            </li>
        `).join('');
        this._permisos.innerHTML = `<ul>${listaHTML}</ul>`; // Incrementa el contador para el próximo ID único
    }
}

// Crea una instancia del selector de permisos
const darPermisos = new Seleccion();

document.getElementById('idPermisos').addEventListener('change', () => {
    darPermisos.permisosLista();
});