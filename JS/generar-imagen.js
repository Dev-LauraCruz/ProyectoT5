document.addEventListener('DOMContentLoaded', function() {
    const btnLimpiar = document.getElementById('btn-limpiar');
    const btnGenerar = document.getElementById('btn-generar');
    const textoDescripcion = document.getElementById('texto-descripcion');
    const imagenGenerada = document.getElementById('imagen-generada');
    
    // Función para limpiar
    btnLimpiar.addEventListener('click', function() {
        // Limpiar campo de descripción
        textoDescripcion.value = '';
        
        // Restablecer área de imagen
        imagenGenerada.innerHTML = `
            <div class="placeholder">
                <i class="fas fa-image"></i>
                <p>La imagen aparecerá aquí</p>
            </div>
        `;
    });
    
    // Función para generar imagen
    btnGenerar.addEventListener('click', async function() {
        const prompt = textoDescripcion.value.trim();
        
        if (!prompt) {
            alert('Por favor, ingresa una descripción para generar la imagen');
            return;
        }
        
        // Mostrar estado de carga
        imagenGenerada.innerHTML = `
            <div class="placeholder">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Generando imagen...</p>
            </div>
        `;
        
        // Deshabilitar botón mientras se genera la imagen
        btnGenerar.disabled = true;
        btnGenerar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
        
        try {
            // Realizar la petición al endpoint
            const response = await fetch('/api/generate_image', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ prompt: prompt })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al generar la imagen');
            }
            
            const data = await response.json();
            
            // Mostrar la imagen generada
            imagenGenerada.innerHTML = `
                <img src="${data.image}" alt="Imagen generada" class="imagen-resultado">
            `;
        } catch (error) {
            // Mostrar error
            imagenGenerada.innerHTML = `
                <div class="placeholder error">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>Error: ${error.message}</p>
                </div>
            `;
            console.error('Error:', error);
        } finally {
            // Restaurar botón
            btnGenerar.disabled = false;
            btnGenerar.innerHTML = '<i class="fas fa-magic"></i> Generar Imagen';
        }
    });
});