<?php
/**
 * db.php - Conexão com Banco de Dados MySQL (PDO)
 * Possui suporte automático a fallback em arquivo JSON caso o MySQL ainda não esteja configurado.
 */

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Configurações do seu banco MySQL (Altere conforme sua hospedagem/cPanel)
define('DB_HOST', 'localhost');
define('DB_NAME', 'lagua_hub');
define('DB_USER', 'lagua_hub');
define('DB_PASS', '8Db7uYMHA5PqdA3QNjab');

// Arquivo de fallback caso MySQL não esteja criado ainda
define('JSON_STORAGE_FILE', __DIR__ . '/data_storage.json');

function getDbConnection() {
    static $pdo = null;
    if ($pdo !== null) return $pdo;

    try {
        $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4";
        $pdo = new PDO($dsn, DB_USER, DB_PASS, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_TIMEOUT => 2
        ]);
        return $pdo;
    } catch (Exception $e) {
        // Fallback em JSON automático caso MySQL não esteja rodando
        return null;
    }
}

// Helper para ler dados em modo JSON Fallback
function getJsonData() {
    if (!file_exists(JSON_STORAGE_FILE)) {
        return ['auctions' => [], 'bids' => [], 'clients' => []];
    }
    $content = file_get_contents(JSON_STORAGE_FILE);
    $data = json_decode($content, true);
    return is_array($data) ? $data : ['auctions' => [], 'bids' => [], 'clients' => []];
}

// Helper para salvar dados em modo JSON Fallback
function saveJsonData($data) {
    file_put_contents(JSON_STORAGE_FILE, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

function jsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}
