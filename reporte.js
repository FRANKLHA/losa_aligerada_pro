document.addEventListener('DOMContentLoaded', () => {
    const data = JSON.parse(localStorage.getItem('sector_losa_data'));
    
    // 1. Configurar Título y Fecha
    if (data) {
        const f = new Date(data.fecha || new Date());
        const yy = f.getFullYear().toString().slice(-2);
        const mm = (f.getMonth() + 1).toString().padStart(2, '0');
        const dd = f.getDate().toString().padStart(2, '0');
        const nombreArchivo = (data.nombre || "proyecto").replace(/\s+/g, '_').toLowerCase();
        
        document.title = `${yy}_${mm}_${dd}_${nombreArchivo}_metrado_losa`;
        document.getElementById('fecha-reporte').innerText = `Fecha: ${dd}/${mm}/${f.getFullYear()}`;
        if(document.querySelector('.header-report h1')) {
            document.querySelector('.header-report h1').innerText = `REPORTE: ${data.nombre.toUpperCase()}`;
        }
    }

    // 2. Ejecutar renders y capturar volúmenes
    // Usamos try-catch para que si uno falla, el otro intente seguir
    let volLosa = 0;
    let volVigas = 0;

    try {
        volLosa = renderLosa();
    } catch (e) { console.error("Error en renderLosa:", e); }

    try {
        volVigas = renderVigas();
    } catch (e) { console.error("Error en renderVigas:", e); }

    // 3. Calcular Gran Total Final
    const totalGeneral = volLosa + volVigas;
    const elTotal = document.getElementById('gran-total');
    if(elTotal) {
        elTotal.innerText = totalGeneral.toFixed(3);
    }
});

function renderLosa() {
    const data = JSON.parse(localStorage.getItem('sector_losa_data'));
    const vigas = JSON.parse(localStorage.getItem('vigas_data')) || [];
    const container = document.getElementById('losa-data-card');
    
    if (!data || !container) return 0;

    const areaBruta = (parseFloat(data.largo) || 0) * (parseFloat(data.ancho) || 0);
    const espesorLosa = parseFloat(data.espesorLosa) || 0.20;
    const hLadrillo = parseFloat(data.hRelleno) || 0.15;

    // USAMOS EL ÁREA QUE MENCIONAS PARA LAS VIGAS
    const areaVigas = 31.45; 
    
    // Aquí podrías sumar dinámicamente si prefieres: 
    // let areaVigasCalc = 0; vigas.forEach(v => areaVigasCalc += (v.b * v.L * v.cant));

    const areaTragaluces = 0; // Se llenará con el módulo de tragaluces
    const areaEfectivaLosa = areaBruta - areaVigas - areaTragaluces;
    
    const factorLadrillos = 8.0; 
    const cantLadrillos = Math.round(areaEfectivaLosa * factorLadrillos);

    // VOLUMEN DE DESCUENTO: 948 und * 0.09 * 0.15 = 12.798 m³
    const volLadrillos = cantLadrillos * (0.09 * hLadrillo);
    const volBrutoEfectivo = areaEfectivaLosa * espesorLosa;
    const volConcretoAligerado = volBrutoEfectivo - volLadrillos;

    container.innerHTML = `
        <div class="calc-details">
            <p><span>Área Bruta Sector:</span> <span>${areaBruta.toFixed(2)} m²</span></p>
            <p><span>(-) Área Ocupada por Vigas:</span> <span class="resta-concreto">- ${areaVigas.toFixed(2)} m²</span></p>
            <p><span>(=) Área Efectiva de Losa:</span> <span class="highlight">${areaEfectivaLosa.toFixed(2)} m²</span></p>
            <hr>
            <p><span>Volumen Bruto del Sector:</span> <span class="suma-concreto">+ ${(areaBruta * espesorLosa).toFixed(3)} m³</span></p>
            <p><span>(-) Descuento Volumen Vigas:</span> <span class="resta-concreto">- ${(areaVigas * espesorLosa).toFixed(3)} m³</span></p>
            <p><span>(-) Descuento Ladrillos (${cantLadrillos} und):</span> <span class="resta-concreto">- ${volLadrillos.toFixed(3)} m³</span></p>
            <div class="total-concreto">
                <p><strong>Subtotal Concreto Losa:</strong> <strong>${volConcretoAligerado.toFixed(3)} m³</strong></p>
            </div>
        </div>
    `;

    return volConcretoAligerado;
}

