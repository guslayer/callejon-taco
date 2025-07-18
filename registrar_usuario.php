<?php
// Mostrar errores en desarrollo
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');

// Conexión a la base de datos
include('bd/conexion.php');

// Leer JSON del body
$data = json_decode(file_get_contents("php://input"));

// Validar datos requeridos
if (
    !isset($data->nombre) || !isset($data->correo) || !isset($data->contrasena) ||
    !isset($data->edad) || !isset($data->direccion) || !isset($data->telefono)
) {
    echo json_encode(['error' => 'Faltan datos en la solicitud']);
    exit;
}

$nombre = $data->nombre;
$correo = $data->correo;
$contrasena = password_hash($data->contrasena, PASSWORD_DEFAULT);
$edad = intval($data->edad);
$direccion = $data->direccion;
$telefono = $data->telefono;

// Verificar si el correo ya existe
$sql_check = "SELECT id FROM usuarios WHERE correo = ?";
$stmt_check = $conn->prepare($sql_check);

if (!$stmt_check) {
    echo json_encode(['error' => 'Error en prepare() de check', 'detalle' => $conn->error]);
    exit;
}

$stmt_check->bind_param("s", $correo);
$stmt_check->execute();
$result = $stmt_check->get_result();

if ($result && $result->num_rows > 0) {
    echo json_encode(['error' => 'El correo ya está registrado']);
    exit;
}

// Insertar nuevo usuario
$sql_insert = "INSERT INTO usuarios (nombre, correo, contrasena, edad, direccion, telefono)
               VALUES (?, ?, ?, ?, ?, ?)";

$stmt_insert = $conn->prepare($sql_insert);

if (!$stmt_insert) {
    echo json_encode(['error' => 'Error en prepare() de insert', 'detalle' => $conn->error]);
    exit;
}

$stmt_insert->bind_param("sssiss", $nombre, $correo, $contrasena, $edad, $direccion, $telefono);

if ($stmt_insert->execute()) {
    echo json_encode(['success' => 'Usuario registrado con éxito', 'id' => $stmt_insert->insert_id]);
} else {
    echo json_encode(['error' => 'Error al registrar usuario', 'detalle' => $stmt_insert->error]);
}

$stmt_check->close();
$stmt_insert->close();
$conn->close();
?>
