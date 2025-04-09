document.addEventListener('DOMContentLoaded', () => {
    const textoOriginal = document.getElementById('texto-original');
    const textoResumido = document.getElementById('texto-resumido');
    const btnLimpiar = document.getElementById('btn-limpiar');
    const btnResumir = document.getElementById('btn-resumir');
    const contador = document.getElementById('contador');
    const contadorResumen = document.getElementById('contador-resumen');

    // Función para limpiar
    btnLimpiar.addEventListener('click', () => {
        textoOriginal.value = '';
        textoResumido.innerHTML = '<p class="placeholder">Aquí aparecerá el texto resumido...</p>';
        contador.textContent = '0';
        contadorResumen.textContent = '0';
    });

    // Contador de caracteres para el texto original
    textoOriginal.addEventListener('input', () => {
        contador.textContent = textoOriginal.value.length;
    });

    // Función para resumir el texto
    btnResumir.addEventListener('click', async () => {
        const texto = textoOriginal.value.trim();
        
        if (!texto) {
            alert('Por favor, ingresa texto para resumir');
            return;
        }

        // Mostrar estado de carga
        textoResumido.innerHTML = '<p class="placeholder">Procesando...</p>';
        btnResumir.disabled = true;
        
        try {
            const respuesta = await fetch('/api/summarize', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text: texto })
            });

            if (!respuesta.ok) {
                throw new Error('Error en la solicitud: ' + respuesta.status);
            }

            const datos = await respuesta.json();
            
            if (datos.error) {
                textoResumido.innerHTML = `<p class="error">${datos.error}</p>`;
            } else {
                textoResumido.innerHTML = `<p>${datos.summary}</p>`;
                // Actualizar contador del resumen
                contadorResumen.textContent = datos.summary.length;
            }
        } catch (error) {
            console.error('Error:', error);
            textoResumido.innerHTML = `<p class="error">Ocurrió un error al resumir el texto. Por favor, intenta de nuevo.</p>`;
        } finally {
            btnResumir.disabled = false;
        }
    });
});