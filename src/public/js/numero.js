'use strict';

class obtenerNumero {
    constructor() {
        this._numero = document.getElementById('numero');
    }
    aumento() {
        if (this._numero && this._numero.value === '') {
            this._numero.value = 1;
        } else if (this._numero) {
            const valorActual = parseInt(this._numero.value);
            if (!isNaN(valorActual)) {
                this._numero.value = valorActual + 1;
            } else {
                // Manejo de errores si la conversión falla
                console.error('El valor actual no es un número.');
            }
        }
    }
}

let numeros = new obtenerNumero();

window.onload = function() {
    numeros.aumento();
};
