class AIRequestHandler {
    constructor(texto) {
        this.textoOriginal = texto;
    }

    sanitizar() {
        return this.textoOriginal.replace(/[^\w\s.,áéíóúÁÉÍÓÚñÑ]/g, '').trim();
    }

    validar(textoSanitizado) {
        const cantidadPalabras = textoSanitizado.split(/\s+/).filter(word => word.length > 0).length;
        return cantidadPalabras >= 10;
    }

    procesar() {
        const textoLimpio = this.sanitizar();
        
        if (this.validar(textoLimpio)) {
            return {
                valido: true,
                mensaje: "Listos para Gemini API",
                datosEncapsulados: {
                    promptLimpio: textoLimpio
                }
            };
        } else {
            return {
                valido: false,
                mensaje: "Error: El texto debe contener al menos 10 palabras."
            };
        }
    }
}

module.exports = AIRequestHandler;