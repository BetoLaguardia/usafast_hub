import { AuctionLot, GradeType } from '../types/auction';

export const GRADE_EXPLANATIONS: Record<GradeType, {
  label: string;
  badgeColor: string;
  borderColor: string;
  textColor: string;
  shortDesc: string;
  screenDesc: string;
  housingDesc: string;
  batteryMin: string;
  functionality: string;
  targetMarket: string;
}> = {
  'Grade A+': {
    label: 'Grade A+ (Impecável / Mint)',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    borderColor: 'border-emerald-500/40',
    textColor: 'text-emerald-400',
    shortDesc: 'Aparelho em estado de novo. Sem qualquer arranhão, micro-marca ou desgaste estético.',
    screenDesc: 'Tela 100% original Apple, sem arranhões visíveis mesmo sob luz focada. True Tone ativo.',
    housingDesc: 'Bordas e carcaça sem marcas de impacto, sem riscos. Conector e botões intactos.',
    batteryMin: '92% a 100% de capacidade original',
    functionality: '100% testado em 30 pontos (Face ID, Câmeras, MagSafe, 5G, Wi-Fi 7).',
    targetMarket: 'Ideal para venda como vitrine / seminovo premium com margem máxima no Brasil.'
  },
  'Grade A': {
    label: 'Grade A (Excelente)',
    badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    borderColor: 'border-cyan-500/40',
    textColor: 'text-cyan-400',
    shortDesc: 'Excelente estado de conservação. Pode conter micro-marcas imperceptíveis a mais de 20cm.',
    screenDesc: 'Tela original Apple sem trincos nem manchas; micro-arranhões superficiais quase invisíveis.',
    housingDesc: 'Laterais limpas com desgaste mínimo normal de case.',
    batteryMin: '86% a 95% de capacidade original',
    functionality: '100% aprovado no diagnóstico Apple Diagnostic Software.',
    targetMarket: 'Alta liquidez no mercado brasileiro de usados e pronta entrega.'
  },
  'Grade B': {
    label: 'Grade B (Muito Bom / Sinais de Uso)',
    badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    borderColor: 'border-amber-500/40',
    textColor: 'text-amber-400',
    shortDesc: 'Aparelho 100% funcional com marcas estéticas moderadas na carcaça ou bordas.',
    screenDesc: 'Tela sem rachaduras; pequenos arranhões superficiais que somem com película.',
    housingDesc: 'Pequenos pontos de desgaste na carcaça de titânio/alumínio.',
    batteryMin: '82% a 89% de capacidade original',
    functionality: '100% operacional. Câmeras, sensores e Face ID rigorosamente testados.',
    targetMarket: 'Excelente relação custo-benefício para revenda rápida com menor investimento.'
  },
  'Grade C': {
    label: 'Grade C (Econômico / Funcional)',
    badgeColor: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
    borderColor: 'border-orange-500/40',
    textColor: 'text-orange-400',
    shortDesc: 'Marcas nítidas de uso e desgastes visíveis na carcaça. Clean IMEI e 100% funcional.',
    screenDesc: 'Arranhões visíveis, sem rachaduras nem dead pixels.',
    housingDesc: 'Marcas de queda leve ou marcas de fricção evidentes.',
    batteryMin: '80% a 85% de capacidade original',
    functionality: 'Placa-mãe, sensores e conexões 100% funcionais.',
    targetMarket: 'Perfeito para lojistas que fazem polimento ou recondicionamento estético.'
  },
  'CPO Refurbished': {
    label: 'CPO / Open Box (Apple Refurbished)',
    badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
    borderColor: 'border-indigo-500/40',
    textColor: 'text-indigo-400',
    shortDesc: 'Aparelhos recondicionados certificados ou caixas abertas em devolução de grandes redes.',
    screenDesc: 'Tela nova original instalada por centro credenciado.',
    housingDesc: 'Carcaça nova sem detalhes. Estado cosmético 10/10.',
    batteryMin: '100% de capacidade nova original',
    functionality: 'Aprovado nos testes de fábrica com certificação de recondicionamento.',
    targetMarket: 'Pode ser vendido com garantia estendida e alto ticket médio.'
  },
  'A(T) DNA': {
    label: 'A(T) DNA (Verizon Grade A Testado)',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    borderColor: 'border-emerald-500/50',
    textColor: 'text-emerald-300',
    shortDesc: 'Padrão Oficial Verizon Wireless A(T) DNA. Totalmente testado, cosmética excelente com laudo de carrier.',
    screenDesc: 'Tela original sem trincos nem quebras. Teste de toque e display 100% aprovados.',
    housingDesc: 'Carcaça com micro-marcas mínimas de devolução de operadora americana.',
    batteryMin: '86% a 100% de capacidade original',
    functionality: '100% funcional no padrão Verizon, Clean ESN e sem bloqueio de ativação.',
    targetMarket: 'Máxima valorização e segurança para lojistas e importadores.'
  },
  'B(T) DNB': {
    label: 'B(T) DNB (Verizon Grade B Testado)',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    borderColor: 'border-amber-500/50',
    textColor: 'text-amber-300',
    shortDesc: 'Padrão Oficial Verizon Wireless B(T) DNB. Totalmente testado com marcas normais de uso.',
    screenDesc: 'Tela original funcional, micro-arranhões superficiais sem trincos.',
    housingDesc: 'Pequenos riscos ou descoloração leve nas quinas ou aro.',
    batteryMin: '82% a 92% de capacidade original',
    functionality: 'Diagnóstico Verizon aprovado. Clean ESN garantido.',
    targetMarket: 'Excelente giro rápido de estoque com preço atrativo.'
  },
  'C(T) DNC': {
    label: 'C(T) DNC (Verizon Grade C Testado)',
    badgeColor: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
    borderColor: 'border-orange-500/50',
    textColor: 'text-orange-300',
    shortDesc: 'Padrão Oficial Verizon Wireless C(T) DNC. Totalmente funcional com marcas estéticas evidentes.',
    screenDesc: 'Tela com arranhões mais visíveis, sem quebra, touch 100% operacional.',
    housingDesc: 'Marcas de atrito ou desgaste na carcaça.',
    batteryMin: '80% a 88% de capacidade original',
    functionality: 'Placa e conectores operacionais, pronto para película ou venda econômica.',
    targetMarket: 'Ideal para recondicionamento e margem agressiva.'
  },
  'D(T) DND': {
    label: 'D(T) DND (Verizon Grade D Testado)',
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    borderColor: 'border-rose-500/50',
    textColor: 'text-rose-300',
    shortDesc: 'Padrão Oficial Verizon Wireless D(T) DND. Aparelho funcional com desgaste estético pesado.',
    screenDesc: 'Arranhões profundos ou desgaste na tela.',
    housingDesc: 'Desgaste estético severo.',
    batteryMin: '75% a 85% de capacidade original',
    functionality: 'Funcional, para técnicos ou recondicionamento completo.',
    targetMarket: 'Menor custo de entrada por unidade.'
  }
};

