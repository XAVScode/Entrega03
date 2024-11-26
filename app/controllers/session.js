// Función para obtener el token de la sesión
const getSession = () => {
    const token = sessionStorage.getItem("authToken");
    if (token) {
        console.log("Token encontrado:", token);
        // Decodificar el JWT si el token está presente
        const decodedToken = decodeJWT(token);
        return decodedToken;
    } else {
        console.log("Ninguna sesión encontrada");
    }
};

// Función para decodificar el JWT
function decodeJWT(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}

// Obtener la sesión
const session = getSession();

// Si estamos en la página de login y ya hay una sesión activa, redirigir a la página principal
if ((location.pathname === '/login' && session) || location.pathname === '/register' && session) {
    location.href = "/";
}

// Si no hay sesión, redirigir a la página de login (cuando no estamos en la página de login)
if (!session && location.pathname !== '/login' && location.pathname !== '/register') {
    location.href = "/login";
}


console.log("sesión:", session);
sessionStorage.setItem("session",JSON.stringify(session))

const logout = () => {
    sessionStorage.removeItem("authToken")
    sessionStorage.removeItem("session")
    location.reload()
}


if (session) {
    const nav = document.getElementById("navInfo");
    console.log(nav);
    
    // Obtener las primeras 5 letras del correo y agregar "..."
    const emailDisplay = session.email.length > 5 ? session.email.slice(0, 9) + "..." : session.email;

    nav.innerHTML = `
        <li class="nav-item">
            <a class="nav-link" href="#">MENU</a>
        </li>
        |
        <li>
            <a class="nav-link" href="/profile">${emailDisplay.toUpperCase()}</a>
        </li>
        |
        <li>
            <a class="nav-link" href="#" onclick="logout()">LOGOUT</a>
        </li>
    `;
}


if (location.pathname === '/profile' && session) {
    console.log("estas en profile:", session);
    const container = document.getElementById("user-info");
    
    // Obtener la primera letra del correo
    const firstLetter = session.email.charAt(0).toUpperCase();

    // Crear el HTML dinámicamente
    container.innerHTML = `
        <div style="text-align: center; display:flex;justify-content:center;flex-direction:column;align-items: center;">
            <div style="
                width: 50px;
                height: 50px;
                border-radius: 50%;
                background-color: black;
                color: white;
                display: flex;
                justify-content: center;
                align-items: center;
                font-size: 24px;
                font-weight: bold;
                margin-bottom: 10px;
            ">
                ${firstLetter}
            </div>
            <a class="nav-link" href="/profile" style="color: black; text-decoration: none;">${session.email}</a>
        </div>
    `;
    console.log(document.querySelector("form #email"))
    document.querySelector("form #email").value=session.email
}

