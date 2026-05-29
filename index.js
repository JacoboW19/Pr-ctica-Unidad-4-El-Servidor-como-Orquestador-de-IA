const express = require('express');
const path = require('path');
const AIRequestHandler = require('./AIRequestHandler');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/submit', (req, res) => {
    const propuestaTexto = req.body.proposal;

    if (!propuestaTexto) {
        return res.send("<h1>Error: No se recibió ningún texto.</h1><a href='/'>Volver</a>");
    }

    const manejadorIA = new AIRequestHandler(propuestaTexto);
    const resultado = manejadorIA.procesar();

    let respuestaHTML = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Respuesta del Servidor</title>
        <link rel="stylesheet" href="/css/style.css">
    </head>
    <body>
        <header class="header-banner">
            <div class="tag-status">Servidor Node.js</div>
            <h1>Resultado del Procesamiento</h1>
        </header>
        <main class="container">
            <div class="form-wrapper" style="text-align: center;">
    `;

    if (resultado.valido) {
        respuestaHTML += `
                <h2 class="form-title" style="color: #2e7d32; border-bottom: none; margin-bottom: 10px;">✅ ${resultado.mensaje}</h2>
                <p style="color: var(--text-light); margin-bottom: 25px;">La clase <strong>AIRequestHandler</strong> sanitizó y encapsuló tu propuesta correctamente.</p>
                
                <div style="background-color: #fafafa; padding: 20px; border-radius: var(--radius-box); border: 1px solid var(--border-color); margin-bottom: 25px; text-align: left;">
                    <h4 style="color: var(--color-blue); margin-bottom: 10px;">Texto procesado:</h4>
                    <p style="color: var(--text-light); line-height: 1.6; font-family: monospace; font-size: 1.1em;">
                        ${resultado.datosEncapsulados.promptLimpio}
                    </p>
                </div>
        `;
    } else {
        respuestaHTML += `
                <h2 class="form-title" style="color: #c62828; border-bottom: none; margin-bottom: 10px;">❌ Error de Validación</h2>
                <p style="color: var(--text-main); margin-bottom: 25px;">${resultado.mensaje}</p>
        `;
    }

    respuestaHTML += `
                <a href="/" style="display: inline-block; text-decoration: none; width: auto; padding: 12px 30px;" class="btn-action">Volver al Formulario</a>
            </div>
        </main>
    </body>
    </html>
    `;

    res.send(respuestaHTML);
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});