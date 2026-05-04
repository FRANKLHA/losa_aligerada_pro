
// Persistencia de Datos (Auto-save)
document.addEventListener('DOMContentLoaded', () => {
    // 1. Intentar cargar datos previos al abrir la pestaña Inicio
    cargarDatosPrevios();

    // 2. Escuchar cambios en todos los inputs para guardar automáticamente
    const inputs = document.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('input', guardarProgreso);
    });
});

function guardarProgreso() {
    const data = {
        nombre: document.getElementById('nombreProyecto').value,
        fecha: document.getElementById('fechaMetrado').value,
        tipo: document.getElementById('tipoRelleno').value,
        hRelleno: document.getElementById('alturaRelleno').value,
        espesorLosa: document.getElementById('espesorLosa').value,
        largo: document.getElementById('largo').value,
        ancho: document.getElementById('ancho').value
    };

    localStorage.setItem('sector_losa_data', JSON.stringify(data));
    console.log("Progreso guardado automáticamente...");
}

function cargarDatosPrevios() {
    const datosGuardados = localStorage.getItem('sector_losa_data');
    
    if (datosGuardados) {
        const data = JSON.parse(datosGuardados);
        
        // Llenar cada campo si existe el dato
        if (data.nombre) document.getElementById('nombreProyecto').value = data.nombre;
        if (data.fecha) document.getElementById('fechaMetrado').value = data.fecha;
        if (data.tipo) document.getElementById('tipoRelleno').value = data.tipo;
        if (data.hRelleno) document.getElementById('alturaRelleno').value = data.hRelleno;
        if (data.espesorLosa) document.getElementById('espesorLosa').value = data.espesorLosa;
        if (data.largo) document.getElementById('largo').value = data.largo;
        if (data.ancho) document.getElementById('ancho').value = data.ancho;
        
        console.log("Datos restaurados del último reporte.");
    }
}

function irAReporte() {
    // Antes de irse, aseguramos que todo esté guardado
    guardarProgreso();
    window.location.href = 'reporte.html';
}
function prepararIA() {
    const tipo = document.getElementById('tipoRelleno');
    const tipoLabel = tipo.options[tipo.selectedIndex].text;
    const h = document.getElementById('alturaRelleno').value;
    const largo = document.getElementById('largo').value;
    const ancho = document.getElementById('ancho').value;

    if (!largo || !ancho) {
        alert("⚠️ Ingrese dimensiones para generar el prompt.");
        return;
    }

    const area = (parseFloat(largo) * parseFloat(ancho)).toFixed(2);
    
    // Determinamos ratio para el cálculo de unidades
    let ratio = tipo.value.includes('8') ? 8 : 2.5;
    let unidades = Math.ceil(area * ratio);

    const promptText = `
[INFORME DE METRADO PARA IA GEMINI]
Elemento: Losa Aligerada (Sector Único)
Dimensiones: ${largo}m x ${ancho}m
Área Calculada: ${area} m²
Tipo de Relleno: ${tipoLabel}
Altura de Ladrillo/Casetón: ${h} m
Cantidad Estimada de Unidades: ${unidades} und.

Solicitud: Actúa como Ingeniero Senior. Calcula el volumen de concreto neto (suponiendo losa de compresión de 0.05m y viguetas estándar de 0.10m). Provee el desglose de materiales y recomendaciones de vaciado para este sector.
    `.trim();

    localStorage.setItem('prompt_gemini', promptText);
    window.location.href = 'IA_Gemini.html';
}
