<?php
require_once __DIR__ . '/db.php';

$method = $_SERVER['REQUEST_METHOD'];
if ($method !== 'POST') {
    jsonResponse(['success' => false, 'message' => 'Método inválido. Use POST.'], 405);
}

$raw = file_get_contents('php://input');
$payload = json_decode($raw, true);

if (!$payload || !isset($payload['lots']) || !is_array($payload['lots'])) {
    jsonResponse(['success' => false, 'message' => 'Nenhum lote enviado para importação.'], 400);
}

$lots = $payload['lots'];
$filename = $payload['filename'] ?? 'planilha_importada.xlsx';
$pdo = getDbConnection();

if ($pdo) {
    $pdo->beginTransaction();
    try {
        $lotStmt = $pdo->prepare("INSERT INTO auctions (
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
            title = VALUES(title),
            currentBidUsd = VALUES(currentBidUsd),
            quantity = VALUES(quantity)");

        $mStmt = $pdo->prepare("INSERT INTO manifest_items (
            lot_id, model, storage, color, grade, battery_health, imei_masked,
            carrier_status, part_number, inventory_source, item_description, qty
        ) VALUES (
            :lot_id, :model, :storage, :color, :grade, :battery_health, :imei_masked,
            :carrier_status, :part_number, :inventory_source, :item_description, :qty
        )");

        foreach ($lots as $lot) {
            $lotId = $lot['id'] ?? ('lot_' . uniqid());
            $lotStmt->execute([
                ':id' => $lotId,
                ':lotNumber' => $lot['lotNumber'],
                ':title' => $lot['title'],
                ':modelFamily' => $lot['modelFamily'] ?? 'Smartphone',
                ':oemBrand' => $lot['oemBrand'] ?? 'Multimarca',
                ':quantity' => $lot['quantity'] ?? 1,
                ':grade' => $lot['grade'] ?? 'Grade A',
                ':primaryStorage' => $lot['primaryStorage'] ?? '128GB',
                ':batteryHealthRange' => $lot['batteryHealthRange'] ?? '85% - 100%',
                ':carrierStatus' => $lot['carrierStatus'] ?? 'Clean / Unlocked',
                ':imeiStatus' => $lot['imeiStatus'] ?? 'Clean ESN',
                ':auctionHouse' => $lot['auctionHouse'] ?? 'Verizon US',
                ':location' => $lot['location'] ?? 'Miami, FL',
                ':startingBidUsd' => $lot['startingBidUsd'] ?? 100,
                ':currentBidUsd' => $lot['currentBidUsd'] ?? 150,
                ':estimatedBrazilRetailBrl' => $lot['estimatedBrazilRetailBrl'] ?? 2000,
                ':endTime' => $lot['endTime'] ?? date('Y-m-d H:i:s', strtotime('+3 days')),
                ':imageUrl' => $lot['imageUrl'] ?? '',
                ':listingUrl' => $lot['listingUrl'] ?? $lot['originalListingUrl'] ?? '',
                ':sourceType' => $lot['sourceType'] ?? 'VERIZON',
                ':description' => $lot['description'] ?? ''
            ]);

            // Inserir itens de manifesto
            if (!empty($lot['manifest']) && is_array($lot['manifest'])) {
                foreach ($lot['manifest'] as $item) {
                    $mStmt->execute([
                        ':lot_id' => $lotId,
                        ':model' => $item['model'] ?? 'Item',
                        ':storage' => $item['storage'] ?? '128GB',
                        ':color' => $item['color'] ?? 'Black',
                        ':grade' => $item['grade'] ?? 'Grade A',
                        ':battery_health' => (int)($item['batteryHealth'] ?? 90),
                        ':imei_masked' => $item['imeiMasked'] ?? '359820******000',
                        ':carrier_status' => $item['carrierStatus'] ?? 'Clean',
                        ':part_number' => $item['partNumber'] ?? '',
                        ':inventory_source' => $item['inventorySource'] ?? 'Return',
                        ':item_description' => $item['itemDescription'] ?? '',
                        ':qty' => (int)($item['qty'] ?? 1)
                    ]);
                }
            }
        }

        $pdo->commit();
        jsonResponse([
            'success' => true,
            'importedLots' => count($lots),
            'message' => count($lots) . " lotes gravados com sucesso na tabela MySQL 'auctions'!"
        ]);
    } catch (Exception $e) {
        $pdo->rollBack();
        jsonResponse(['success' => false, 'message' => 'Erro ao gravar no MySQL: ' . $e->getMessage()], 500);
    }
} else {
    // Fallback JSON
    $data = getJsonData();
    $data['auctions'] = $lots;
    saveJsonData($data);
    jsonResponse([
        'success' => true,
        'importedLots' => count($lots),
        'message' => count($lots) . ' lotes salvos no armazenamento JSON do servidor PHP!'
    ]);
}
