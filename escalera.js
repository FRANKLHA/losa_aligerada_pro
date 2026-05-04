let escalerasRegistradas = JSON.parse(localStorage.getItem('escaleras_data')) || [];

document.addEventListener('DOMContentLoaded', () => {
    if (escalerasRegistradas.length === 0) crearNuevaEscalera();
    renderizarTabla();
});

function crearNuevaEscalera() {
    const id = Date.now();
    const html = `
        <div class="escalera-card" id="esc-${id}">
            <div class="input-row">
                <input type="text" class="esc-nombre" placeholder="Nombre (ej. Escalera Principal)">
                <button onclick="eliminarCard(${id})" class="btn-del-mini">✕</button>
            </div>
            <div class="input-group">
                <div class="field"><label>Ancho (m)</label><input type="number" class="esc-ancho" value="1.00" step="0.01"></div>
                <div class="field"><label>Garganta (m)</label><input type="number" class="esc-garganta" value="0.15" step="0.01"></div>
            </div>
            <div class="tramos-lista" id="tramos-container-${id}"></div>
            <button onclick="agregarTramoUI(${id})" class="btn-add-mini">+ Agregar Tramo</button>
        </div>
    `;
    document.getElementById('escaleras-dinamicas').insertAdjacentHTML('beforeend', html);
    agregarTramoUI(id);
}

function agregarTramoUI(idEsc) {
    const container = document.getElementById(`tramos-container-${idEsc}`);
    const tramoHtml = `
        <div class="tramo-row">
            <input type="number" class="t-pasos" placeholder="N° Pasos">
            <input type="number" class="t-huella" placeholder="Paso (m)" step="0.01">
            <input type="number" class="t-contra" placeholder="C.Paso (m)" step="0.01">
            <input type="number" class="t-descanso" placeholder="Descanso (m)" step="0.01">
        </div>
    `;
    container.insertAdjacentHTML('beforeend', tramoHtml);
}

function guardarTodoEnLocalStorage() {
    const cards = document.querySelectorAll('.escalera-card');
    let datosTemporales = [];

    cards.forEach(card => {
        const nombre = card.querySelector('.esc-nombre').value || "Escalera";
        const ancho = parseFloat(card.querySelector('.esc-ancho').value) || 0;
        const garganta = parseFloat(card.querySelector('.esc-garganta').value) || 0;
        
        let volEscalera = 0;
        let longTotal = 0;
        const tramos = card.querySelectorAll('.tramo-row');

        tramos.forEach(t => {
            const pasos = parseInt(t.querySelector('.t-pasos').value) || 0;
            const huella = parseFloat(t.querySelector('.t-huella').value) || 0;
            const cp = parseFloat(t.querySelector('.t-contra').value) || 0;
            const descanso = parseFloat(t.querySelector('.t-descanso').value) || 0;

            const longTramo = pasos * huella;
            const hipo = Math.sqrt(Math.pow(huella, 2) + Math.pow(cp, 2));
            
            // Volumen = (Cuerpo inclinado) + (Triángulos de pasos) + (Descanso)
            const vTramo = (hipo * pasos * ancho * garganta) + (pasos * (huella * cp / 2) * ancho);
            const vDescanso = descanso * ancho * garganta;

            volEscalera += (vTramo + vDescanso);
            longTotal += (longTramo + descanso);
        });

        datosTemporales.push({ nombre, longTotal, volEscalera });
    });

    localStorage.setItem('escaleras_data', JSON.stringify(datosTemporales));
    renderizarTabla();
    alert("Datos guardados. Revise el Reporte.");
}

function renderizarTabla() {
    const datos = JSON.parse(localStorage.getItem('escaleras_data')) || [];
    const tbody = document.querySelector('#tablaEscaleras tbody');
    tbody.innerHTML = datos.map((e, i) => `
        <tr>
            <td>${e.nombre}</td>
            <td>Calculado</td>
            <td>${e.longTotal.toFixed(2)} m</td>
            <td style="font-weight:bold; color: #27ae60;">${e.volEscalera.toFixed(3)} m³</td>
            <td><button onclick="eliminarRegistro(${i})" class="btn-del">Eliminar</button></td>
        </tr>
    `).join('');
}

function eliminarRegistro(index) {
    escalerasRegistradas.splice(index, 1);
    localStorage.setItem('escaleras_data', JSON.stringify(escalerasRegistradas));
    renderizarTabla();
}