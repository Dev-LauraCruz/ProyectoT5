document.addEventListener('DOMContentLoaded', function() {
    const btnLimpiar = document.getElementById('btn-limpiar');
    const btnGenerar = document.getElementById('btn-generar');
    const textoOriginal = document.getElementById('texto-original');
    const areaPreguntas = document.getElementById('area-preguntas');
    const areaRespuestas = document.getElementById('area-respuestas');

    // Habilitar el botón de generar solo cuando hay texto y preguntas
    function verificarCampos() {
        btnGenerar.disabled = !(textoOriginal.value.trim() && areaPreguntas.value.trim());
    }

    textoOriginal.addEventListener('input', verificarCampos);
    areaPreguntas.addEventListener('input', verificarCampos);

    btnLimpiar.addEventListener('click', function() {
        // Limpiar todos los campos
        textoOriginal.value = '';
        areaPreguntas.value = '';
        areaRespuestas.innerHTML = '<p class="placeholder">Las respuestas aparecerán aquí...</p>';
        
        // Deshabilitar botón de generar
        btnGenerar.disabled = true;
    });

    btnGenerar.addEventListener('click', async function() {
        // Mostrar indicador de carga
        areaRespuestas.innerHTML = '<p class="cargando"><i class="fas fa-spinner fa-spin"></i> Generando respuestas...</p>';
        
        try {
            // Obtener las preguntas (cada pregunta en una línea)
            const preguntas = areaPreguntas.value.split('\n').filter(q => q.trim() !== '');
            const contexto = textoOriginal.value;
            
            // Contenedor para las respuestas
            let respuestasHTML = '';
            
            // Procesar cada pregunta
            for (const pregunta of preguntas) {
                if (pregunta.trim() === '') continue;
                
                const respuesta = await obtenerRespuesta(pregunta, contexto);
                
                // Añadir al HTML
                respuestasHTML += `
                    <div class="item-respuesta">
                        <div class="pregunta"><strong>Pregunta:</strong> ${pregunta}</div>
                        <div class="respuesta"><strong>Respuesta:</strong> ${respuesta}</div>
                    </div>
                `;
            }
            
            // Actualizar el área de respuestas
            areaRespuestas.innerHTML = respuestasHTML || '<p class="placeholder">No se pudieron generar respuestas.</p>';
            
        } catch (error) {
            console.error('Error:', error);
            areaRespuestas.innerHTML = `<p class="error"><i class="fas fa-exclamation-triangle"></i> Error: ${error.message}</p>`;
        }
    });

    // Función para obtener la respuesta del servidor
    async function obtenerRespuesta(pregunta, contexto) {
        try {
            const response = await fetch('/api/question', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    question: pregunta,
                    context: contexto
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error en la solicitud');
            }
            
            const data = await response.json();
            return data.answer;
        } catch (error) {
            console.error('Error al obtener respuesta:', error);
            throw error;
        }
    }
});