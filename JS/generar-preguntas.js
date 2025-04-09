document.addEventListener('DOMContentLoaded', function() {
    // Selección de elementos
    const limpiarBtn = document.getElementById('btn-limpiar');
    const generarBtn = document.getElementById('btn-generar');
    const textoInput = document.getElementById('texto-entrada');
    const preguntasOutput = document.getElementById('preguntas-generadas');

    // Habilitar/deshabilitar botón de generar según si hay texto
    textoInput.addEventListener('input', function() {
        generarBtn.disabled = !textoInput.value.trim();
    });

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
        generarBtn.disabled = true;
    });

    // Función para generar preguntas
    generarBtn.addEventListener('click', async function() {
        const texto = textoInput.value.trim();
        
        if (!texto) {
            return;
        }

        // Mostrar indicador de carga
        preguntasOutput.innerHTML = `
            <div class="cargando">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Generando preguntas...</p>
            </div>
        `;

        try {
            // Llamar al API para generar preguntas
            const response = await fetch('/api/generate_questions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    text: texto
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al generar preguntas');
            }

            const data = await response.json();
            
            if (data.questions && data.questions.length > 0) {
                // Mostrar preguntas generadas
                let preguntasHTML = '<div class="lista-preguntas">';
                
                data.questions.forEach((pregunta, index) => {
                    preguntasHTML += `
                        <div class="pregunta-item">
                            <div class="numero-pregunta">${index + 1}</div>
                            <div class="texto-pregunta">${pregunta}</div>
                            <button class="btn-copiar" data-pregunta="${pregunta.replace(/"/g, '&quot;')}">
                                <i class="fas fa-copy"></i>
                            </button>
                        </div>
                    `;
                });
                
                preguntasHTML += '</div>';
                preguntasOutput.innerHTML = preguntasHTML;
                
                // Agregar funcionalidad a los botones de copiar
                document.querySelectorAll('.btn-copiar').forEach(btn => {
                    btn.addEventListener('click', function() {
                        const pregunta = this.getAttribute('data-pregunta');
                        copiarAlPortapapeles(pregunta);
                        
                        // Mostrar mensaje de copiado
                        const originalHTML = this.innerHTML;
                        this.innerHTML = '<i class="fas fa-check"></i>';
                        
                        setTimeout(() => {
                            this.innerHTML = originalHTML;
                        }, 1500);
                    });
                });
            } else {
                preguntasOutput.innerHTML = `
                    <div class="sin-resultados">
                        <i class="fas fa-info-circle"></i>
                        <p>No se pudieron generar preguntas para este texto. Intenta con un texto más largo o con más información.</p>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Error:', error);
            preguntasOutput.innerHTML = `
                <div class="error">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>${error.message || 'Ocurrió un error al generar las preguntas'}</p>
                </div>
            `;
        }
    });

    // Función para copiar texto al portapapeles
    function copiarAlPortapapeles(texto) {
        // Crear elemento temporal
        const el = document.createElement('textarea');
        el.value = texto;
        el.setAttribute('readonly', '');
        el.style.position = 'absolute';
        el.style.left = '-9999px';
        document.body.appendChild(el);
        
        // Seleccionar y copiar
        el.select();
        document.execCommand('copy');
        
        // Eliminar elemento temporal
        document.body.removeChild(el);
    }
});