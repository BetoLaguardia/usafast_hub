-- ========================================================
-- BANCO DE DADOS: leiloes_iphones
-- ESTRUTURA PARA IMPORTAÇÃO VERIZON, ARREMATANTES E LANCES
-- ========================================================



-- 1. TABELA DE LOTES DE LEILÃO
CREATE TABLE IF NOT EXISTS `auctions` (
  `id` VARCHAR(100) NOT NULL,
  `lotNumber` VARCHAR(60) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `modelFamily` VARCHAR(100) NOT NULL DEFAULT 'iPhone 16 Pro Max',
  `oemBrand` VARCHAR(80) NOT NULL DEFAULT 'Apple',
  `quantity` INT NOT NULL DEFAULT 1,
  `grade` VARCHAR(30) NOT NULL DEFAULT 'Grade A',
  `primaryStorage` VARCHAR(50) NOT NULL DEFAULT '128GB',
  `batteryHealthRange` VARCHAR(50) NOT NULL DEFAULT '85% - 100%',
  `carrierStatus` VARCHAR(100) NOT NULL DEFAULT 'Clean / Factory Unlocked',
  `imeiStatus` VARCHAR(100) NOT NULL DEFAULT 'Clean ESN / 100% Verificado',
  `auctionHouse` VARCHAR(120) NOT NULL DEFAULT 'Verizon Direct US Liquidation',
  `location` VARCHAR(100) NOT NULL DEFAULT 'Miami, FL',
  `startingBidUsd` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `currentBidUsd` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `estimatedBrazilRetailBrl` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `totalBidsCount` INT NOT NULL DEFAULT 0,
  `endTime` DATETIME NOT NULL,
  `imageUrl` TEXT,
  `listingUrl` TEXT,
  `sourceType` VARCHAR(40) NOT NULL DEFAULT 'VERIZON',
  `description` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_lotNumber` (`lotNumber`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. TABELA DE MANIFESTO (DISPOSITIVOS E ESPECIFICAÇÕES ITEM A ITEM)
CREATE TABLE IF NOT EXISTS `manifest_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `lot_id` VARCHAR(100) NOT NULL,
  `model` VARCHAR(100) NOT NULL,
  `storage` VARCHAR(50) NOT NULL DEFAULT '128GB',
  `color` VARCHAR(50) NOT NULL DEFAULT 'Black',
  `grade` VARCHAR(30) NOT NULL DEFAULT 'Grade C',
  `battery_health` INT NOT NULL DEFAULT 85,
  `imei_masked` VARCHAR(50) NOT NULL DEFAULT '359820******000',
  `carrier_status` VARCHAR(100) NOT NULL DEFAULT 'Verizon Clean',
  `part_number` VARCHAR(60) DEFAULT NULL,
  `inventory_source` VARCHAR(80) DEFAULT NULL,
  `item_description` VARCHAR(255) DEFAULT NULL,
  `qty` INT NOT NULL DEFAULT 1,
  KEY `idx_lot_id` (`lot_id`),
  CONSTRAINT `fk_manifest_auction` FOREIGN KEY (`lot_id`) REFERENCES `auctions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. TABELA DE LANCES COMPUTADOS EM TEMPO REAL
CREATE TABLE IF NOT EXISTS `bids` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `lot_id` VARCHAR(100) NOT NULL,
  `bidder_name` VARCHAR(120) NOT NULL,
  `bidder_email` VARCHAR(120) DEFAULT NULL,
  `amount_usd` DECIMAL(10,2) NOT NULL,
  `is_sniper` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  KEY `idx_lot_bids` (`lot_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. TABELA DE ARREMATANTES CADASTRADOS E LIMITES
CREATE TABLE IF NOT EXISTS `clients` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(120) NOT NULL,
  `email` VARCHAR(120) NOT NULL UNIQUE,
  `cpf_cnpj` VARCHAR(30) NOT NULL,
  `phone` VARCHAR(40) NOT NULL,
  `bidding_limit_usd` DECIMAL(10,2) NOT NULL DEFAULT 25000.00,
  `verified_status` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
