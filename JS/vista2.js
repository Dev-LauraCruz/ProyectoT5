document.addEventListener('DOMContentLoaded', function() {
    // Redirección a páginas según la función seleccionada
    const botonesFuncion = document.querySelectorAll('.btn-funcion');
    
    botonesFuncion.forEach(boton => {
        boton.addEventListener('click', function() {
            const cuadroPadre = this.closest('.cuadro-funcion');
            const idFuncion = cuadroPadre.id;
            
            // Mapeo de IDs a páginas destino
            const paginasDestino = {
                'resumen': 'resumen.html',
                'pregunta': 'pregunta.html',
                'traduccion': 'traduccion.html',
                'generar-preguntas': 'generar-preguntas.html',
                'generar-imagenes': 'generar-imagenes.html'
            };
            
            if (paginasDestino[idFuncion]) {
                window.location.href = paginasDestino[idFuncion];
            } else {
                console.error('Página destino no definida para:', idFuncion);
                // Opcional: Mostrar mensaje al usuario
                alert('Función no disponible temporalmente');
            }
        });
    });

    // Efectos de hover para los cuadros de función (opcional)
    const cuadrosFuncion = document.querySelectorAll('.cuadro-funcion');
    
    cuadrosFuncion.forEach(cuadro => {
        cuadro.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
            this.style.boxShadow = '0 10px 20px rgba(0,0,0,0.2)';
        });
        
        cuadro.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)';
        });
    });

    // Cargar preferencias del usuario (ejemplo)
    function cargarPreferencias() {
        const tema = localStorage.getItem('tema') || 'claro';
        document.body.classList.toggle('tema-oscuro', tema === 'oscuro');
    }

    // Inicialización
    cargarPreferencias();
});