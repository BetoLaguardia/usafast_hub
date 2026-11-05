<?php
require_once __DIR__ . '/db.php';

$method = $_SERVER['REQUEST_METHOD'];
$pdo = getDbConnection();

// GET - Polling de lances em tempo real
if ($method === 'GET') {
    if (isset($_GET['poll'])) {
        $since = $_GET['since'] ?? '';
        if ($pdo) {
            $stmt = $pdo->prepare("SELECT * FROM bids ORDER BY id DESC LIMIT 1");
            $stmt->execute();
            $latest = $stmt->fetch();
            jsonResponse([
                'success' => true,
                'latestBid' => $latest ? [
                    'lotId' => $latest['lot_id'],
                    'newBidAmount' => (float)$latest['amount_usd'],
                    'bidderName' => $latest['bidder_name']
                ] : null
            ]);
        } else {
            $data = getJsonData();
            $latest = end($data['bids']);
            jsonResponse([
                'success' => true,
                'latestBid' => $latest ? [
                    'lotId' => $latest['lotId'],
                    'newBidAmount' => (float)$latest['amountUsd'],
                    'bidderName' => $latest['bidderName']
                ] : null
            ]);
        }
    }

    // Listar histórico de lances
    $lotId = $_GET['lotId'] ?? '';
    if ($pdo) {
        $stmt = $lotId 
            ? $pdo->prepare("SELECT * FROM bids WHERE lot_id = ? ORDER BY id DESC")
            : $pdo->prepare("SELECT * FROM bids ORDER BY id DESC LIMIT 50");
        $lotId ? $stmt->execute([$lotId]) : $stmt->execute();
        jsonResponse(['success' => true, 'data' => $stmt->fetchAll()]);
    } else {
        $data = getJsonData();
        $bids = $lotId 
            ? array_filter($data['bids'], fn($b) => $b['lotId'] === $lotId)
            : $data['bids'];
        jsonResponse(['success' => true, 'data' => array_values($bids)]);
    }
}

// POST - Registrar novo lance de cliente
if ($method === 'POST') {
    $raw = file_get_contents('php://input');
    $payload = json_decode($raw, true);

    if (!$payload || empty($payload['lotId']) || empty($payload['amountUsd'])) {
        jsonResponse(['success' => false, 'message' => 'Parâmetros de lance inválidos.'], 400);
    }

    $lotId = $payload['lotId'];
    $amountUsd = (float)$payload['amountUsd'];
    $bidderName = $payload['bidderName'] ?? 'Cliente Anônimo';
    $bidderEmail = $payload['bidderEmail'] ?? '';
    $isSniper = !empty($payload['isAutoSniper']);
    $timestamp = date('H:i:s d/m/Y');

    if ($pdo) {
        // Inserir lance
        $stmt = $pdo->prepare("INSERT INTO bids (lot_id, bidder_name, bidder_email, amount_usd, is_sniper, created_at) VALUES (?, ?, ?, ?, ?, NOW())");
        $stmt->execute([$lotId, $bidderName, $bidderEmail, $amountUsd, $isSniper ? 1 : 0]);
        $bidId = $pdo->lastInsertId();

        // Atualizar preço atual do lote no leilão
        $uStmt = $pdo->prepare("UPDATE auctions SET currentBidUsd = ? WHERE id = ?");
        $uStmt->execute([$amountUsd, $lotId]);

        jsonResponse([
            'success' => true,
            'bidId' => $bidId,
            'currentBidUsd' => $amountUsd,
            'message' => 'Lance computado e homologado no servidor PHP!'
        ]);
    } else {
        $data = getJsonData();
        $newBid = [
            'id' => 'bid_' . uniqid(),
            'lotId' => $lotId,
            'bidderName' => $bidderName,
            'bidderEmail' => $bidderEmail,
            'amountUsd' => $amountUsd,
            'isAutoSniper' => $isSniper,
            'timestamp' => $timestamp
        ];
        $data['bids'][] = $newBid;

        // Atualizar lote correspondente
        foreach ($data['auctions'] as &$a) {
            if ($a['id'] === $lotId) {
                $a['currentBidUsd'] = $amountUsd;
                if (!isset($a['bidsHistory'])) $a['bidsHistory'] = [];
                $a['bidsHistory'][] = [
                    'id' => $newBid['id'],
                    'bidderName' => $bidderName,
                    'amountUsd' => $amountUsd,
                    'timestamp' => 'Hoje, ' . date('H:i')
                ];
                break;
            }
        }

        saveJsonData($data);
        jsonResponse([
            'success' => true,
            'bidId' => $newBid['id'],
            'currentBidUsd' => $amountUsd,
            'message' => 'Lance computado no arquivo de dados JSON local!'
        ]);
    }
}