export const INITIAL_AUCTIONS: AuctionLot[] = [
  {
    id: 'lot-us-16pm-01',
    lotNumber: 'US-89104-MIA',
    title: 'Lote Master 10x iPhone 16 Pro Max 256GB - Desbloqueados Globais',
    modelFamily: 'iPhone 16 Pro Max',
    quantity: 10,
    grade: 'Grade A+',
    primaryStorage: '256GB',
    colorHighlights: ['Desert Titanium', 'Natural Titanium', 'Black Titanium'],
    batteryHealthRange: '96% - 100%',
    carrierStatus: 'Factory Unlocked (Sem bloqueio de operadora)',
    imeiStatus: 'Clean ESN / 100% Verificado',
    auctionHouse: 'Verizon Wholesale Liquidation',
    location: 'Miami, FL (Armazém 01)',
    startingBidUsd: 5800,
    currentBidUsd: 7450,
    reservePriceMet: true,
    estimatedBrazilRetailBrl: 79900,
    totalBidsCount: 28,
    endTime: new Date(Date.now() + 1000 * 60 * 60 * 4 + 1000 * 60 * 23).toISOString(),
    imageUrl: '/src/assets/images/iphone_16_pro_max_grade_a_1793849011033.jpg',
    galleryImages: [
      '/src/assets/images/iphone_16_pro_max_grade_a_1793849011033.jpg',
      '/src/assets/images/iphone_lot_wholesale_inspection_1793849011081.jpg',
      '/src/assets/images/hero_auction_warehouse_iphones_1793849010124.jpg'
    ],
    description: 'Palete inspecionado contendo 10 unidades originais de iPhone 16 Pro Max 256GB Grade A+ (Impecável). Devolução de operadora corporativa americana (AT&T Business Surplus). Aparelhos com película protetora de fábrica recolocada após verificação.',
    diagnosticReport: {
      faceId: true,
      trueTone: true,
      camerasPassed: true,
      batteryTested: true,
      cleanEsn: true,
      mdmFree: true
    },
    manifest: [
      { id: 'dev-01', model: 'iPhone 16 Pro Max', storage: '256GB', color: 'Desert Titanium', grade: 'Grade A+', batteryHealth: 100, imeiMasked: '359482******104', carrierStatus: 'Factory Unlocked', icloudStatus: 'Clean / FMI OFF', screenCondition: 'Perfeita / Sem marcas', housingCondition: 'Impecável' },
      { id: 'dev-02', model: 'iPhone 16 Pro Max', storage: '256GB', color: 'Desert Titanium', grade: 'Grade A+', batteryHealth: 99, imeiMasked: '359482******882', carrierStatus: 'Factory Unlocked', icloudStatus: 'Clean / FMI OFF', screenCondition: 'Perfeita / Sem marcas', housingCondition: 'Impecável' },
      { id: 'dev-03', model: 'iPhone 16 Pro Max', storage: '256GB', color: 'Natural Titanium', grade: 'Grade A+', batteryHealth: 98, imeiMasked: '359482******551', carrierStatus: 'Factory Unlocked', icloudStatus: 'Clean / FMI OFF', screenCondition: 'Perfeita / Sem marcas', housingCondition: 'Impecável' },
      { id: 'dev-04', model: 'iPhone 16 Pro Max', storage: '256GB', color: 'Natural Titanium', grade: 'Grade A+', batteryHealth: 100, imeiMasked: '359482******392', carrierStatus: 'Factory Unlocked', icloudStatus: 'Clean / FMI OFF', screenCondition: 'Perfeita / Sem marcas', housingCondition: 'Impecável' },
      { id: 'dev-05', model: 'iPhone 16 Pro Max', storage: '256GB', color: 'Black Titanium', grade: 'Grade A+', batteryHealth: 97, imeiMasked: '359482******710', carrierStatus: 'Factory Unlocked', icloudStatus: 'Clean / FMI OFF', screenCondition: 'Perfeita / Sem marcas', housingCondition: 'Impecável' },
      { id: 'dev-06', model: 'iPhone 16 Pro Max', storage: '256GB', color: 'Black Titanium', grade: 'Grade A+', batteryHealth: 96, imeiMasked: '359482******904', carrierStatus: 'Factory Unlocked', icloudStatus: 'Clean / FMI OFF', screenCondition: 'Perfeita / Sem marcas', housingCondition: 'Impecável' },
      { id: 'dev-07', model: 'iPhone 16 Pro Max', storage: '256GB', color: 'White Titanium', grade: 'Grade A+', batteryHealth: 100, imeiMasked: '359482******119', carrierStatus: 'Factory Unlocked', icloudStatus: 'Clean / FMI OFF', screenCondition: 'Perfeita / Sem marcas', housingCondition: 'Impecável' },
      { id: 'dev-08', model: 'iPhone 16 Pro Max', storage: '256GB', color: 'Desert Titanium', grade: 'Grade A+', batteryHealth: 98, imeiMasked: '359482******423', carrierStatus: 'Factory Unlocked', icloudStatus: 'Clean / FMI OFF', screenCondition: 'Perfeita / Sem marcas', housingCondition: 'Impecável' },
      { id: 'dev-09', model: 'iPhone 16 Pro Max', storage: '256GB', color: 'Natural Titanium', grade: 'Grade A+', batteryHealth: 99, imeiMasked: '359482******678', carrierStatus: 'Factory Unlocked', icloudStatus: 'Clean / FMI OFF', screenCondition: 'Perfeita / Sem marcas', housingCondition: 'Impecável' },
      { id: 'dev-10', model: 'iPhone 16 Pro Max', storage: '256GB', color: 'Black Titanium', grade: 'Grade A+', batteryHealth: 100, imeiMasked: '359482******250', carrierStatus: 'Factory Unlocked', icloudStatus: 'Clean / FMI OFF', screenCondition: 'Perfeita / Sem marcas', housingCondition: 'Impecável' }
    ],
    bidsHistory: [
      { id: 'b-1', bidderName: 'Arrematante SP-948', amountUsd: 7450, timestamp: 'Há 4 minutos' },
      { id: 'b-2', bidderName: 'TechImports Curitiba', amountUsd: 7300, timestamp: 'Há 18 minutos', isAutomatic: true },
      { id: 'b-3', bidderName: 'Global Trader RJ', amountUsd: 7150, timestamp: 'Há 45 minutos' },
      { id: 'b-4', bidderName: 'Arrematante SP-948', amountUsd: 7000, timestamp: 'Há 1 hora' }
    ]
  },
  {
    id: 'lot-us-15p-02',
    lotNumber: 'US-77402-DAL',
    title: 'Lote 5x iPhone 15 Pro 128GB - Grade A (Natural Titanium & Black)',
    modelFamily: 'iPhone 15 Pro',
    quantity: 5,
    grade: 'Grade A',
    primaryStorage: '128GB',
    colorHighlights: ['Natural Titanium', 'Black Titanium', 'White Titanium'],
    batteryHealthRange: '88% - 94%',
    carrierStatus: 'Factory Unlocked (Global)',
    imeiStatus: 'Clean ESN / 100% Verificado',
    auctionHouse: 'Liquidation.com Enterprise',
    location: 'Dallas, TX (Hub Central)',
    startingBidUsd: 2200,
    currentBidUsd: 2850,
    reservePriceMet: true,
    estimatedBrazilRetailBrl: 26500,
    totalBidsCount: 19,
    endTime: new Date(Date.now() + 1000 * 60 * 60 * 1 + 1000 * 60 * 42).toISOString(),
    imageUrl: '/src/assets/images/iphone_15_pro_natural_titanium_1793849011192.jpg',
    galleryImages: [
      '/src/assets/images/iphone_15_pro_natural_titanium_1793849011192.jpg',
      '/src/assets/images/iphone_lot_wholesale_inspection_1793849011081.jpg'
    ],
    description: 'Cinco unidades de iPhone 15 Pro com carcaça em titânio e chip A17 Pro. Grade A rigorosa: micro-riscos imperceptíveis, bateria média de 91%, telas originais Apple com True Tone 100% ativo.',
    diagnosticReport: {
      faceId: true,
      trueTone: true,
      camerasPassed: true,
      batteryTested: true,
      cleanEsn: true,
      mdmFree: true
    },
    manifest: [
      { id: 'dev-11', model: 'iPhone 15 Pro', storage: '128GB', color: 'Natural Titanium', grade: 'Grade A', batteryHealth: 93, imeiMasked: '358712******401', carrierStatus: 'Factory Unlocked', icloudStatus: 'Clean / FMI OFF', screenCondition: 'Excelente / Sem riscos', housingCondition: 'Mínimo desgaste case' },
      { id: 'dev-12', model: 'iPhone 15 Pro', storage: '128GB', color: 'Natural Titanium', grade: 'Grade A', batteryHealth: 91, imeiMasked: '358712******619', carrierStatus: 'Factory Unlocked', icloudStatus: 'Clean / FMI OFF', screenCondition: 'Excelente', housingCondition: 'Excelente' },
      { id: 'dev-13', model: 'iPhone 15 Pro', storage: '128GB', color: 'Black Titanium', grade: 'Grade A', batteryHealth: 94, imeiMasked: '358712******772', carrierStatus: 'Factory Unlocked', icloudStatus: 'Clean / FMI OFF', screenCondition: 'Excelente', housingCondition: 'Excelente' },
      { id: 'dev-14', model: 'iPhone 15 Pro', storage: '128GB', color: 'Black Titanium', grade: 'Grade A', batteryHealth: 89, imeiMasked: '358712******910', carrierStatus: 'Factory Unlocked', icloudStatus: 'Clean / FMI OFF', screenCondition: 'Excelente', housingCondition: 'Leve micro-ponto borda' },
      { id: 'dev-15', model: 'iPhone 15 Pro', storage: '128GB', color: 'White Titanium', grade: 'Grade A', batteryHealth: 92, imeiMasked: '358712******128', carrierStatus: 'Factory Unlocked', icloudStatus: 'Clean / FMI OFF', screenCondition: 'Excelente', housingCondition: 'Excelente' }
    ],
    bidsHistory: [
      { id: 'b-21', bidderName: 'EletroCell BH', amountUsd: 2850, timestamp: 'Há 12 minutos' },
      { id: 'b-22', bidderName: 'ImportaFast Campinas', amountUsd: 2750, timestamp: 'Há 35 minutos' },
      { id: 'b-23', bidderName: 'Licitante 440', amountUsd: 2600, timestamp: 'Há 1 hora' }
    ]
  },
  {
    id: 'lot-us-16single-03',
    lotNumber: 'US-90311-ORL',
    title: '1x iPhone 16 Pro Max 512GB Desert Titanium - Grade A+ Impecável (Unidade Avulsa)',
    modelFamily: 'iPhone 16 Pro Max',
    quantity: 1,
    grade: 'Grade A+',
    primaryStorage: '512GB',
    colorHighlights: ['Desert Titanium'],
    batteryHealthRange: '100%',
    carrierStatus: 'Factory Unlocked (eSIM Ready)',
    imeiStatus: 'Clean ESN / 100% Verificado',
    auctionHouse: 'Apple Certified Wholesale',
    location: 'Orlando, FL (Depósito Sul)',
    startingBidUsd: 650,
    currentBidUsd: 890,
    reservePriceMet: true,
    estimatedBrazilRetailBrl: 9200,
    totalBidsCount: 34,
    endTime: new Date(Date.now() + 1000 * 60 * 38).toISOString(), // ending in 38 mins
    imageUrl: '/src/assets/images/iphone_16_pro_max_grade_a_1793849011033.jpg',
    galleryImages: [
      '/src/assets/images/iphone_16_pro_max_grade_a_1793849011033.jpg'
    ],
    description: 'Unidade individual de alta capacidade (512GB). 100% de saúde de bateria, com apenas 4 ciclos registrados no relatório de diagnóstico Apple. Acompanha caixa original aberta com cabo USB-C trançado lacrado.',
    diagnosticReport: {
      faceId: true,
      trueTone: true,
      camerasPassed: true,
      batteryTested: true,
      cleanEsn: true,
      mdmFree: true
    },
    manifest: [
      { id: 'dev-single-1', model: 'iPhone 16 Pro Max', storage: '512GB', color: 'Desert Titanium', grade: 'Grade A+', batteryHealth: 100, imeiMasked: '359920******731', carrierStatus: 'Factory Unlocked', icloudStatus: 'Clean / FMI OFF', screenCondition: 'Nova / Sem marcas', housingCondition: 'Impecável' }
    ],
    bidsHistory: [
      { id: 'b-31', bidderName: 'Pedro Apple Reseller', amountUsd: 890, timestamp: 'Há 1 minuto' },
      { id: 'b-32', bidderName: 'SniperUSA Lances', amountUsd: 875, timestamp: 'Há 5 minutos', isAutomatic: true },
      { id: 'b-33', bidderName: 'Vitor Importações', amountUsd: 850, timestamp: 'Há 14 minutos' }
    ]
  },
  {
    id: 'lot-us-pallet-04',
    lotNumber: 'US-62180-MIA',
    title: 'Palete Atacado 25x iPhone 15 128GB - Grade B (Testados & Clean ESN)',
    modelFamily: 'iPhone 15',
    quantity: 25,
    grade: 'Grade B',
    primaryStorage: '128GB',
    colorHighlights: ['Preto', 'Azul', 'Rosa', 'Amarelo', 'Verde'],
    batteryHealthRange: '83% - 90%',
    carrierStatus: 'Factory Unlocked (Global)',
    imeiStatus: 'Clean ESN / 100% Verificado',
    auctionHouse: 'Verizon Wholesale Liquidation',
    location: 'Miami, FL (Port of Miami Logistics)',
    startingBidUsd: 8500,
    currentBidUsd: 10800,
    reservePriceMet: true,
    estimatedBrazilRetailBrl: 106250,
    totalBidsCount: 41,
    endTime: new Date(Date.now() + 1000 * 60 * 60 * 7 + 1000 * 60 * 15).toISOString(),
    imageUrl: '/src/assets/images/iphone_lot_wholesale_inspection_1793849011081.jpg',
    galleryImages: [
      '/src/assets/images/iphone_lot_wholesale_inspection_1793849011081.jpg',
      '/src/assets/images/hero_auction_warehouse_iphones_1793849010124.jpg'
    ],
    description: 'Palete voltado para revendedores de grande volume. 25 unidades de iPhone 15 128GB com Dynamic Island. Aparelhos 100% funcionais, sem trincos na tela. Grade B com pequenos sinais estéticos que somem com capinha e película.',
    diagnosticReport: {
      faceId: true,
      trueTone: true,
      camerasPassed: true,
      batteryTested: true,
      cleanEsn: true,
      mdmFree: true
    },
    manifest: Array.from({ length: 25 }).map((_, idx) => ({
      id: `dev-lot-${idx + 1}`,
      model: 'iPhone 15',
      storage: '128GB',
      color: ['Preto', 'Azul', 'Rosa', 'Verde', 'Amarelo'][idx % 5],
      grade: 'Grade B',
      batteryHealth: 83 + (idx % 8),
      imeiMasked: `357280******${String(100 + idx * 7).slice(-3)}`,
      carrierStatus: 'Factory Unlocked',
      icloudStatus: 'Clean / FMI OFF',
      screenCondition: 'Sem trincos / Leves micro-riscos',
      housingCondition: 'Sinais normais de uso nas bordas'
    })),
    bidsHistory: [
      { id: 'b-41', bidderName: 'MegaTech Lojista SP', amountUsd: 10800, timestamp: 'Há 18 minutos' },
      { id: 'b-42', bidderName: 'Distribuidora Sul Tech', amountUsd: 10600, timestamp: 'Há 40 minutos' },
      { id: 'b-43', bidderName: 'Celulares & Cia Brasil', amountUsd: 10300, timestamp: 'Há 1 hora' }
    ]
  },
  {
    id: 'lot-us-cpo-05',
    lotNumber: 'US-99120-COL',
    title: 'Lote 8x iPhone 15 Pro Max 256GB - CPO Apple Certified Pre-Owned (Bateria 100%)',
    modelFamily: 'iPhone 15 Pro Max',
    quantity: 8,
    grade: 'CPO Refurbished',
    primaryStorage: '256GB',
    colorHighlights: ['Natural Titanium', 'Blue Titanium', 'White Titanium'],
    batteryHealthRange: '100% (Novas Originais)',
    carrierStatus: 'Factory Unlocked (Global)',
    imeiStatus: 'Clean ESN / 100% Verificado',
    auctionHouse: 'Apple Certified Wholesale',
    location: 'Columbus, OH (Logistics North)',
    startingBidUsd: 5200,
    currentBidUsd: 6150,
    reservePriceMet: true,
    estimatedBrazilRetailBrl: 54400,
    totalBidsCount: 22,
    endTime: new Date(Date.now() + 1000 * 60 * 60 * 2 + 1000 * 60 * 50).toISOString(),
    imageUrl: '/src/assets/images/iphone_15_pro_natural_titanium_1793849011192.jpg',
    galleryImages: [
      '/src/assets/images/iphone_15_pro_natural_titanium_1793849011192.jpg',
      '/src/assets/images/hero_auction_warehouse_iphones_1793849010124.jpg'
    ],
    description: 'Oito unidades recondicionadas oficiais Apple com carcaça e tela substitutas originais, selo de fábrica e 100% de saúde de bateria. Acompanha certificado de teste com 0 ciclos de uso.',
    diagnosticReport: {
      faceId: true,
      trueTone: true,
      camerasPassed: true,
      batteryTested: true,
      cleanEsn: true,
      mdmFree: true
    },
    manifest: Array.from({ length: 8 }).map((_, idx) => ({
      id: `dev-cpo-${idx + 1}`,
      model: 'iPhone 15 Pro Max',
      storage: '256GB',
      color: idx % 2 === 0 ? 'Natural Titanium' : 'Blue Titanium',
      grade: 'CPO Refurbished',
      batteryHealth: 100,
      imeiMasked: `358991******${String(200 + idx * 11).slice(-3)}`,
      carrierStatus: 'Factory Unlocked',
      icloudStatus: 'Clean / FMI OFF',
      screenCondition: 'Nova sem uso (Apple CPO)',
      housingCondition: 'Nova sem uso (Apple CPO)'
    })),
    bidsHistory: [
      { id: 'b-51', bidderName: 'SmartStore Fortaleza', amountUsd: 6150, timestamp: 'Há 7 minutos' },
      { id: 'b-52', bidderName: 'Licitante 102', amountUsd: 6000, timestamp: 'Há 32 minutos' }
    ]
  },
  {
    id: 'lot-us-gov-06',
    lotNumber: 'US-31088-ATL',
    title: 'Lote Governamental 15x iPhone 14 Pro 128GB - Grade A/B (Desbloqueados)',
    modelFamily: 'iPhone 14 Series',
    quantity: 15,
    grade: 'Grade A',
    primaryStorage: '128GB',
    colorHighlights: ['Deep Purple', 'Space Black', 'Gold', 'Silver'],
    batteryHealthRange: '85% - 91%',
    carrierStatus: 'Factory Unlocked (Carrier Cleared)',
    imeiStatus: 'Clean ESN / 100% Verificado',
    auctionHouse: 'GovDeals Tech Surplus',
    location: 'Atlanta, GA (Federal Surplus Hub)',
    startingBidUsd: 4800,
    currentBidUsd: 5900,
    reservePriceMet: true,
    estimatedBrazilRetailBrl: 58500,
    totalBidsCount: 29,
    endTime: new Date(Date.now() + 1000 * 60 * 60 * 5 + 1000 * 60 * 10).toISOString(),
    imageUrl: '/src/assets/images/iphone_lot_wholesale_inspection_1793849011081.jpg',
    galleryImages: [
      '/src/assets/images/iphone_lot_wholesale_inspection_1793849011081.jpg'
    ],
    description: 'Surplus governamental americano proveniente de renovação de contratos federais. Todos os aparelhos foram higienizados e resetados com FMI OFF e laudo de IMEI limpo pela GSMA.',
    diagnosticReport: {
      faceId: true,
      trueTone: true,
      camerasPassed: true,
      batteryTested: true,
      cleanEsn: true,
      mdmFree: true
    },
    manifest: Array.from({ length: 15 }).map((_, idx) => ({
      id: `dev-gov-${idx + 1}`,
      model: 'iPhone 14 Pro',
      storage: '128GB',
      color: ['Deep Purple', 'Space Black', 'Gold', 'Silver'][idx % 4],
      grade: 'Grade A',
      batteryHealth: 85 + (idx % 7),
      imeiMasked: `356190******${String(400 + idx * 9).slice(-3)}`,
      carrierStatus: 'Factory Unlocked',
      icloudStatus: 'Clean / FMI OFF',
      screenCondition: 'Excelente / Poucos sinais',
      housingCondition: 'Muito bom / Pequeno desgaste'
    })),
    bidsHistory: [
      { id: 'b-61', bidderName: 'Brasília Tech Outlet', amountUsd: 5900, timestamp: 'Há 22 minutos' },
      { id: 'b-62', bidderName: 'Rede iShop Brasil', amountUsd: 5750, timestamp: 'Há 50 minutos' }
    ]
  },
  {
    id: 'lot-us-16p-07',
    lotNumber: 'US-92840-MIA',
    title: 'Lote 3x iPhone 16 Pro 256GB Natural Titanium - Grade A+ (Lacre Removido)',
    modelFamily: 'iPhone 16 Pro',
    quantity: 3,
    grade: 'Grade A+',
    primaryStorage: '256GB',
    colorHighlights: ['Natural Titanium'],
    batteryHealthRange: '100%',
    carrierStatus: 'Factory Unlocked (Global)',
    imeiStatus: 'Clean ESN / 100% Verificado',
    auctionHouse: 'Verizon Wholesale Liquidation',
    location: 'Miami, FL (Armazém 01)',
    startingBidUsd: 1950,
    currentBidUsd: 2350,
    reservePriceMet: true,
    estimatedBrazilRetailBrl: 23700,
    totalBidsCount: 16,
    endTime: new Date(Date.now() + 1000 * 60 * 60 * 3 + 1000 * 60 * 5).toISOString(),
    imageUrl: '/src/assets/images/iphone_16_pro_max_grade_a_1793849011033.jpg',
    galleryImages: [
      '/src/assets/images/iphone_16_pro_max_grade_a_1793849011033.jpg'
    ],
    description: 'Três unidades de iPhone 16 Pro 256GB com acabamento em Titânio Natural e Botão de Controle de Câmera capacitivo. Condição A+ sem qualquer detalhe, baterias com 100% e 1 a 3 ciclos.',
    diagnosticReport: {
      faceId: true,
      trueTone: true,
      camerasPassed: true,
      batteryTested: true,
      cleanEsn: true,
      mdmFree: true
    },
    manifest: [
      { id: 'dev-16p-1', model: 'iPhone 16 Pro', storage: '256GB', color: 'Natural Titanium', grade: 'Grade A+', batteryHealth: 100, imeiMasked: '359102******841', carrierStatus: 'Factory Unlocked', icloudStatus: 'Clean / FMI OFF', screenCondition: 'Perfeita / Sem marcas', housingCondition: 'Impecável' },
      { id: 'dev-16p-2', model: 'iPhone 16 Pro', storage: '256GB', color: 'Natural Titanium', grade: 'Grade A+', batteryHealth: 100, imeiMasked: '359102******339', carrierStatus: 'Factory Unlocked', icloudStatus: 'Clean / FMI OFF', screenCondition: 'Perfeita / Sem marcas', housingCondition: 'Impecável' },
      { id: 'dev-16p-3', model: 'iPhone 16 Pro', storage: '256GB', color: 'Natural Titanium', grade: 'Grade A+', batteryHealth: 100, imeiMasked: '359102******912', carrierStatus: 'Factory Unlocked', icloudStatus: 'Clean / FMI OFF', screenCondition: 'Perfeita / Sem marcas', housingCondition: 'Impecável' }
    ],
    bidsHistory: [
      { id: 'b-71', bidderName: 'Alex Imports Florianópolis', amountUsd: 2350, timestamp: 'Há 9 minutos' },
      { id: 'b-72', bidderName: 'Lances Auto BR', amountUsd: 2280, timestamp: 'Há 30 minutos' }
    ]
  },
  {
    id: 'lot-us-c-08',
    lotNumber: 'US-44109-LAX',
    title: 'Lote 12x iPhone 14 Pro Max 256GB - Grade C (100% Funcionais / Clean IMEI)',
    modelFamily: 'iPhone 14 Series',
    quantity: 12,
    grade: 'Grade C',
    primaryStorage: '256GB',
    colorHighlights: ['Space Black', 'Deep Purple'],
    batteryHealthRange: '81% - 86%',
    carrierStatus: 'Factory Unlocked (Global)',
    imeiStatus: 'Clean ESN / 100% Verificado',
    auctionHouse: 'Copart Tech Recovery',
    location: 'Ontario / Los Angeles, CA',
    startingBidUsd: 3600,
    currentBidUsd: 4400,
    reservePriceMet: true,
    estimatedBrazilRetailBrl: 51600,
    totalBidsCount: 25,
    endTime: new Date(Date.now() + 1000 * 60 * 60 * 6 + 1000 * 60 * 40).toISOString(),
    imageUrl: '/src/assets/images/iphone_lot_wholesale_inspection_1793849011081.jpg',
    galleryImages: [
      '/src/assets/images/iphone_lot_wholesale_inspection_1793849011081.jpg'
    ],
    description: 'Doze unidades de iPhone 14 Pro Max com tela intacta sem trincos, mas com marcas e arranhões visíveis na carcaça de aço cirúrgico. Excelente margem de lucro para assistência técnica que faz revitalização ou revenda econômica.',
    diagnosticReport: {
      faceId: true,
      trueTone: true,
      camerasPassed: true,
      batteryTested: true,
      cleanEsn: true,
      mdmFree: true
    },
    manifest: Array.from({ length: 12 }).map((_, idx) => ({
      id: `dev-c-${idx + 1}`,
      model: 'iPhone 14 Pro Max',
      storage: '256GB',
      color: idx % 2 === 0 ? 'Space Black' : 'Deep Purple',
      grade: 'Grade C',
      batteryHealth: 81 + (idx % 6),
      imeiMasked: `355910******${String(500 + idx * 8).slice(-3)}`,
      carrierStatus: 'Factory Unlocked',
      icloudStatus: 'Clean / FMI OFF',
      screenCondition: 'Arranhões visíveis / Sem trincos',
      housingCondition: 'Marcas de atrito / Desgaste visível'
    })),
    bidsHistory: [
      { id: 'b-81', bidderName: 'Fix & Sell Campinas', amountUsd: 4400, timestamp: 'Há 15 minutos' },
      { id: 'b-82', bidderName: 'Import Sul Telecom', amountUsd: 4250, timestamp: 'Há 55 minutos' }
    ]
  }
];

export const DEFAULT_PTAX_USD_BRL = 5.75;
