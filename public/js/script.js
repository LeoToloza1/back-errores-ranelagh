import { obtenerDatos, enviarErrores } from "./datos.js";

document.addEventListener("DOMContentLoaded", async () => {
	const fechaHoy = document.getElementById("fechaRegistro");
	const inputPuesto = document.getElementById("puestoResponsable");
	const inputSector = document.getElementById("sectorResponsable");
	const fechaResolucion = document.getElementById("fechaResolucion");

	const inputResponsable = document.getElementById("responsable");
	const inputDetectadoPor = document.getElementById("detectadoPor");
	const inputEmitidoPor = document.getElementById("emitidoPor");

	const datalistResponsable = document.getElementById("responsables-list");
	const datalistEmitidoPor = document.getElementById("emitido_por-list");
	const datalistDetectadoPor = document.getElementById("detectados-por-list");


	const form = document.getElementById("formError");
	const submitButton = form.querySelector('button[type="submit"]');
	const loader = document.getElementById("loader");

	const fecha = new Date();
	const anio = fecha.getFullYear();
	const mes = String(fecha.getMonth() + 1).padStart(2, '0');
	const dia = String(fecha.getDate()).padStart(2, '0');
	const fechaFormateada = `${anio}-${mes}-${dia}`;

	fechaHoy.value = fechaFormateada;
	fechaHoy.setAttribute("readonly", true);

	fechaResolucion.setAttribute("min", fechaFormateada);
	const personas = await obtenerDatos();

	function llenarDatalist(datalist, personas) {
		datalist.innerHTML = '';
		personas.forEach(persona => {
			const option = document.createElement("option");
			option.value = persona.nombre;
			datalist.appendChild(option);
		});
	}

	llenarDatalist(datalistResponsable, personas);
	llenarDatalist(datalistEmitidoPor, personas);
	llenarDatalist(datalistDetectadoPor, personas);
	inputResponsable.addEventListener("input", () => {
		const nombreSeleccionado = inputResponsable.value;
		const persona = personas.find(p => p.nombre === nombreSeleccionado);
		if (persona) {
			inputPuesto.value = persona.puesto;
			inputSector.value = persona.sector;
		} else {
			inputPuesto.value = "";
			inputSector.value = "";
		}
	});

	form.addEventListener("submit", async (event) => {
		event.preventDefault();

		// Obtener el nombre del input
		const nombreResponsable = inputResponsable.value;
		const nombreDetectadoPor = inputDetectadoPor.value;
		const nombreEmitidoPor = inputEmitidoPor.value;

		// Buscar las personas en el array para obtener sus IDs
		const responsableObj = personas.find(p => p.nombre === nombreResponsable);
		const detectadoPorObj = personas.find(p => p.nombre === nombreDetectadoPor);
		const emitidoPorObj = personas.find(p => p.nombre === nombreEmitidoPor);
		if (!validaciones()) {
			return;
		}

		// Si no se encuentra la persona, no se envía el formulario
		if (!responsableObj || !detectadoPorObj) {
			Toast.show("Error en la selección de personal. Por favor, elige de la lista.", {
				tipo: "error",
				titulo: "Selección inválida",
				posicion: "top-center",
				autoClose: 3000
			});
			return;
		}

		submitButton.disabled = true;
		loader.classList.remove('hidden');

		try {
			// Construir el objeto de datos con los IDs en lugar de los nombres
			const data = {
				fechaRegistro: fechaHoy.value,
				refDocumento: form.querySelector('#refDocumento').value,
				responsable: responsableObj.id, // Enviamos el ID del responsable
				emitidoPor: emitidoPorObj.id, // Enviamos el ID de quien emitió el error
				puestoResponsable: inputPuesto.value,
				sectorResponsable: inputSector.value,
				fechaResolucion: fechaResolucion.value,
				detectadoPor: detectadoPorObj.id, // Enviamos el ID de quien detectó el error
				comentarioError: form.querySelector('#comentarioError').value
			};

			console.log(data);

			if (navigator.onLine) {
				const response = await enviarErrores(data);
				Toast.show(response.mensaje, {
					tipo: response.tipo,
					titulo: response.titulo,
					posicion: response.posicion || "top-right",
					autoClose: response.autoClose
				});
			} else {
				let erroresPendientes = JSON.parse(localStorage.getItem('erroresPendientes') || '[]');
				erroresPendientes.push(data);
				localStorage.setItem('erroresPendientes', JSON.stringify(erroresPendientes));
				Toast.show("No hay conexión. El error se guardó localmente y se enviará cuando vuelva el internet.", {
					tipo: "warning",
					titulo: "Sin conexión",
					posicion: "top-center",
					autoClose: 4000
				});
			}
		} catch (error) {
			console.error("Error al enviar el formulario:", error);
			Toast.show("Hubo un problema al procesar la solicitud.", {
				tipo: "error",
				titulo: "Error de envío",
				posicion: "top-center",
				autoClose: 4000
			});
		} finally {
			submitButton.disabled = false;
			loader.classList.add('hidden');
			form.reset();
			fechaHoy.value = fechaFormateada;
			inputPuesto.value = "";
			inputSector.value = "";
		}
	});

	window.addEventListener('online', async () => {
		let erroresPendientes = JSON.parse(localStorage.getItem('erroresPendientes') || '[]');
		Toast.show("Vuelves a tener conexión! Se enviarán los errores pendientes.", {
			tipo: "info",
			titulo: "Conexión restablecida",
			posicion: "top-center",
			autoClose: 3000
		});
		if (erroresPendientes.length > 0) {
			for (const error of erroresPendientes) {
				await enviarErrores(error);
			}
			localStorage.removeItem('erroresPendientes');
			Toast.show("Errores pendientes enviados correctamente.", {
				tipo: "success",
				titulo: "Conexión restablecida",
				posicion: "top-center",
				autoClose: 4000
			});
		}
	});

	window.addEventListener('offline', () => {
		Toast.show("¡Sin conexión! Los datos se guardarán localmente.", {
			tipo: "warning",
			titulo: "Sin Internet",
			posicion: "bottom-center",
			autoClose: 4000
		});
	});

	function validaciones() {
		const responsable = inputResponsable.value;
		const detectado = inputDetectadoPor.value;
		const resolucion = fechaResolucion.value;
		const detalleError = form.querySelector('#comentarioError').value.trim();


		if (!responsable || !detectado || !detalleError) {
			Toast.show("Debes seleccionar un responsable, quien lo detectó de la lista y describir el error ", {
				tipo: "error",
				titulo: "Datos incompletos",
				posicion: "top-center",
				autoClose: 3000
			});
			return false;
		}


		const esResponsableValido = personas.some(p => p.nombre === responsable);
		const esDetectadoValido = personas.some(p => p.nombre === detectado);

		if (!esResponsableValido || !esDetectadoValido) {
			Toast.show("Debes seleccionar un responsable y quien lo detectó de la lista", {
				tipo: "error",
				titulo: "Datos incompletos",
				posicion: "top-center",
				autoClose: 3000
			});
			return false;
		}


		if (resolucion && resolucion < fechaHoy.value) {
			Toast.show("La fecha de resolución no puede ser menor a la fecha de hoy", {
				tipo: "error",
				titulo: "Datos inválidos",
				posicion: "top-center",
				autoClose: 3000
			});
			return false;
		}

		return true;
	}
});

if ('serviceWorker' in navigator) {
	navigator.serviceWorker.addEventListener('message', event => {
		const data = event.data;
		if (data.type === 'INFO_FETCH') {
			Toast.show(data.message, {
				tipo: "warning",
				titulo: "Sin conexión - la información sera guardada",
				posicion: "bottom-center",
				autoClose: 4000
			});
		}
		if (data.type === 'FETCH_FAILED') {
			Toast.show(data.message, {
				tipo: "error",
				titulo: "Fallo de conexión - no se pudo obtener la información",
				posicion: "bottom-center",
				autoClose: 4000
			});
		}
	});
}