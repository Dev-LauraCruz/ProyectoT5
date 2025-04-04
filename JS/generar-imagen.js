document.addEventListener('DOMContentLoaded', function() {
    const btnLimpiar = document.getElementById('btn-limpiar');
    
    btnLimpiar.addEventListener('click', function() {
        // Limpiar campo de descripción
        document.getElementById('texto-descripcion').value = '';
        
        // Restablecer área de imagen
        const areaImagen = document.getElementById('imagen-generada');
        areaImagen.innerHTML = `
            <div class="placeholder">
                <i class="fas fa-image"></i>
                <p>La imagen aparecerá aquí</p>
            </div>
        `;
    });
});