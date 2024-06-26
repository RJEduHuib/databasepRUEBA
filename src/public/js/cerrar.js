'use strict';

class Cerrar {
    constructor(contenedorId) {
        this.contenedor = document.getElementById(contenedorId);
    }
    cerrado() {
        if (this.contenedor) {
            this.contenedor.style.display = 'none';
        }
    }
}

// Exponer una instancia de Cerrar al contexto global
window.cerrador = new Cerrar('contenedorMensaje');

document.addEventListener('DOMContentLoaded', (event) => {
    const botonCerrar = document.getElementById('botonCerrar');
    if (botonCerrar) {
        botonCerrar.addEventListener('click', function () {
            // Llama a la función que cierra el mensaje
            cerrador.cerrado();
        });
    }
});  