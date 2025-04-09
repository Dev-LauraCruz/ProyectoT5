document.addEventListener('DOMContentLoaded', function() {
    const btnLimpiar = document.getElementById('btn-limpiar');
    const btnTraducir = document.getElementById('btn-traducir');
    const textoOriginal = document.getElementById('texto-original');
    const textoTraducido = document.getElementById('texto-traducido');

    // Evento para limpiar
    btnLimpiar.addEventListener('click', function() {
        // Limpiar campos
        textoOriginal.value = '';
        textoTraducido.innerHTML = '<p class="placeholder">La traducción aparecerá aquí...</p>';
        
        // Deshabilitar botón de traducir
        btnTraducir.disabled = true;
        
        // Feedback visual
        btnLimpiar.innerHTML = '<i class="fas fa-check"></i> Limpiado!';
        setTimeout(() => {
            btnLimpiar.innerHTML = '<i class="fas fa-eraser"></i> Limpiar Todo';
        }, 1500);
    });
    
    // Validación básica para habilitar el botón Traducir
    textoOriginal.addEventListener('input', function() {
        btnTraducir.disabled = !this.value.trim();
    });
    
    // Función para traducir el texto
    btnTraducir.addEventListener('click', async function() {
        const texto = textoOriginal.value.trim();
        
        if (!texto) {
            return; // No debería ocurrir debido a la validación, pero por seguridad
        }
        
        // Mostrar estado de carga
        textoTraducido.innerHTML = '<p class="placeholder"><i class="fas fa-spinner fa-spin"></i> Traduciendo...</p>';
        btnTraducir.disabled = true;
        
        try {
            // Traducción de inglés a francés
            const respuesta = await fetch('/api/translate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    text: texto,
                    source_lang: 'English',
                    target_lang: 'French'
                })
            });
            
            if (!respuesta.ok) {
                throw new Error('Error en la solicitud: ' + respuesta.status);
            }
            
            const datos = await respuesta.json();
            
            if (datos.error) {
                textoTraducido.innerHTML = `<p class="error">${datos.error}</p>`;
            } else {
                textoTraducido.innerHTML = `<p>${datos.translation}</p>`;
            }
        } catch (error) {
            console.error('Error:', error);
            textoTraducido.innerHTML = `<p class="error">Ocurrió un error al traducir el texto. Por favor, intenta de nuevo.</p>`;
        } finally {
            // Reactivar el botón solo si hay texto
            btnTraducir.disabled = !textoOriginal.value.trim();
        }
    });
});