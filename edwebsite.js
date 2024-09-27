document.addEventListener('DOMContentLoaded', () => {
    // Variables globales
    const paso1 = document.getElementById('paso-1');
    const paso2 = document.getElementById('paso-2');
    const paso3 = document.getElementById('paso-3');

    const btnSiguiente1 = document.getElementById('btn-siguiente-1');
    const btnSiguiente2 = document.getElementById('btn-siguiente-2');
    const btnAtras2 = document.getElementById('btn-atras-2');
    const btnAtras3 = document.getElementById('btn-atras-3');
    const btnReservarFinal = document.getElementById('btn-reservar-final');

    const confirmNombreDueno = document.getElementById('confirm-nombre-dueno');
    const confirmCorreoDueno = document.getElementById('confirm-correo-dueno');
    const confirmNombreMascota = document.getElementById('confirm-nombre-mascota');
    const confirmDias = document.getElementById('confirm-dias');
    const confirmCostoTotal = document.getElementById('confirm-costo-total');

    const calendarioGrid = document.getElementById('calendario-grid');
    const costoTotal = document.getElementById('costo-total');

    let diasSeleccionados = [];
    const costoPorDia = 10;

    // Mostrar el primer paso
    mostrarPaso(1);

    // Crear el calendario
    renderizarCalendario();

    // Eventos de los botones
    btnSiguiente1.addEventListener('click', pasarAlSegundoPaso);
    btnSiguiente2.addEventListener('click', pasarAlTercerPaso);
    btnReservarFinal.addEventListener('click', hacerReservaFinal);
    btnAtras2.addEventListener('click', () => mostrarPaso(1));
    btnAtras3.addEventListener('click', () => mostrarPaso(2));

    // Funciones de navegación entre pasos
    function mostrarPaso(paso) {
        paso1.classList.remove('active');
        paso2.classList.remove('active');
        paso3.classList.remove('active');

        if (paso === 1) {
            paso1.classList.add('active');
        } else if (paso === 2) {
            paso2.classList.add('active');
        } else if (paso === 3) {
            paso3.classList.add('active');
        }
    }

    // Funciones para manejar la lógica de la reserva
    function pasarAlSegundoPaso() {
        const nombreDueno = document.getElementById('nombre-dueno').value;
        const correoDueno = document.getElementById('correo-dueno').value;
        const nombreMascota = document.getElementById('nombre-mascota').value;

        if (!nombreDueno || !correoDueno || !nombreMascota) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Todos los campos son obligatorios.'
            });
            return;
        }

        // Guardar en localStorage
        const reserva = {
            nombreDueno,
            correoDueno,
            nombreMascota,
            diasSeleccionados
        };
        localStorage.setItem('reserva', JSON.stringify(reserva));

        mostrarPaso(2);  // Cambiar al segundo paso
    }

    function pasarAlTercerPaso() {
        if (diasSeleccionados.length === 0) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Debes seleccionar al menos un día para continuar.'
            });
            return;
        }

        const reserva = JSON.parse(localStorage.getItem('reserva'));
        confirmNombreDueno.innerText = reserva.nombreDueno;
        confirmCorreoDueno.innerText = reserva.correoDueno;
        confirmNombreMascota.innerText = reserva.nombreMascota;
        confirmDias.innerText = diasSeleccionados.join(', ');
        confirmCostoTotal.innerText = `$${diasSeleccionados.length * costoPorDia}`;

        mostrarPaso(3);  // Cambiar al tercer paso
    }

    function hacerReservaFinal() {
        const reserva = JSON.parse(localStorage.getItem('reserva'));

        if (!reserva || diasSeleccionados.length === 0) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se completaron todos los pasos.'
            });
            return;
        }

        // Mostrar mensaje de confirmación
        Swal.fire({
            icon: 'success',
            title: 'Reserva Exitosa',
            text: `Gracias ${reserva.nombreDueno}, hemos reservado los días seleccionados para ${reserva.nombreMascota}. Te enviaremos un correo de confirmación a ${reserva.correoDueno}.`
        }).then(() => {
            // Reiniciar el proceso
            reiniciarProceso();
        });

        // Limpiar localStorage
        localStorage.removeItem('reserva');
        diasSeleccionados = [];
    }

    // Función para reiniciar el proceso
    function reiniciarProceso() {
        // Reiniciar el formulario
        document.getElementById('nombre-dueno').value = '';
        document.getElementById('correo-dueno').value = '';
        document.getElementById('nombre-mascota').value = '';
        
        // Limpiar el calendario
        diasSeleccionados = [];
        calendarioGrid.innerHTML = '';
        costoTotal.innerText = 'Total: $0';

        // Volver al primer paso
        mostrarPaso(1);

        // Re-renderizar el calendario
        renderizarCalendario();
    }

    // Función para renderizar el calendario
    function renderizarCalendario() {
        calendarioGrid.innerHTML = ''; // Limpiar el calendario

        fetch('dias.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error al cargar los días.');
                }
                return response.json();
            })
            .then(data => {
                const diasDisponibles = data.diasDisponibles;

                diasDisponibles.forEach(dia => {
                    const botonDia = document.createElement('button');
                    botonDia.innerText = dia;
                    botonDia.classList.add('calendario-dia');

                    botonDia.addEventListener('click', () => {
                        // Alternar la selección del día
                        if (botonDia.classList.contains('seleccionado')) {
                            botonDia.classList.remove('seleccionado');
                            diasSeleccionados = diasSeleccionados.filter(d => d !== dia);
                        } else {
                            botonDia.classList.add('seleccionado');
                            diasSeleccionados.push(dia);
                        }

                        // Actualizar el costo total
                        costoTotal.innerText = `Total: $${diasSeleccionados.length * costoPorDia}`;
                    });

                    calendarioGrid.appendChild(botonDia);
                });
            })
            .catch(error => {
                console.error('Error:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudieron cargar los días disponibles.'
                });
            });
    }
});
