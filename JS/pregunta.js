document.addEventListener('DOMContentLoaded', function() {
    const btnLimpiar = document.getElementById('btn-limpiar');
    const textoOriginal = document.getElementById('texto-original');
    const areaPreguntas = document.getElementById('area-preguntas');
    const areaRespuestas = document.getElementById('area-respuestas');

    btnLimpiar.addEventListener('click', function() {
        // Limpiar todos los campos
        textoOriginal.value = '';
        areaPreguntas.value = '';
        areaRespuestas.innerHTML = '<p class="placeholder">Las respuestas aparecerán aquí...</p>';
        
        // Deshabilitar botón de generar
        document.getElementById('btn-generar').disabled = true;
    });
});