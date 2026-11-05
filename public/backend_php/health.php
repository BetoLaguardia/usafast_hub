<?php
require_once __DIR__ . '/db.php';

$pdo = getDbConnection();
$storageMode = $pdo ? 'MySQL Database (Conectado)' : 'JSON Local Storage (Ativo sem MySQL)';

jsonResponse([
    'success' => true,
    'message' => 'Servidor PHP de Leilões Operacional!',
    'mode' => $storageMode,
    'timestamp' => date('Y-m-d H:i:s'),
    'php_version' => PHP_VERSION,
    'cors' => 'Habilitado'
]);
