let losasData = JSON.parse(localStorage.getItem('losas_adicionales')) || [];

document.addEventListener('DOMContentLoaded', renderizarTabla);

function toggleLadrillo() {
    const tipo = document.getElementById('tipoLosa').value;
    document.getElementById('sectionLadrillo').style.display = (tipo === 'aligerada') ? 'block' : 'none';
}

function guardarLosa() {
    const editId = document.getElementById('edit-id').value;
    const tipo = document.getElementById('tipoLosa').value;
    const ubicacion = document.getElementById('ubicacionLosa').value;
    const largo = parseFloat(document.getElementById('lLargo').value);
    const ancho = parseFloat(document.getElementById('lAncho').value);
    const espesor = parseFloat(document.getElementById('lEspesor').value);

    if (!largo || !ancho || !espesor) return alert("Complete las dimensiones básicas");

    // Lógica de Cálculos
    const area = largo * ancho;
    const volTotal = area * espesor;
    let volConcreto = volTotal;
    let cantLadrillos = 0;

    if (tipo === 'aligerada') {
        const factorLadrillo = parseFloat(document.getElementById('lCantLadrillo').value) || 8.33;
        cantLadrillos = Math.ceil(area * factorLadrillo);
        // Descuento estándar: un ladrillo de 0.30x0.30x0.15 tiene ~0.0135m3
        const volUnitarioLadrillo = parseFloat(document.getElementById('lVolLadrillo').value) || 0.0135;
        volConcreto = volTotal - (cantLadrillos * volUnitarioLadrillo);
    }

    const nuevaLosa = {
        id: editId ? parseInt(editId) : Date.now(),
        tipo, ubicacion, largo, ancho, espesor,
        area, volConcreto, cantLadrillos
    };

    if (editId) {
        const index = losasData.findIndex(l => l.id === parseInt(editId));
        losasData[index] = nuevaLosa;
    } else {
        losasData.push(nuevaLosa);
    }

    localStorage.setItem('losas_adicionales', JSON.stringify(losasData));
    limpiarFormulario();
    renderizarTabla();
}

function renderizarTabla() {
    const tbody = document.querySelector('#tablaLosas tbody');
    tbody.innerHTML = "";

    // Uso de forEach para iterar registros
    losasData.forEach(l => {
        const row = document.createElement('tr');
        // Regla visual: Si es maciza y dentro, resaltar que descuenta área
        const descArea = (l.tipo === 'maciza' && l.ubicacion === 'dentro') ? 
            `<br><small style="color:red">(-${l.area.toFixed(2)} m² sector)</small>` : "";

        row.innerHTML = `
            <td><b>${l.tipo.toUpperCase()}</b><br>${l.ubicacion}</td>
            <td>${l.largo}x${l.ancho}x${l.espesor}m</td>
            <td>${l.area.toFixed(2)} m² ${descArea}</td>
            <td style="color:green; font-weight:bold;">+${l.volConcreto.toFixed(3)} m³</td>
            <td>${l.cantLadrillos} und</td>
            <td>
                <button onclick="editarLosa(${l.id})" class="btn-edit">✎</button>
                <button onclick="eliminarLosa(${l.id})" class="btn-del">✕</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function editarLosa(id) {
    const l = losasData.find(item => item.id === id);
    if (!l) return;

    document.getElementById('edit-id').value = l.id;
    document.getElementById('tipoLosa').value = l.tipo;
    document.getElementById('ubicacionLosa').value = l.ubicacion;
    document.getElementById('lLargo').value = l.largo;
    document.getElementById('lAncho').value = l.ancho;
    document.getElementById('lEspesor').value = l.espesor;

    document.getElementById('btn-save').innerText = "Actualizar Losa";
    document.getElementById('btn-save').style.background = "#e67e22";
    document.getElementById('btn-cancel').style.display = "inline-block";

    toggleLadrillo();
    window.scrollTo(0,0);
}

function limpiarFormulario() {
    document.getElementById('edit-id').value = "";
    document.getElementById('btn-save').innerText = "Agregar Losa";
    document.getElementById('btn-save').style.background = "#27ae60";
    document.getElementById('btn-cancel').style.display = "none";
    ['lLargo', 'lAncho'].forEach(id => document.getElementById(id).value = "");
}

function eliminarLosa(id) {
    losasData = losasData.filter(l => l.id !== id);
    localStorage.setItem('losas_adicionales', JSON.stringify(losasData));
    renderizarTabla();
}