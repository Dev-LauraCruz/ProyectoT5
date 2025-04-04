document.addEventListener('DOMContentLoaded', function() {
    // Selección de elementos
    const limpiarBtn = document.getElementById('btn-limpiar');
    const textoInput = document.getElementById('texto-entrada');
    const preguntasOutput = document.getElementById('preguntas-generadas');

    // Función para limpiar
    limpiarBtn.addEventListener('click', function() {
        // Limpiar campos
        textoInput.value = '';
        preguntasOutput.innerHTML = `
            <div class="placeholder">
                <i class="fas fa-lightbulb"></i>
                <p>Las preguntas generadas aparecerán aquí</p>
            </div>
        `;
        
        // Deshabilitar botón de generar
        document.getElementById('btn-generar').disabled = true;
    });
});