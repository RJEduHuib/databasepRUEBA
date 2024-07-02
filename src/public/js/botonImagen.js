'use strict';

class FileUploader {
    constructor(buttonId, inputId) {
        this.button = document.getElementById(buttonId);
        this.input = document.getElementById(inputId);

        this.button.addEventListener('click', () => {
            this.input.click();
        });
    }
}

const uploader = new FileUploader('botonImagen', 'seleccionArchivos'); 