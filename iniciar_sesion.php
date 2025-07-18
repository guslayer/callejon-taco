<?php
session_start();

$host = 'localhost';
$username = 'root'; 
$password = '';
$database = 'callejon_del_taco';

$conn = new mysqli($host, $username, $password, $database);

if ($conn->connect_error) {
    die("Conexión fallida: " . $conn->connect_error);
}

// Obtener los datos del formulario de inicio de sesión
$correo = $_POST['correo'];
$contrasena = $_POST['password'];

// Verificar si el correo existe en la base de datos
$sql = "SELECT * FROM usuarios WHERE correo='$correo'";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    $usuario = $result->fetch_assoc();
    // Verificar si la contraseña es correcta
    if (password_verify($contrasena, $usuario['contrasena'])) {
        $_SESSION['usuario'] = $usuario['id']; // Iniciar sesión
        echo "Bienvenido, " . $usuario['nombre'];
        header("Location: usuario.html"); // Redirigir al perfil del usuario
    } else {
        echo "Contraseña incorrecta";
    }
} else {
    echo "Correo no registrado";
}

$conn->close();
?>

