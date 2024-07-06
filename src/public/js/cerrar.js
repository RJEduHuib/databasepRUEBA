'use strict';

class Cerrar {
    constructor() {
        // No necesitamos el ID del contenedor aquí porque lo obtenemos dinámicamente
    }
    cerrado(contenedor) {
        console.log('cerrado');
        if (contenedor) {
            contenedor.style.display = 'none';
        }
    }
}

document.addEventListener('DOMContentLoaded', (event) => {
    const botonesCerrar = document.querySelectorAll('.botonCerrar');

    botonesCerrar.forEach(boton => {
        boton.addEventListener('click', function () {
            // Busca el contenedor de mensaje padre del botón clickeado
            const contenedor = this.closest('.contenedorMensaje');
            if (contenedor) {
                const cerrador = new Cerrar();
                cerrador.cerrado(contenedor);
            }
        });
    });
});
