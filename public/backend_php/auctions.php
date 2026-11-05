<?php
require_once __DIR__ . '/db.php';

$method = $_SERVER['REQUEST_METHOD'];
$pdo = getDbConnection();

// GET - Listar todos os leilões
if ($method === 'GET') {
    // Se for apenas ping
    if (isset($_GET['ping'])) {
        jsonResponse(['success' => true, 'pong' => time()]);
    }

    if ($pdo) {
        $stmt = $pdo->query("SELECT * FROM auctions ORDER BY id DESC");
        $lots = $stmt->fetchAll();
        foreach ($lots as &$lot) {
            $lot['colorHighlights'] = json_decode($lot['colorHighlights'] ?? '[]', true);
            $lot['galleryImages'] = json_decode($lot['galleryImages'] ?? '[]', true);
            $lot['diagnosticReport'] = json_decode($lot['diagnosticReport'] ?? '{}', true);
            
            // Carregar manifesto de aparelhos
            $mStmt = $pdo->prepare("SELECT * FROM manifest_items WHERE lot_id = ?");
            $mStmt->execute([$lot['id']]);
            $lot['manifest'] = $mStmt->fetchAll();

            // Carregar histórico de lances
            $bStmt = $pdo->prepare("SELECT * FROM bids WHERE lot_id = ? ORDER BY id DESC LIMIT 15");
            $bStmt->execute([$lot['id']]);
            $lot['bidsHistory'] = $bStmt->fetchAll();
        }
        jsonResponse(['success' => true, 'count' => count($lots), 'data' => $lots]);
    } else {
        $data = getJsonData();
        jsonResponse(['success' => true, 'count' => count($data['auctions']), 'data' => $data['auctions']]);
    }
}

// POST - Criar ou Atualizar um leilão
if ($method === 'POST') {
    $raw = file_get_contents('php://input');
    $lot = json_decode($raw, true);

    if (!$lot || empty($lot['lotNumber'])) {
        jsonResponse(['success' => false, 'message' => 'Dados do lote inválidos.'], 400);
    }

    if ($pdo) {
        $sql = "INSERT INTO auctions (
            id, lotNumber, title, modelFamily, oemBrand, quantity, grade, primaryStorage,
            batteryHealthRange, carrierStatus, imeiStatus, auctionHouse, location,
            startingBidUsd, currentBidUsd, estimatedBrazilRetailBrl, endTime, imageUrl,
            listingUrl, sourceType, description
        ) VALUES (
            :id, :lotNumber, :title, :modelFamily, :oemBrand, :quantity, :grade, :primaryStorage,
            :batteryHealthRange, :carrierStatus, :imeiStatus, :auctionHouse, :location,
            :startingBidUsd, :currentBidUsd, :estimatedBrazilRetailBrl, :endTime, :imageUrl,
            :listingUrl, :sourceType, :description
        ) ON DUPLICATE KEY UPDATE 
            currentBidUsd = VALUES(currentBidUsd),
            grade = VALUES(grade),
            title = VALUES(title)";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':id' => $lot['id'] ?? ('lot_' . uniqid()),
            ':lotNumber' => $lot['lotNumber'],
            ':title' => $lot['title'],
            ':modelFamily' => $lot['modelFamily'] ?? 'Smartphone',
            ':oemBrand' => $lot['oemBrand'] ?? 'Apple',
            ':quantity' => $lot['quantity'] ?? 1,
            ':grade' => $lot['grade'] ?? 'Grade A',
            ':primaryStorage' => $lot['primaryStorage'] ?? '128GB',
            ':batteryHealthRange' => $lot['batteryHealthRange'] ?? '85% - 100%',
            ':carrierStatus' => $lot['carrierStatus'] ?? 'Clean / Unlocked',
            ':imeiStatus' => $lot['imeiStatus'] ?? 'Clean ESN',
            ':auctionHouse' => $lot['auctionHouse'] ?? 'Verizon US',
            ':location' => $lot['location'] ?? 'Miami, FL',
            ':startingBidUsd' => $lot['startingBidUsd'] ?? 500,
            ':currentBidUsd' => $lot['currentBidUsd'] ?? 500,
            ':estimatedBrazilRetailBrl' => $lot['estimatedBrazilRetailBrl'] ?? 5000,
            ':endTime' => $lot['endTime'] ?? date('Y-m-d H:i:s', strtotime('+2 days')),
            ':imageUrl' => $lot['imageUrl'] ?? '',
            ':listingUrl' => $lot['listingUrl'] ?? $lot['originalListingUrl'] ?? '',
            ':sourceType' => $lot['sourceType'] ?? 'CUSTOM',
            ':description' => $lot['description'] ?? ''
        ]);

        jsonResponse(['success' => true, 'message' => 'Lote salvo com sucesso no banco MySQL!']);
    } else {
        $data = getJsonData();
        $found = false;
        foreach ($data['auctions'] as &$item) {
            if ($item['id'] === $lot['id'] || $item['lotNumber'] === $lot['lotNumber']) {
                $item = array_merge($item, $lot);
                $found = true;
                break;
            }
        }
        if (!$found) {
            $data['auctions'][] = $lot;
        }
        saveJsonData($data);
        jsonResponse(['success' => true, 'message' => 'Lote salvo com sucesso (JSON Storage)!']);
    }
}

// DELETE - Remover um lote
if ($method === 'DELETE') {
    $id = $_GET['id'] ?? '';
    if (!$id) jsonResponse(['success' => false, 'message' => 'ID não informado'], 400);

    if ($pdo) {
        $stmt = $pdo->prepare("DELETE FROM auctions WHERE id = ?");
        $stmt->execute([$id]);
        jsonResponse(['success' => true, 'message' => 'Lote removido do MySQL']);
    } else {
        $data = getJsonData();
        $data['auctions'] = array_values(array_filter($data['auctions'], fn($a) => $a['id'] !== $id));
        saveJsonData($data);
        jsonResponse(['success' => true, 'message' => 'Lote removido (JSON Storage)']);
    }
}
