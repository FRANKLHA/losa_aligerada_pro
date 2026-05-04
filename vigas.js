let vigaCount = 0;

// Cargar datos al iniciar
document.addEventListener('DOMContentLoaded', () => {
    const savedData = JSON.parse(localStorage.getItem('vigas_data')) || [];
    if (savedData.length > 0) {
        savedData.forEach(v => addVigaCard(v));
    } else {
        addVigaCard(); // Iniciar con una vacía
    }
});

document.getElementById('add-viga').addEventListener('click', () => addVigaCard());

function addVigaCard(data = null) {
    vigaCount++;
    const container = document.getElementById('lista-vigas');
    const card = document.createElement('div');
    card.className = 'card viga-item';
    card.id = `viga-${vigaCount}`;
    
    card.innerHTML = `
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 5px;">
            <span style="font-weight: bold; color: var(--accent);">Viga #${vigaCount}</span>
            <button onclick="document.getElementById('viga-${vigaCount}').remove()" style="color: var(--danger); border: none; background: none; font-weight: bold; cursor: pointer;">ELIMINAR</button>
        </div>
        
        <div class="field-group">
            <label>Cantidad de Vigas Iguales</label>
            <input type="number" class="cantidad" value="${data ? data.cant : 1}" inputmode="numeric">
        </div>

        <div class="field-group">
            <label>Eje / Tipo</label>
            <select class="eje">
                <option value="X" ${data && data.eje === 'X' ? 'selected' : ''}>Viga Eje X</option>
                <option value="Y" ${data && data.eje === 'Y' ? 'selected' : ''}>Viga Eje Y</option>
                <option value="Diagonal" ${data && data.eje === 'Diagonal' ? 'selected' : ''}>Viga Diagonal</option>
            </select>
        </div>

        <div class="btn-grid">
            <div class="field-group">
                <label>Ancho b (m)</label>
                <input type="number" class="ancho" step="0.01" inputmode="decimal" placeholder="0.25" value="${data ? data.b : ''}">
            </div>
            <div class="field-group">
                <label>Longitud L (m)</label>
                <input type="number" class="longitud" step="0.01" inputmode="decimal" placeholder="4.50" value="${data ? data.L : ''}">
            </div>
        </div>

        <div class="btn-grid">
            <div class="field-group">
                <label>Tipo Peralte</label>
                <select class="tipo-peralte">
                    <option value="total" ${data && data.tipoP === 'total' ? 'selected' : ''}>Total</option>
                    <option value="sobresalido" ${data && data.tipoP === 'sobresalido' ? 'selected' : ''}>Sobresalido</option>
                </select>
            </div>
            <div class="field-group">
                <label>Peralte h (m)</label>
                <input type="number" class="peralte" step="0.01" inputmode="decimal" placeholder="0.40" value="${data ? data.h_original : ''}">
            </div>
        </div>
    `;
    container.appendChild(card);
}

function guardarVigas() {
    const cards = document.querySelectorAll('.viga-item');
    const datosVigas = [];
    
    // Obtener espesor de losa para el cálculo de "cuelgue"
    const datosSector = JSON.parse(localStorage.getItem('sector_losa_data')) || { h: "0.15" };
    const hLosaCompeta = parseFloat(datosSector.h) + 0.05;

    cards.forEach(card => {
        const v = {
            cant: parseFloat(card.querySelector('.cantidad').value) || 1,
            eje: card.querySelector('.eje').value,
            b: parseFloat(card.querySelector('.ancho').value) || 0,
            L: parseFloat(card.querySelector('.longitud').value) || 0,
            tipoP: card.querySelector('.tipo-peralte').value,
            h_original: parseFloat(card.querySelector('.peralte').value) || 0
        };

        // Lógica de concreto neto
        let hEfectiva = (v.tipoP === 'total') ? (v.h_original - hLosaCompeta) : v.h_original;
        if(hEfectiva < 0) hEfectiva = 0;

        v.volNetoTotal = v.cant * (v.b * hEfectiva * v.L);
        datosVigas.push(v);
    });

    localStorage.setItem('vigas_data', JSON.stringify(datosVigas));
    alert("Datos de vigas guardados correctamente.");
    window.location.href = 'reporte.html';
}