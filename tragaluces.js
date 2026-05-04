let vigasTemporales = [];
let vigaEditandoIndex = null; 

document.addEventListener('DOMContentLoaded', () => {
    restaurarBorrador();
    renderizarTabla();
});

// --- PERSISTENCIA ---
function guardarBorrador() {
    const borrador = {
        tipo: document.getElementById('tipoTragaluz').value,
        largo: document.getElementById('tLargo').value,
        ancho: document.getElementById('tAncho').value,
        tieneVigas: document.getElementById('tieneVigasNormal').checked,
        vigasTemporales: vigasTemporales
    };
    localStorage.setItem('tragaluz_borrador', JSON.stringify(borrador));
}

function restaurarBorrador() {
    const data = JSON.parse(localStorage.getItem('tragaluz_borrador'));
    if (!data) return;
    document.getElementById('tipoTragaluz').value = data.tipo;
    document.getElementById('tLargo').value = data.largo;
    document.getElementById('tAncho').value = data.ancho;
    document.getElementById('tieneVigasNormal').checked = data.tieneVigas;
    vigasTemporales = data.vigasTemporales || [];
    gestionarUI();
    actualizarListaVigasUI();
}

// --- INTERFAZ DINÁMICA ---
function gestionarUI() {
    const tipo = document.getElementById('tipoTragaluz').value;
    const checkVigas = document.getElementById('tieneVigasNormal').checked; 
    const divVigas = document.getElementById('contenedorVigas');

    // Si es patio, obligamos a que las vigas se muestren
    if (tipo === 'patio') {
        document.getElementById('tieneVigasNormal').checked = true;
        divVigas.style.display = 'block';
    } else {
        divVigas.style.display = checkVigas ? 'block' : 'none';
    }
}

// --- GESTIÓN DE VIGAS (EL CUADRO AZUL) ---
function agregarVigaFila() {
    const cant = parseInt(document.getElementById('vCant').value);
    const b = parseFloat(document.getElementById('vB').value);
    const h = parseFloat(document.getElementById('vH').value);
    const L = parseFloat(document.getElementById('vL').value);

    if (cant && b && h && L) {
        if (vigaEditandoIndex !== null) {
            // ACTUALIZA VIGA EXISTENTE
            vigasTemporales[vigaEditandoIndex] = { cant, b, h, L };
            vigaEditandoIndex = null;
            document.querySelector('.btn-mini-add').innerText = "Añadir";
        } else {
            // AGREGA NUEVA VIGA
            vigasTemporales.push({ cant, b, h, L });
        }
        
        actualizarListaVigasUI();
        guardarBorrador();
        ['vCant', 'vB', 'vH', 'vL'].forEach(id => document.getElementById(id).value = "");
    } else {
        alert("Faltan datos en la viga");
    }
}

function editarVigaTemporal(index) {
    vigaEditandoIndex = index;
    const v = vigasTemporales[index];
    document.getElementById('vCant').value = v.cant;
    document.getElementById('vB').value = v.b;
    document.getElementById('vH').value = v.h;
    document.getElementById('vL').value = v.L;
    document.querySelector('.btn-mini-add').innerText = "Actualizar Viga";
}

function actualizarListaVigasUI() {
    const lista = document.getElementById('listaVigasTemp');
    lista.innerHTML = vigasTemporales.map((v, i) => 
        `<li style="display:flex; justify-content:space-between; align-items:center; background:white; padding:8px; border:1px solid #ddd; margin-bottom:4px; border-radius:4px;">
            <span>${v.cant}u (${v.b}x${v.h}x${v.L})</span>
            <div>
                <button onclick="editarVigaTemporal(${i})" style="background:#f39c12; color:white; border:none; padding:4px 8px; border-radius:3px; cursor:pointer;">✎</button>
                <button onclick="vigasTemporales.splice(${i},1); actualizarListaVigasUI(); guardarBorrador();" style="background:#e74c3c; color:white; border:none; padding:4px 8px; border-radius:3px; cursor:pointer; margin-left:4px;">✕</button>
            </div>
        </li>`
    ).join('');
}

