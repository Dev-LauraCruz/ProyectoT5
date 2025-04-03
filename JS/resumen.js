//Funcion para limpiar
document.addEventListener('DOMContentLoaded', () => {
    const btnLimpiar = document.getElementById('btn-limpiar');
    btnLimpiar.addEventListener('click', () => {
        document.getElementById('texto-original').value = '';
        document.getElementById('texto-resumido').innerHTML = '<p class="placeholder">Aquí aparecerá el texto resumido...</p>';
    });
});