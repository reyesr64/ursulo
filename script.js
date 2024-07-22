document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('reciboForm');
    const limpiarBtn = document.getElementById('limpiarBtn');
    const nombreSelect = document.getElementById('nombre');
    const casaSelect = document.getElementById('casa');

    // Cargar datos de los archivos
    fetch('vecinos.txt')
        .then(response => response.text())
        .then(data => {
            data.split('\n').forEach(nombre => {
                if (nombre.trim()) {
                    const option = document.createElement('option');
                    option.value = nombre.trim();
                    option.textContent = nombre.trim();
                    nombreSelect.appendChild(option);
                }
            });
        });

    fetch('casas.txt')
        .then(response => response.text())
        .then(data => {
            data.split('\n').forEach(casa => {
                if (casa.trim()) {
                    const option = document.createElement('option');
                    option.value = casa.trim();
                    option.textContent = casa.trim();
                    casaSelect.appendChild(option);
                }
            });
        });

    // Función para limpiar el formulario
    limpiarBtn.addEventListener('click', function() {
        form.reset();
    });

    // Función para generar el recibo
    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const fecha = new Date().toISOString().replace(/[-:]/g, '').split('.')[0];
        const fechaNip = fecha.slice(0,6);
        const folio = CryptoJS.SHA1(fecha).toString();
        const nips = CryptoJS.SHA1(fechaNip).toString().slice(-4);

        console.log(fecha.slice(0,6));
        console.log(nips);

        if (document.getElementById('nip').value !== nips) {
            alert('Error en el NIP');
            return;
        }

        generarPDF(folio, fecha);
    });

    function generarPDF(folio, fecha) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        const anio = fecha.slice(0, 4);
        const mes = fecha.slice(4, 6);
        const dia = fecha.slice(6, 8);
        const horas = fecha.slice(9, 11);
        const minutos = fecha.slice(11, 13);

        const fechaFormateada = `${anio}/${mes}/${dia} ${horas}:${minutos}`;
        const fechaFormateada2 = `${anio}/${mes}/${dia}`;


        doc.setFontSize(16);
        doc.text('RECIBO', 105, 20, null, null, 'center');

        doc.setFontSize(12);
        let y = 40;
        [
            ['Folio:', folio.slice(0, 12)],
            ['Fecha:', fechaFormateada2],
            ['Nombre:', nombreSelect.value],
            ['Casa:', casaSelect.value],
            ['Importe: $', document.getElementById('importe').value],
            ['Mes:', document.getElementById('mes').value],
            ['Notas:', document.getElementById('notas').value]
        ].forEach(([label, value]) => {
            doc.text(`${label} ${value}`, 20, y);
            y += 10;
        });

        // Generar código QR
        const qr = new QRCode(document.createElement("div"), {
            text: `${fechaFormateada}\n ${folio}\n ${document.getElementById('importe').value}`,
            width: 128,
            height: 128
        });

        const qrImage = qr._oDrawing._elCanvas.toDataURL("image/jpeg");
        doc.addImage(qrImage, 'JPEG', 20, y, 50, 50);

        const folio2 = folio.slice(0,12);

        doc.save(`${folio2}.pdf`);
    }
});