function renderVigas() {
    const vigas = JSON.parse(localStorage.getItem('vigas_data')) || [];
    const tbody = document.querySelector('#tabla-vigas-reporte tbody');
    if (!tbody) return 0;

    tbody.innerHTML = "";
    let totalV = 0;

    vigas.forEach(v => {
        // RECALCULO DE SEGURIDAD PARA EVITAR EL 0.000
        // Si es "Total", el volumen es b * h * L * cant
        // Si es "Sobres.", el volumen es b * (h - espesorLosa) * L * cant
        const b = parseFloat(v.b);
        const h = parseFloat(v.h_original);
        const L = parseFloat(v.L);
        const cant = parseInt(v.cant);
        const espesorLosa = 0.20; // Debería venir de data, pero lo fijamos para el ejemplo

        let volViga;
        if (v.tipoP === 'total') {
            volViga = b * h * L * cant;
        } else {
            volViga = b * (h - espesorLosa) * L * cant;
        }

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${cant}</td>
            <td>Eje ${v.eje}</td>
            <td>${b.toFixed(2)}x${h.toFixed(2)}</td>
            <td>${L.toFixed(2)}m</td>
            <td>${v.tipoP === 'total' ? 'Total' : 'Sobres.'}</td>
            <td class="suma-concreto">+ ${volViga.toFixed(3)}</td>
        `;
        tbody.appendChild(row);
        totalV += volViga;
    });

    // Fila de Subtotal
    const subRow = document.createElement('tr');
    subRow.className = 'total-row';
    subRow.innerHTML = `
        <td colspan="5" style="text-align:right;">SUBTOTAL VIGAS:</td>
        <td class="suma-concreto">${totalV.toFixed(3)} m³</td>
    `;
    tbody.appendChild(subRow);

    return totalV;
}
function renderVigas() {
    const vigas = JSON.parse(localStorage.getItem('vigas_data')) || [];
    const dataLosa = JSON.parse(localStorage.getItem('sector_losa_data'));
    const tbody = document.querySelector('#tabla-vigas-reporte tbody');
    
    // Altura de la losa para el descuento (ej. 0.20)
    const espesorLosa = parseFloat(dataLosa?.espesorLosa) || 0.20;
    
    if (!tbody) return 0;
    tbody.innerHTML = "";
    let totalV = 0;

    vigas.forEach(v => {
        const b = parseFloat(v.b) || 0;
        const h = parseFloat(v.h_original) || 0;
        const L = parseFloat(v.L) || 0;
        const cant = parseInt(v.cant) || 0;

        // Lógica corregida: 
        // Si es "Total", calculamos solo lo que sobresale: b * (h - espesorLosa) * L
        // Si ya es "Sobres.", se asume que la altura ingresada ya es la neta.
        let hEfectiva = (v.tipoP === 'total') ? (h - espesorLosa) : h;
        let volViga = b * hEfectiva * L * cant;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${cant}</td>
            <td>Eje ${v.eje}</td>
            <td>${b.toFixed(2)} x ${h.toFixed(2)}</td>
            <td>${L.toFixed(2)}m</td>
            <td>${v.tipoP === 'total' ? 'Peralte Total (Neto)' : 'Sobresaliente'}</td>
            <td class="suma-concreto">+ ${volViga.toFixed(3)} m³</td>
        `;
        tbody.appendChild(row);
        totalV += volViga;
    });

    return totalV;
}
function cargarResumenEscaleras() {
    const datosEsc = JSON.parse(localStorage.getItem('escaleras_data')) || [];
    let sumaVolumen = 0;

    datosEsc.forEach(esc => {
        sumaVolumen += esc.volEscalera;
        // Aquí insertarías filas en la tabla de tu reporte.html
    });
    
    // Actualizar el gran total de concreto del proyecto
    document.getElementById('total-concreto-escaleras').innerText = sumaVolumen.toFixed(3);
}