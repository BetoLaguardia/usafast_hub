<?php
header('Content-Type: application/json; charset=utf-8');
require_once 'conexao.php';

// Lê o corpo da requisição JSON enviada pelo painel
$json = file_get_contents('php://input');
$dados = json_decode($json, true);

if (isset($dados['lote_id']) && isset($dados['valor_lance'])) {
    $lote_id = $conexao->real_escape_string($dados['lote_id']);
    $valor_lance = floatval($dados['valor_lance']);
    $cliente = $conexao->real_escape_string($dados['cliente'] ?? 'Roberto');

    $sql = "INSERT INTO lances (lote_id, valor, cliente, data_hora) VALUES ('$lote_id', '$valor_lance', '$cliente', NOW())";

    if ($conexao->query($sql) === TRUE) {
        echo json_encode(["sucesso" => true, "mensagem" => "Lance salvo com sucesso!"]);
    } else {
        http_response_code(500);
        echo json_encode(["sucesso" => false, "erro" => $conexao->error]);
    }
} else {
    http_response_code(400);
    echo json_encode(["sucesso" => false, "erro" => "Dados incompletos."]);
}

$conexao->close();
?>