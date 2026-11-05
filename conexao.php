<?php
$host = 'localhost';
$usuario = 'lagua_hub';
$senha = '8Db7uYMHA5PqdA3QNjab';
$banco = 'lagua_hub';

$conexao = new mysqli($host, $usuario, $senha, $banco);

if ($conexao->connect_error) {
    http_response_code(500);
    echo json_encode(["sucesso" => false, "erro" => "Falha na conexão com o banco de dados."]);
    exit;
}
$conexao->set_charset("utf8mb4");
?>