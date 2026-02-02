import { URL_BASE } from "./datos.js";

const modal = document.getElementById('passwordModal');
const openBtn = document.getElementById('openPasswordModal');
const closeBtn = document.getElementById('closeModal');
const cancelBtn = document.getElementById('cancelBtn');
// USAMOS EL ID QUE ESTÁ EN EL PUG: profileForm
const form = document.getElementById('profileForm');

// Abrir y Cerrar
openBtn.onclick = () => modal.style.display = 'flex';
[closeBtn, cancelBtn].forEach(btn => {
    if (btn) btn.onclick = () => modal.style.display = 'none';
});

window.onclick = (e) => { if (e.target == modal) modal.style.display = 'none'; };

form.onsubmit = async (e) => {
    e.preventDefault();

    // Obtenemos los valores usando el atributo 'name' de los inputs
    const newUsername = e.target.newUsername.value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Validación básica
    if (newPassword && newPassword !== confirmPassword) {
        return alert("Las contraseñas nuevas no coinciden.");
    }

    if (!newUsername && !newPassword) {
        return alert("Debes completar al menos un campo para actualizar.");
    }

    try {
        const response = await fetch(URL_BASE + '/auth/actualizar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                newUsername: newUsername,
                newPassword: newPassword
            })
        });

        if (response.ok) {
            alert("Perfil actualizado. Por favor, ingresa de nuevo.");
            window.location.href = '/login';
        } else {
            const err = await response.json();
            alert("Error: " + err.error);
        }
    } catch (error) {
        console.error("Error en la petición:", error);
        alert("Hubo un problema al conectar con el servidor.");
    }
};

document.getElementById('logoutBtn').onclick = async () => {
    if (confirm("¿Estás seguro de que quieres cerrar sesión?")) {
        const res = await fetch(URL_BASE + '/auth/logout', { method: 'POST' });
        if (res.ok) window.location.href = '/login';
    }
};


const sidebarToggle = document.getElementById('sidebarToggle');
const body = document.body;

sidebarToggle.addEventListener('click', () => {
    body.classList.toggle('sidebar-collapsed');

    // Opcional: Guardar en localStorage para que recuerde si estaba cerrado
    const isCollapsed = body.classList.contains('sidebar-collapsed');
    localStorage.setItem('sidebarStatus', isCollapsed ? 'collapsed' : 'expanded');
});

// Al cargar la página, verificar si debe estar colapsado
window.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('sidebarStatus') === 'collapsed') {
        body.classList.add('sidebar-collapsed');
    }
});