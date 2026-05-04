document.addEventListener('DOMContentLoaded', () => {
  // 1. Poner fecha actual
  document.getElementById('fecha-reporte').innerText = "Fecha: " + new Date().toLocaleDateString();

  // 2. Ejecutar renders
  const volLosa = renderLosa();
  const volVigas = renderVigas();

  // 3. Calcular Gran Total
  const totalGeneral = volLosa + volVigas;
  document.getElementById('gran-total').innerText = totalGeneral.toFixed(3);
});

function renderLosa() {
  const data = JSON.parse(localStorage.getItem('sector_losa_data'));
  const vigas = JSON.parse(localStorage.getItem('vigas_data')) || [];
  const container = document.getElementById('losa-data-card');
  
  if (!data) return 0;

  const largo = parseFloat(data.largo) || 0;
  const ancho = parseFloat(data.ancho) || 0;
  const areaBruta = largo * ancho;
  const espesor = parseFloat(data.espesorLosa) || 0.20;
  const hLadrillo = parseFloat(data.hRelleno) || 0.15;

  // 1. Cálculo de Área ocupada por vigas
  let areaVigas = 0;
  vigas.forEach(v => {
      areaVigas += (v.b * v.L * v.cant);
  });

  const areaNetaLosa = areaBruta - areaVigas;
  
  // 2. CANTIDAD DE LADRILLOS: Redondeo al entero más cercano (Math.round)
  // Usamos el factor que ya definiste (ej. 8.0 o el que prefieras)
  const factorLadrillos = 8.0; 
  const cantLadrillos = Math.round(areaNetaLosa * factorLadrillos); // <--- CAMBIO AQUÍ
  
  // 3. Volúmenes
  const volBrutoNeta = areaNetaLosa * espesor;
  const volLadrillos = cantLadrillos * (0.09 * hLadrillo);
  const volConcretoLosa = volBrutoNeta - volLadrillos;

  container.innerHTML = `
      <div class="stat-box full-width">
          <span class="stat-label">Memoria de Cálculo: Losa Aligerada</span>
          <div class="calc-details">
              <p><strong>Área Real Losa (Paños):</strong> ${areaNetaLosa.toFixed(2)} m²</p>
              <p><strong>Cant. Ladrillos:</strong> ${areaNetaLosa.toFixed(2)}m² x ${factorLadrillos} = <strong>${cantLadrillos} und.</strong></p>
              <p><strong>Descuento Ladrillos:</strong> ${cantLadrillos} und x (0.30x0.30x${hLadrillo.toFixed(2)}) = -${volLadrillos.toFixed(3)} m³</p>
              <hr>
              <p class="final-calc"><strong>Concreto Neto Losa:</strong> ${volBrutoNeta.toFixed(3)} - ${volLadrillos.toFixed(3)} = <span>${volConcretoLosa.toFixed(3)} m³</span></p>
          </div>
      </div>
  `;

  return volConcretoLosa;
}function renderLosa() {
  const data = JSON.parse(localStorage.getItem('sector_losa_data'));
  const vigas = JSON.parse(localStorage.getItem('vigas_data')) || [];
  const container = document.getElementById('losa-data-card');
  
  if (!data) return 0;

  const largo = parseFloat(data.largo) || 0;
  const ancho = parseFloat(data.ancho) || 0;
  const areaBruta = largo * ancho;
  const espesor = parseFloat(data.espesorLosa) || 0.20;
  const hLadrillo = parseFloat(data.hRelleno) || 0.15;

  // 1. Cálculo de Área ocupada por vigas
  let areaVigas = 0;
  vigas.forEach(v => {
      areaVigas += (v.b * v.L * v.cant);
  });

  const areaNetaLosa = areaBruta - areaVigas;
  
  // 2. CANTIDAD DE LADRILLOS: Redondeo al entero más cercano (Math.round)
  // Usamos el factor que ya definiste (ej. 8.0 o el que prefieras)
  const factorLadrillos = 8.0; 
  const cantLadrillos = Math.round(areaNetaLosa * factorLadrillos); // <--- CAMBIO AQUÍ
  
  // 3. Volúmenes
  const volBrutoNeta = areaNetaLosa * espesor;
  const volLadrillos = cantLadrillos * (0.09 * hLadrillo);
  const volConcretoLosa = volBrutoNeta - volLadrillos;

  container.innerHTML = `
      <div class="stat-box full-width">
          <span class="stat-label">Memoria de Cálculo: Losa Aligerada</span>
          <div class="calc-details">
              <p><strong>Área Real Losa (Paños):</strong> ${areaNetaLosa.toFixed(2)} m²</p>
              <p><strong>Cant. Ladrillos:</strong> ${areaNetaLosa.toFixed(2)}m² x ${factorLadrillos} = <strong>${cantLadrillos} und.</strong></p>
              <p><strong>Descuento Ladrillos:</strong> ${cantLadrillos} und x (0.30x0.30x${hLadrillo.toFixed(2)}) = -${volLadrillos.toFixed(3)} m³</p>
              <hr>
              <p class="final-calc"><strong>Concreto Neto Losa:</strong> ${volBrutoNeta.toFixed(3)} - ${volLadrillos.toFixed(3)} = <span>${volConcretoLosa.toFixed(3)} m³</span></p>
          </div>
      </div>
  `;

  return volConcretoLosa;
}
function renderVigas() {
  const vigas = JSON.parse(localStorage.getItem('vigas_data')) || [];
  const tbody = document.querySelector('#tabla-vigas-reporte tbody');
  let totalV = 0;

  if (vigas.length === 0) {
      tbody.innerHTML = "<tr><td colspan='6' style='text-align:center;'>No se registraron vigas peraltadas.</td></tr>";
      return 0;
  }

  vigas.forEach(v => {
      const row = document.createElement('tr');
      row.innerHTML = `
          <td>${v.cant}</td>
          <td>Eje ${v.eje}</td>
          <td>${v.b.toFixed(2)}x${v.h_original.toFixed(2)}</td>
          <td>${v.L.toFixed(2)}m</td>
          <td>${v.tipoP === 'total' ? 'Total' : 'Sobres.'}</td>
          <td>${v.volNetoTotal.toFixed(3)}</td>
      `;
      tbody.appendChild(row);
      totalV += v.volNetoTotal;
  });

  // Fila de Subtotal
  const subRow = document.createElement('tr');
  subRow.className = 'total-row';
  subRow.innerHTML = `
      <td colspan="5" style="text-align:right;">SUBTOTAL VIGAS:</td>
      <td>${totalV.toFixed(3)} m³</td>
  `;
  tbody.appendChild(subRow);

  return totalV;
}