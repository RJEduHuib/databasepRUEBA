'use strict';

class ImagePreviewer {
  constructor(inputElementId, imageElementId) {
    this._inputElement = document.getElementById(inputElementId);
    this._imageElement = document.getElementById(imageElementId);
    this._validImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
    this._registerEvent();
  }

  _registerEvent() {
    this._inputElement.addEventListener('change', (event) => this._showImage(event));
  }

  _showImage(event) {
    const files = event.target.files;
    if (files && files[0]) {
      const file = files[0];

      if (this._validImageTypes.includes(file.type)) {
        const fileReader = new FileReader();
        fileReader.onload = (e) => {
          const safeUrl = e.target.result.replace(/</g, "<").replace(/>/g, ">");
          this._imageElement.src = safeUrl;
        };
        fileReader.onerror = (e) => {
          console.error('Error al leer el archivo:', e);
        };
        fileReader.readAsDataURL(file);
      } else {
        console.error('Tipo de archivo no permitido');
      }
    }
  }
}

// Uso de la clase ImagePreviewer
const previewer = new ImagePreviewer('seleccionArchivos', 'imagenPrevisualizacion');