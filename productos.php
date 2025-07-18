<?php
include('bd/conexion.php');

$data = json_decode(file_get_contents("php://input"), true);

$usuario_id = intval($data['usuario_id']); // ID del usuario
$productos = $data['productos']; // array de productos [{ id, cantidad, precio }]
$total = floatval($data['total']);

$conn->begin_transaction();

try {
    // Insertar pedido
    $stmt = $conn->prepare("INSERT INTO pedidos (usuario_id, total) VALUES (?, ?)");
    $stmt->bind_param("id", $usuario_id, $total);
    $stmt->execute();
    $pedido_id = $conn->insert_id;

    // Insertar productos
    $stmtDetalle = $conn->prepare("INSERT INTO detalle_pedido (pedido_id, producto_id, cantidad, precio_unitario)
                                   VALUES (?, ?, ?, ?)");
    foreach ($productos as $producto) {
        $producto_id = intval($producto['id']);
        $cantidad = intval($producto['cantidad']);
        $precio = floatval($producto['precio']);

        $stmtDetalle->bind_param("iiid", $pedido_id, $producto_id, $cantidad, $precio);
        $stmtDetalle->execute();
    }

    $conn->commit();
    echo json_encode(['success' => 'Pedido registrado']);
} catch (Exception $e) {
    $conn->rollback();
    echo json_encode(['error' => 'Error al guardar el pedido']);
}
?>

