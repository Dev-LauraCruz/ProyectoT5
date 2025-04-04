document.addEventListener('DOMContentLoaded', function() {
    const btnLimpiar = document.getElementById('btn-limpiar');
    const textoOriginal = document.getElementById('texto-original');
    const textoTraducido = document.getElementById('texto-traducido');

    btnLimpiar.addEventListener('click', function() {
        // Limpiar campos
        textoOriginal.value = '';
        textoTraducido.innerHTML = '<p class="placeholder">La traducción aparecerá aquí...</p>';
        
        // Deshabilitar botón de traducir
        document.getElementById('btn-traducir').disabled = true;
        
        // Feedback visual
        btnLimpiar.innerHTML = '<i class="fas fa-check"></i> Limpiado!';
        setTimeout(() => {
            btnLimpiar.innerHTML = '<i class="fas fa-eraser"></i> Limpiar Todo';
        }, 1500);
    });
    
    // Validación básica para habilitar el botón Traducir
    textoOriginal.addEventListener('input', function() {
        document.getElementById('btn-traducir').disabled = !this.value.trim();
    });
});