// --- GUARDADO FINAL DEL TRAGALUZ ---
function guardarTragaluzFinal() {
    const editId = document.getElementById('edit-id').value;
    const tipo = document.getElementById('tipoTragaluz').value;
    const largo = parseFloat(document.getElementById('tLargo').value);
    const ancho = parseFloat(document.getElementById('tAncho').value);

    if (!largo || !ancho) return alert("Dimensiones inválidas");

    const registro = {
        id: editId ? parseInt(editId) : Date.now(),
        tipo, largo, ancho, area: largo * ancho,
        vigas: [...vigasTemporales]
    };

    let datos = JSON.parse(localStorage.getItem('tragaluces_data')) || [];

    if (editId) {
        // BUSCA EL ÍNDICE DEL QUE ESTAMOS EDITANDO Y LO REEMPLAZA COMPLETAMENTE
        const index = datos.findIndex(item => item.id === parseInt(editId));
        if (index !== -1) {
            datos[index] = registro;
        }
    } else {
        datos.push(registro);
    }

    localStorage.setItem('tragaluces_data', JSON.stringify(datos));
    
    // LIMPIEZA TOTAL
    cancelarEdicion();
    renderizarTabla();
}

function editarTragaluz(id) {
    const datos = JSON.parse(localStorage.getItem('tragaluces_data')) || [];
    const t = datos.find(item => item.id === id);
    if (!t) return;

    // Cargamos todo al formulario
    document.getElementById('edit-id').value = t.id;
    document.getElementById('tipoTragaluz').value = t.tipo;
    document.getElementById('tLargo').value = t.largo;
    document.getElementById('tAncho').value = t.ancho;
    document.getElementById('tieneVigasNormal').checked = (t.vigas.length > 0);
    vigasTemporales = [...t.vigas];

    // Cambiamos UI a modo edición
    document.getElementById('btn-save-main').innerText = "Actualizar Cambios";
    document.getElementById('btn-save-main').style.background = "#e67e22";
    document.getElementById('btn-cancel-edit').style.display = "inline-block";

    gestionarUI();
    actualizarListaVigasUI();
    window.scrollTo(0, 0);
}

function cancelarEdicion() {
    document.getElementById('edit-id').value = "";
    document.getElementById('btn-save-main').innerText = "Agregar al Metrado";
    document.getElementById('btn-save-main').style.background = "#27ae60";
    document.getElementById('btn-cancel-edit').style.display = "none";
    
    ['tLargo', 'tAncho', 'vCant', 'vB', 'vH', 'vL'].forEach(id => document.getElementById(id).value = "");
    vigasTemporales = [];
    vigaEditandoIndex = null;
    localStorage.removeItem('tragaluz_borrador');
    gestionarUI();
    actualizarListaVigasUI();
}

function renderizarTabla() {
    const datos = JSON.parse(localStorage.getItem('tragaluces_data')) || [];
    const tbody = document.querySelector('#tablaTragaluces tbody');
    tbody.innerHTML = "";

    datos.forEach(t => {
        const detalle = t.vigas.map(v => `${v.cant}u(${v.b}x${v.h}x${v.L})`).join(' | ') || '-';
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${t.tipo.toUpperCase()}</td>
            <td>${t.largo}x${t.ancho}m</td>
            <td style="color: #c0392b; font-weight: bold;">-${t.area.toFixed(2)} m²</td>
            <td style="font-size: 0.8rem; color: #666;">${detalle}</td>
            <td>
                <button onclick="editarTragaluz(${t.id})" style="background:#3498db; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer;">Editar</button>
                <button onclick="eliminarTragaluz(${t.id})" style="background:#e74c3c; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer;">Eliminar</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function eliminarTragaluz(id) {
    let datos = JSON.parse(localStorage.getItem('tragaluces_data')) || [];
    datos = datos.filter(t => t.id !== id);
    localStorage.setItem('tragaluces_data', JSON.stringify(datos));
    renderizarTabla();
}