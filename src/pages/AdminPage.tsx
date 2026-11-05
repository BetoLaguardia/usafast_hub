import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { 
  Upload, 
  FileSpreadsheet, 
  Gavel, 
  Users, 
  Settings, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  Download, 
  AlertCircle, 
  Search, 
  RefreshCw, 
  DollarSign, 
  Layers, 
  Clock, 
  Eye, 
  FileText,
  Sliders,
  Smartphone,
  Server,
  Globe,
  Code,
  Copy,
  Check,
  TrendingUp,
  BarChart3,
  Package,
  ShieldCheck,
  Lock
} from 'lucide-react';
import { AuctionLot, GradeType, SystemUser, AdminOffer } from '../types/auction';
import { apiService, PhpApiConfig } from '../services/apiService';

interface AdminPageProps {
  auctions: AuctionLot[];
  onUpdateAuctions: (newAuctions: AuctionLot[]) => void;
  currentUser: SystemUser;
  onUpdateCurrentUser: (user: SystemUser) => void;
  usdRate: number;
  onUpdateUsdRate: (newRate: number) => void;
  onLogout?: () => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({
  auctions,
  onUpdateAuctions,
  currentUser,
  onUpdateCurrentUser,
  usdRate,
  onUpdateUsdRate,
  onLogout
}) => {
  const [adminTab, setAdminTab] = useState<'dashboard' | 'upload' | 'lots' | 'offers' | 'clients' | 'settings' | 'php-api'>('dashboard');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // PHP & API Connection State
  const [phpConfig, setPhpConfig] = useState<PhpApiConfig>(apiService.getConfig());
  const [phpTestResult, setPhpTestResult] = useState<{ testing: boolean; success?: boolean; latencyMs?: number; message?: string } | null>(null);
  const [selectedPhpFile, setSelectedPhpFile] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const showNotice = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // ----------------------------------------------------
  // EXCEL / CSV UPLOAD ENGINE (PADRÃO VERIZON & CUSTOM)
  // ----------------------------------------------------
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadMode, setUploadMode] = useState<'file' | 'paste'>('file');
  const [presetFormat, setPresetFormat] = useState<'VERIZON' | 'GENERIC'>('VERIZON');
  const [pasteText, setPasteText] = useState('');
  const [parsedPreviewRows, setParsedPreviewRows] = useState<any[]>([]);
  const [rawHeaders, setRawHeaders] = useState<string[]>([]);
  const [isLoadingVerizon, setIsLoadingVerizon] = useState(false);
  const [verizonUnitRate, setVerizonUnitRate] = useState<number>(85);
  const [verizonExpandedLot, setVerizonExpandedLot] = useState<string | null>(null);
  const [replaceExistingLots, setReplaceExistingLots] = useState(true);

  interface VerizonGroupedLot {
    lotNumber: string;
    title: string;
    oem: string;
    primaryModel: string;
    gradeRaw: string;
    mappedGrade: GradeType;
    endDate: any;
    endTime: any;
    parsedEndTime: string;
    url: string;
    totalQty: number;
    uniqueModels: string[];
    uniqueCapacities: string[];
    uniqueColors: string[];
    uniqueSources: string[];
    calculatedCurrentBidUsd: number;
    calculatedStartingBidUsd: number;
    calculatedRetailBrl: number;
    manifest: any[];
  }

  const [verizonGroupedLots, setVerizonGroupedLots] = useState<VerizonGroupedLot[]>([]);

  const [columnMapping, setColumnMapping] = useState({
    lotNumber: '',
    title: '',
    modelFamily: '',
    quantity: '',
    grade: '',
    storage: '',
    batteryHealth: '',
    currentBidUsd: '',
    startingBidUsd: '',
    estimatedRetailBrl: '',
    auctionHouse: '',
    location: ''
  });

  // Helper: map grade from CSV to GradeType (Standard / Generic auctions)
  const mapGrade = (raw: string): GradeType => {
    const g = String(raw || '').toUpperCase();
    if (g.includes('A+')) return 'Grade A+';
    if (g.includes('A') && !g.includes('A/B') && !g.includes('B(')) return 'Grade A';
    if (g.includes('B') || g.includes('A/B')) return 'Grade B';
    if (g.includes('C') || g.includes('C(T)')) return 'Grade C';
    if (g.includes('CPO') || g.includes('REFURB')) return 'CPO Refurbished';
    return 'Grade C';
  };

  // Helper: map grade exclusively for VERIZON auctions
  // "quero que quando for importar o leilao verizon, troque as grades para A(T) DNA , B(T) DNB , C(T) DNC e assim por diante. Atencao so no verizon entendeu?"
  const mapVerizonGrade = (raw: string): GradeType => {
    const g = String(raw || '').trim().toUpperCase();
    if (g.includes('A(T)') || g.includes('DNA') || g.includes('A+') || (g.includes('A') && !g.includes('B') && !g.includes('C') && !g.includes('D'))) {
      return 'A(T) DNA';
    }
    if (g.includes('B(T)') || g.includes('DNB') || g.includes('B') || g.includes('A/B')) {
      return 'B(T) DNB';
    }
    if (g.includes('C(T)') || g.includes('DNC') || g.includes('C')) {
      return 'C(T) DNC';
    }
    if (g.includes('D(T)') || g.includes('DND') || g.includes('D')) {
      return 'D(T) DND';
    }
    return 'C(T) DNC';
  };

  // Helper: parse date and time from Verizon CSV
  const parseAuctionEndTime = (endDateVal: any, endTimeVal: any): string => {
    let d: Date;
    if (typeof endDateVal === 'number' || (!isNaN(Number(endDateVal)) && Number(endDateVal) > 40000 && Number(endDateVal) < 60000)) {
      const serial = Number(endDateVal);
      d = new Date(Math.round((serial - 25569) * 86400 * 1000));
    } else if (typeof endDateVal === 'string' && endDateVal.trim()) {
      const parts = endDateVal.trim().split(/[\/\-]/);
      if (parts.length === 3 && parts[2].length === 4) {
        d = new Date(parseInt(parts[2], 10), parseInt(parts[0], 10) - 1, parseInt(parts[1], 10));
      } else {
        d = new Date(endDateVal);
      }
    } else {
      d = new Date(Date.now() + 86400000 * 2);
    }
    if (isNaN(d.getTime())) d = new Date(Date.now() + 86400000 * 2);

    if (typeof endTimeVal === 'string' && endTimeVal.includes(':')) {
      const isPM = /pm/i.test(endTimeVal);
      const isAM = /am/i.test(endTimeVal);
      const clean = endTimeVal.replace(/[^\d:]/g, '');
      const [hrsStr, minStr] = clean.split(':');
      let hrs = parseInt(hrsStr, 10) || 12;
      const mins = parseInt(minStr, 10) || 0;
      if (isPM && hrs < 12) hrs += 12;
      if (isAM && hrs === 12) hrs = 0;
      d.setHours(hrs, mins, 0, 0);
    }

    if (d.getTime() < Date.now()) {
      d = new Date(Date.now() + (1000 * 60 * 60 * 28));
    }
    return d.toISOString();
  };

  // Core parser for VERIZON standard rows
  const processVerizonRows = (rawRows: any[], unitRate: number = verizonUnitRate) => {
    const groups = new Map<string, {
      lotNumber: string;
      title: string;
      oem: string;
      primaryModel: string;
      gradeRaw: string;
      endDate: any;
      endTime: any;
      url: string;
      totalQty: number;
      models: Set<string>;
      capacities: Set<string>;
      colors: Set<string>;
      sources: Set<string>;
      items: any[];
    }>();

    rawRows.forEach((r, idx) => {
      const lotNum = String(r['Lot #'] || r['Lot#'] || r['Lot'] || r['lotNumber'] || '').trim();
      if (!lotNum) return;

      if (!groups.has(lotNum)) {
        groups.set(lotNum, {
          lotNumber: lotNum,
          title: String(r['Title'] || r['title'] || `Lote ${lotNum}`).trim(),
          oem: String(r['OEM'] || r['oem'] || 'Samsung').trim(),
          primaryModel: String(r['Model'] || r['model'] || 'Smartphone').trim(),
          gradeRaw: String(r['Grade'] || r['grade'] || 'C(T)').trim(),
          endDate: r['End Date'] || r['endDate'],
          endTime: r['End Time'] || r['endTime'],
          url: String(r['URL'] || r['url'] || '').trim(),
          totalQty: 0,
          models: new Set<string>(),
          capacities: new Set<string>(),
          colors: new Set<string>(),
          sources: new Set<string>(),
          items: []
        });
      }

      const g = groups.get(lotNum)!;
      const q = parseInt(String(r['Qty'] || r['qty'] || 1), 10) || 1;
      g.totalQty += q;

      const model = String(r['Model'] || r['model'] || g.primaryModel).trim();
      const cap = String(r['Capacity'] || r['capacity'] || '128GB').trim();
      const color = String(r['Color'] || r['color'] || 'Black').trim();
      const source = String(r['Inventory Source'] || r['inventorySource'] || 'Carrier Return').trim();

      if (model) g.models.add(model);
      if (cap) g.capacities.add(cap);
      if (color) g.colors.add(color);
      if (source) g.sources.add(source);

      // Transform grade ONLY for Verizon: A(T) -> A(T) DNA, B(T) -> B(T) DNB, C(T) -> C(T) DNC, etc.
      const mappedG = mapVerizonGrade(r['Grade'] || g.gradeRaw);

      g.items.push({
        id: `dev-vz-${lotNum}-${idx}`,
        model,
        storage: cap || '128GB',
        color: color || 'Black',
        grade: mappedG,
        batteryHealth: 84 + (idx % 16),
        imeiMasked: `359820******${String(100 + (idx * 17) % 899)}`,
        carrierStatus: 'Verizon Clean / Unlocked',
        icloudStatus: 'Clean / FMI OFF',
        screenCondition: 'Conforme Grade Verizon DNA',
        housingCondition: 'Conforme Grade Verizon DNA',
        partNumber: String(r['Part #'] || r['partNumber'] || '').trim(),
        inventorySource: source,
        itemDescription: String(r['Item Description'] || r['itemDescription'] || '').trim(),
        qty: q
      });
    });

    const parsedGroupedLots: VerizonGroupedLot[] = Array.from(groups.values()).map(g => {
      // Transform grade ONLY for Verizon to A(T) DNA, B(T) DNB, C(T) DNC, D(T) DND
      const mappedGrade = mapVerizonGrade(g.gradeRaw);
      const isPremium = /fold|ultra|pro max/i.test(g.primaryModel);
      const isBudget = /a1|a2|a0/i.test(g.primaryModel);
      const perUnit = isPremium ? unitRate * 1.6 : isBudget ? unitRate * 0.6 : unitRate;
      const calculatedCurrentBidUsd = Math.max(150, Math.round(g.totalQty * perUnit));
      const calculatedStartingBidUsd = Math.round(calculatedCurrentBidUsd * 0.75);
      const calculatedRetailBrl = Math.round(calculatedCurrentBidUsd * usdRate * 1.55);

      return {
        lotNumber: g.lotNumber,
        title: g.title,
        oem: g.oem,
        primaryModel: g.primaryModel,
        gradeRaw: g.gradeRaw,
        mappedGrade,
        endDate: g.endDate,
        endTime: g.endTime,
        parsedEndTime: parseAuctionEndTime(g.endDate, g.endTime),
        url: g.url,
        totalQty: g.totalQty,
        uniqueModels: Array.from(g.models),
        uniqueCapacities: Array.from(g.capacities),
        uniqueColors: Array.from(g.colors),
        uniqueSources: Array.from(g.sources),
        calculatedCurrentBidUsd,
        calculatedStartingBidUsd,
        calculatedRetailBrl,
        manifest: g.items
      };
    });

    setVerizonGroupedLots(parsedGroupedLots);
    return parsedGroupedLots;
  };

  // 1-Click Loader for the user's attached official VERIZON CSV
  const handleLoadAttachedVerizonCsv = async () => {
    setIsLoadingVerizon(true);
    try {
      const res = await fetch('/assets/aistudio/verizon_listings_official.csv');
      if (!res.ok) {
        throw new Error('Não foi possível ler o arquivo local anexado.');
      }
      const text = await res.text();
      const wb = XLSX.read(text, { type: 'string' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rawRows: any[] = XLSX.utils.sheet_to_json(ws);

      if (!rawRows || rawRows.length === 0) {
        showNotice('Arquivo VERIZON está vazio.', 'error');
        return;
      }

      const grouped = processVerizonRows(rawRows);
      setUploadedFileName('Planilha_Oficial_VERIZON.csv (Anexo)');
      setPresetFormat('VERIZON');
      setRawHeaders(Object.keys(rawRows[0] || {}));
      setParsedPreviewRows(rawRows);

      let totalUnits = 0;
      grouped.forEach(g => { totalUnits += g.totalQty; });

      showNotice(`Catálogo Oficial VERIZON carregado: ${grouped.length} lotes agrupados e ${totalUnits.toLocaleString()} aparelhos detectados!`, 'success');
    } catch (err: any) {
      showNotice(`Falha ao carregar CSV VERIZON: ${err?.message || err}`, 'error');
    } finally {
      setIsLoadingVerizon(false);
    }
  };

  // ----------------------------------------------------
  // UNIVERSAL XML SPREADSHEET PARSER (.xml / text XML)
  // ----------------------------------------------------
  const parseXmlSpreadsheet = (xmlText: string): any[] => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

    const parseError = xmlDoc.getElementsByTagName('parsererror')[0];
    if (parseError) {
      throw new Error('Erro na estrutura do XML: ' + (parseError.textContent?.slice(0, 100) || 'Formato XML inválido'));
    }

    // 1. Excel XML Spreadsheet 2003 (<Workbook><Worksheet><Table><Row><Cell><Data>...)
    const rows = xmlDoc.getElementsByTagName('Row');
    if (rows && rows.length > 0) {
      const rawGrid: string[][] = [];
      for (let i = 0; i < rows.length; i++) {
        const rowElem = rows[i];
        const cells = rowElem.getElementsByTagName('Cell');
        const rowData: string[] = [];
        for (let j = 0; j < cells.length; j++) {
          const cell = cells[j];
          const ssIndex = cell.getAttribute('ss:Index');
          if (ssIndex) {
            const targetIdx = parseInt(ssIndex, 10) - 1;
            while (rowData.length < targetIdx) rowData.push('');
          }
          const dataElem = cell.getElementsByTagName('Data')[0];
          const textVal = dataElem ? (dataElem.textContent || '').trim() : (cell.textContent || '').trim();
          rowData.push(textVal);
        }
        if (rowData.some(c => c !== '')) {
          rawGrid.push(rowData);
        }
      }

      if (rawGrid.length >= 2) {
        const headers = rawGrid[0];
        const resultRows: any[] = [];
        for (let r = 1; r < rawGrid.length; r++) {
          const rowObj: any = {};
          for (let c = 0; c < headers.length; c++) {
            const h = headers[c] || `Coluna_${c + 1}`;
            rowObj[h] = rawGrid[r][c] || '';
          }
          resultRows.push(rowObj);
        }
        return resultRows;
      }
    }

    // 2. Element-based lists (<listing>, <lot>, <item>, <device>, <row>, <auction>)
    const candidateTags = ['listing', 'lot', 'item', 'row', 'record', 'product', 'device', 'auction', 'entry'];
    for (const tag of candidateTags) {
      const elements = xmlDoc.getElementsByTagName(tag);
      if (elements && elements.length > 0) {
        const resultRows: any[] = [];
        for (let i = 0; i < elements.length; i++) {
          const el = elements[i];
          const rowObj: any = {};
          for (let j = 0; j < el.children.length; j++) {
            const child = el.children[j];
            rowObj[child.tagName] = (child.textContent || '').trim();
          }
          for (let a = 0; a < el.attributes.length; a++) {
            const attr = el.attributes[a];
            rowObj[attr.name] = attr.value.trim();
          }
          if (Object.keys(rowObj).length > 0) {
            resultRows.push(rowObj);
          }
        }
        if (resultRows.length > 0) return resultRows;
      }
    }

    // 3. Fallback: direct root children
    const root = xmlDoc.documentElement;
    if (root && root.children.length > 0) {
      const resultRows: any[] = [];
      for (let i = 0; i < root.children.length; i++) {
        const child = root.children[i];
        const rowObj: any = {};
        for (let j = 0; j < child.children.length; j++) {
          rowObj[child.children[j].tagName] = (child.children[j].textContent || '').trim();
        }
        for (let a = 0; a < child.attributes.length; a++) {
          rowObj[child.attributes[a].name] = child.attributes[a].value.trim();
        }
        if (Object.keys(rowObj).length > 0) {
          resultRows.push(rowObj);
        }
      }
      if (resultRows.length > 0) return resultRows;
    }

    throw new Error('Nenhum registro de leilão foi encontrado na estrutura deste XML.');
  };

  const SAMPLE_VERIZON_XML = `<?xml version="1.0" encoding="UTF-8"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Worksheet ss:Name="Leiloes_USAFAST_XML">
    <Table>
      <Row>
        <Cell><Data ss:Type="String">Lot #</Data></Cell>
        <Cell><Data ss:Type="String">Title</Data></Cell>
        <Cell><Data ss:Type="String">OEM</Data></Cell>
        <Cell><Data ss:Type="String">Model</Data></Cell>
        <Cell><Data ss:Type="String">Grade</Data></Cell>
        <Cell><Data ss:Type="String">Qty</Data></Cell>
        <Cell><Data ss:Type="String">Capacity</Data></Cell>
        <Cell><Data ss:Type="String">Color</Data></Cell>
        <Cell><Data ss:Type="String">Inventory Source</Data></Cell>
        <Cell><Data ss:Type="String">Part #</Data></Cell>
        <Cell><Data ss:Type="String">End Date</Data></Cell>
        <Cell><Data ss:Type="String">End Time</Data></Cell>
      </Row>
      <Row>
        <Cell><Data ss:Type="String">UF-XML-01</Data></Cell>
        <Cell><Data ss:Type="String">Lote 15x iPhone 16 Pro Max 256GB - Grade A(T) DNA (USAFAST Hub Miami)</Data></Cell>
        <Cell><Data ss:Type="String">Apple</Data></Cell>
        <Cell><Data ss:Type="String">iPhone 16 Pro Max</Data></Cell>
        <Cell><Data ss:Type="String">A(T)</Data></Cell>
        <Cell><Data ss:Type="Number">15</Data></Cell>
        <Cell><Data ss:Type="String">256GB</Data></Cell>
        <Cell><Data ss:Type="String">Desert Titanium</Data></Cell>
        <Cell><Data ss:Type="String">Verizon Clean Trade-In</Data></Cell>
        <Cell><Data ss:Type="String">MU773LL/A</Data></Cell>
        <Cell><Data ss:Type="String">11/09/2026</Data></Cell>
        <Cell><Data ss:Type="String">04:30 PM</Data></Cell>
      </Row>
      <Row>
        <Cell><Data ss:Type="String">UF-XML-02</Data></Cell>
        <Cell><Data ss:Type="String">Lote 25x iPhone 15 Pro 128GB - Grade B(T) DNB Natural Titanium</Data></Cell>
        <Cell><Data ss:Type="String">Apple</Data></Cell>
        <Cell><Data ss:Type="String">iPhone 15 Pro</Data></Cell>
        <Cell><Data ss:Type="String">B(T)</Data></Cell>
        <Cell><Data ss:Type="Number">25</Data></Cell>
        <Cell><Data ss:Type="String">128GB</Data></Cell>
        <Cell><Data ss:Type="String">Natural Titanium</Data></Cell>
        <Cell><Data ss:Type="String">Carrier Return Unlocked</Data></Cell>
        <Cell><Data ss:Type="String">MTV13LL/A</Data></Cell>
        <Cell><Data ss:Type="String">11/09/2026</Data></Cell>
        <Cell><Data ss:Type="String">05:00 PM</Data></Cell>
      </Row>
      <Row>
        <Cell><Data ss:Type="String">UF-XML-03</Data></Cell>
        <Cell><Data ss:Type="String">Lote 40x iPhone 14 128GB - Grade C(T) DNC Midnight Black</Data></Cell>
        <Cell><Data ss:Type="String">Apple</Data></Cell>
        <Cell><Data ss:Type="String">iPhone 14</Data></Cell>
        <Cell><Data ss:Type="String">C(T)</Data></Cell>
        <Cell><Data ss:Type="Number">40</Data></Cell>
        <Cell><Data ss:Type="String">128GB</Data></Cell>
        <Cell><Data ss:Type="String">Midnight Black</Data></Cell>
        <Cell><Data ss:Type="String">Verizon Bulk Surplus</Data></Cell>
        <Cell><Data ss:Type="String">MPUD3LL/A</Data></Cell>
        <Cell><Data ss:Type="String">11/09/2026</Data></Cell>
        <Cell><Data ss:Type="String">06:00 PM</Data></Cell>
      </Row>
    </Table>
  </Worksheet>
</Workbook>`;

  const handleLoadSampleXml = () => {
    try {
      const rows = parseXmlSpreadsheet(SAMPLE_VERIZON_XML);
      const headers = Object.keys(rows[0] || {});
      setRawHeaders(headers);
      setParsedPreviewRows(rows);
      setUploadedFileName('planilha_exemplo_verizon.xml');
      setPresetFormat('VERIZON');
      const grouped = processVerizonRows(rows);
      let totalUnits = 0;
      grouped.forEach(g => { totalUnits += g.totalQty; });
      showNotice(`Exemplo XML processado com sucesso! ${grouped.length} lotes agrupados e ${totalUnits} aparelhos detectados.`);
    } catch (e: any) {
      showNotice(`Erro ao carregar exemplo XML: ${e?.message}`, 'error');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    const isXml = file.name.toLowerCase().endsWith('.xml') || file.type.includes('xml');

    if (isXml) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const text = String(evt.target?.result || '');
          const rows = parseXmlSpreadsheet(text);
          if (rows.length === 0) {
            showNotice('O arquivo XML não possui linhas ou lotes legíveis.', 'error');
            return;
          }
          const headers = Object.keys(rows[0]);
          setRawHeaders(headers);
          setParsedPreviewRows(rows);

          const isVerizon = headers.some(h => /lot #|item description|part #|inventory source|model/i.test(h)) ||
                            /verizon|usafast/i.test(file.name);

          if (isVerizon || presetFormat === 'VERIZON') {
            setPresetFormat('VERIZON');
            const grouped = processVerizonRows(rows);
            let totalUnits = 0;
            grouped.forEach(g => { totalUnits += g.totalQty; });
            showNotice(`Arquivo XML processado! ${grouped.length} lotes agrupados e ${totalUnits} aparelhos lidos.`);
          } else {
            setPresetFormat('GENERIC');
            showNotice(`Arquivo XML "${file.name}" carregado com ${rows.length} registros.`);
          }
        } catch (err: any) {
          showNotice(`Erro ao processar arquivo XML: ${err?.message}`, 'error');
        }
      };
      reader.readAsText(file);
      return;
    }

    // Standard binary reading for XLSX / XLS / CSV
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const rawJson: any[] = XLSX.utils.sheet_to_json(ws);
        const dataGrid: any[] = XLSX.utils.sheet_to_json(ws, { header: 1 });

        if (rawJson.length === 0) {
          showNotice('O arquivo parece vazio ou sem dados válidos.', 'error');
          return;
        }

        const headers = (dataGrid[0] as string[]).map(h => String(h || '').trim());
        setRawHeaders(headers);
        setParsedPreviewRows(rawJson);

        // Check if file matches the VERIZON standard
        const isVerizonFormat = headers.some(h => /lot #|item description|part #|inventory source|package type/i.test(h)) ||
                                /verizon/i.test(file.name);

        if (isVerizonFormat || presetFormat === 'VERIZON') {
          setPresetFormat('VERIZON');
          const grouped = processVerizonRows(rawJson);
          let totalUnits = 0;
          grouped.forEach(g => { totalUnits += g.totalQty; });
          showNotice(`Arquivo VERIZON detectado! ${grouped.length} lotes agrupados e ${totalUnits} aparelhos lidos.`);
        } else {
          setPresetFormat('GENERIC');
          const mapping = {
            lotNumber: headers.find(h => /lote|lot|id|codigo/i.test(h)) || headers[0] || '',
            title: headers.find(h => /titulo|title|produto|descricao/i.test(h)) || headers[1] || '',
            modelFamily: headers.find(h => /modelo|model|familia|aparelho/i.test(h)) || headers[2] || '',
            quantity: headers.find(h => /quantidade|qtd|unidades|units|qty/i.test(h)) || headers[3] || '',
            grade: headers.find(h => /grade|condicao|classificacao/i.test(h)) || headers[4] || '',
            storage: headers.find(h => /armazenamento|storage|capacidade|memoria/i.test(h)) || '',
            batteryHealth: headers.find(h => /bateria|battery|saude/i.test(h)) || '',
            currentBidUsd: headers.find(h => /lance atual|current bid|lance|valor usd|preco/i.test(h)) || '',
            startingBidUsd: headers.find(h => /lance inicial|starting bid|minimo|abertura/i.test(h)) || '',
            estimatedRetailBrl: headers.find(h => /revenda|varejo|brasil|brl|mercado livre/i.test(h)) || '',
            auctionHouse: headers.find(h => /casa|auction house|origem|fornecedor/i.test(h)) || '',
            location: headers.find(h => /localizacao|armazem|cidade|location|estado/i.test(h)) || ''
          };
          setColumnMapping(mapping);
          showNotice(`Arquivo "${file.name}" carregado com ${rawJson.length} linhas.`);
        }
      } catch (err: any) {
        showNotice(`Erro ao processar planilha: ${err?.message || 'Arquivo inválido'}`, 'error');
      }
    };

    reader.readAsBinaryString(file);
  };

  const handleProcessPastedText = () => {
    if (!pasteText.trim()) {
      showNotice('Cole o texto da sua planilha ou código XML primeiro.', 'error');
      return;
    }

    // Check if pasted content is XML
    if (pasteText.trim().startsWith('<')) {
      try {
        const rows = parseXmlSpreadsheet(pasteText.trim());
        if (rows.length === 0) {
          showNotice('Nenhum registro reconhecido no XML colado.', 'error');
          return;
        }
        const headers = Object.keys(rows[0]);
        setRawHeaders(headers);
        setParsedPreviewRows(rows);
        setUploadedFileName('Dados Colados em XML');

        const isVerizon = headers.some(h => /lot #|item description|part #|inventory source|model/i.test(h));
        if (isVerizon || presetFormat === 'VERIZON') {
          setPresetFormat('VERIZON');
          const grouped = processVerizonRows(rows);
          showNotice(`XML Padrão VERIZON processado! ${grouped.length} lotes agrupados.`);
        } else {
          setPresetFormat('GENERIC');
          showNotice(`${rows.length} registros XML processados com sucesso!`);
        }
        return;
      } catch (err: any) {
        showNotice(`Falha ao interpretar XML colado: ${err?.message}`, 'error');
        return;
      }
    }

    try {
      const wb = XLSX.read(pasteText.trim(), { type: 'string' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rawJson: any[] = XLSX.utils.sheet_to_json(ws);
      const dataGrid: any[] = XLSX.utils.sheet_to_json(ws, { header: 1 });

      if (rawJson.length === 0) {
        showNotice('Nenhum registro reconhecido no texto colado.', 'error');
        return;
      }

      const headers = (dataGrid[0] as string[]).map(h => String(h || '').trim());
      setRawHeaders(headers);
      setParsedPreviewRows(rawJson);
      setUploadedFileName('Dados Colados do Excel / CSV');

      const isVerizon = headers.some(h => /lot #|item description|part #|inventory source/i.test(h));
      if (isVerizon || presetFormat === 'VERIZON') {
        setPresetFormat('VERIZON');
        const grouped = processVerizonRows(rawJson);
        showNotice(`Padrão VERIZON detectado! ${grouped.length} lotes agrupados.`);
      } else {
        setPresetFormat('GENERIC');
        const mapping = {
          lotNumber: headers.find(h => /lote|lot|id|codigo/i.test(h)) || headers[0] || '',
          title: headers.find(h => /titulo|title|produto|descricao/i.test(h)) || headers[1] || '',
          modelFamily: headers.find(h => /modelo|model|familia|aparelho/i.test(h)) || headers[2] || '',
          quantity: headers.find(h => /quantidade|qtd|unidades|units|qty/i.test(h)) || headers[3] || '',
          grade: headers.find(h => /grade|condicao|classificacao/i.test(h)) || headers[4] || '',
          storage: headers.find(h => /armazenamento|storage|capacidade|memoria/i.test(h)) || '',
          batteryHealth: headers.find(h => /bateria|battery|saude/i.test(h)) || '',
          currentBidUsd: headers.find(h => /lance atual|current bid|lance|valor usd|preco/i.test(h)) || '',
          startingBidUsd: headers.find(h => /lance inicial|starting bid|minimo|abertura/i.test(h)) || '',
          estimatedRetailBrl: headers.find(h => /revenda|varejo|brasil|brl|mercado livre/i.test(h)) || '',
          auctionHouse: headers.find(h => /casa|auction house|origem|fornecedor/i.test(h)) || '',
          location: headers.find(h => /localizacao|armazem|cidade|location|estado/i.test(h)) || ''
        };
        setColumnMapping(mapping);
        showNotice(`${rawJson.length} linhas de leilão processadas com sucesso!`);
      }
    } catch (e: any) {
      showNotice(`Erro ao processar dados colados: ${e?.message}`, 'error');
    }
  };

  // Recalculate Verizon bids when unit rate slider is adjusted
  const handleRecalculateVerizonRate = (newRate: number) => {
    setVerizonUnitRate(newRate);
    if (parsedPreviewRows.length > 0 && presetFormat === 'VERIZON') {
      processVerizonRows(parsedPreviewRows, newRate);
    }
  };

  // Publish VERIZON grouped lots to store and localStorage
  const handleApplyVerizonImport = () => {
    if (verizonGroupedLots.length === 0) {
      showNotice('Nenhum lote VERIZON agrupado para publicar.', 'error');
      return;
    }

    try {
      const newLots: AuctionLot[] = verizonGroupedLots.map((g, idx) => {
        const isSamsung = /samsung|galaxy|fold|flip/i.test(g.primaryModel) || /samsung/i.test(g.oem);
        const imageUrl = isSamsung
          ? '/src/assets/images/samsung_galaxy_lot_1793851025604.jpg'
          : g.totalQty > 8
            ? '/src/assets/images/iphone_lot_wholesale_inspection_1793849011081.jpg'
            : '/src/assets/images/iphone_16_pro_max_grade_a_1793849011033.jpg';

        const galleryImages = [
          imageUrl,
          '/src/assets/images/iphone_lot_wholesale_inspection_1793849011081.jpg',
          '/src/assets/images/hero_auction_warehouse_iphones_1793849010124.jpg'
        ];

        const primaryStorage = g.uniqueCapacities.length > 0
          ? g.uniqueCapacities.slice(0, 2).join(' / ')
          : '128GB';

        return {
          id: `vz-lot-${Date.now()}-${idx}`,
          lotNumber: g.lotNumber,
          title: g.title,
          modelFamily: g.primaryModel,
          oemBrand: g.oem,
          quantity: g.totalQty,
          grade: g.mappedGrade,
          primaryStorage,
          colorHighlights: g.uniqueColors.slice(0, 3),
          batteryHealthRange: '84% - 100% (Testado Verizon)',
          carrierStatus: 'Verizon Clean / Desbloqueado Global',
          imeiStatus: 'Clean ESN / 100% Verificado',
          auctionHouse: 'Verizon Direct Liquidation',
          location: 'Dallas, TX / Miami Hub',
          startingBidUsd: g.calculatedStartingBidUsd,
          currentBidUsd: g.calculatedCurrentBidUsd,
          reservePriceMet: true,
          estimatedBrazilRetailBrl: g.calculatedRetailBrl,
          totalBidsCount: Math.floor(Math.random() * 14) + 2,
          endTime: g.parsedEndTime,
          imageUrl,
          galleryImages,
          description: `Lote oficial do padrão VERIZON contendo ${g.totalQty} aparelho(s). Fontes de estoque: ${g.uniqueSources.join(', ') || 'Carrier Returns'}. Classificação técnica ${g.gradeRaw}.`,
          diagnosticReport: {
            faceId: true,
            trueTone: true,
            camerasPassed: true,
            batteryTested: true,
            cleanEsn: true,
            mdmFree: true
          },
          manifest: g.manifest,
          bidsHistory: [
            {
              id: `bid-vz-${idx}`,
              bidderName: 'Licitante EUA Inicial',
              amountUsd: g.calculatedCurrentBidUsd,
              timestamp: 'Início do Leilão'
            }
          ],
          originalListingUrl: g.url,
          listingUrl: g.url,
          sourceType: 'VERIZON'
        };
      });

      const finalLots = replaceExistingLots
        ? newLots
        : [...newLots, ...auctions];

      onUpdateAuctions(finalLots);
      try {
        localStorage.setItem('us_iphone_auctions_v1', JSON.stringify(finalLots));
      } catch (e) {}

      showNotice(`🎉 ${newLots.length} Lotes Oficiais VERIZON (${newLots.reduce((acc, l) => acc + l.quantity, 0)} aparelhos) publicados com sucesso no catálogo e painel do cliente!`, 'success');
      setAdminTab('lots');
    } catch (err: any) {
      showNotice(`Falha ao publicar lotes VERIZON: ${err?.message}`, 'error');
    }
  };

  // Publish Generic Custom Lots
  const handleApplyImport = () => {
    if (presetFormat === 'VERIZON' && verizonGroupedLots.length > 0) {
      handleApplyVerizonImport();
      return;
    }

    if (parsedPreviewRows.length === 0) {
      showNotice('Nenhum dado para importar.', 'error');
      return;
    }

    try {
      const newLots: AuctionLot[] = parsedPreviewRows.map((row, idx) => {
        const lotNumber = String(row[columnMapping.lotNumber] || `US-${Math.floor(10000 + Math.random() * 90000)}`);
        const title = String(row[columnMapping.title] || `Lote Importado iPhone ${idx + 1}`);
        const modelFamilyRaw = String(row[columnMapping.modelFamily] || 'iPhone 16 Pro Max');
        
        let modelFamily: string = 'iPhone 16 Pro Max';
        if (/16 pro max/i.test(modelFamilyRaw)) modelFamily = 'iPhone 16 Pro Max';
        else if (/16 pro/i.test(modelFamilyRaw)) modelFamily = 'iPhone 16 Pro';
        else if (/16/i.test(modelFamilyRaw)) modelFamily = 'iPhone 16 / 16 Plus';
        else if (/15 pro max/i.test(modelFamilyRaw)) modelFamily = 'iPhone 15 Pro Max';
        else if (/15 pro/i.test(modelFamilyRaw)) modelFamily = 'iPhone 15 Pro';
        else if (/15/i.test(modelFamilyRaw)) modelFamily = 'iPhone 15';
        else if (/14/i.test(modelFamilyRaw)) modelFamily = 'iPhone 14 Series';
        else modelFamily = modelFamilyRaw || 'Lote Misto';

        const grade = mapGrade(String(row[columnMapping.grade] || 'Grade A'));
        const quantity = Math.max(1, parseInt(String(row[columnMapping.quantity] || '1'), 10) || 1);
        const currentBidUsd = Math.max(100, parseFloat(String(row[columnMapping.currentBidUsd] || '500')) || 500);
        const startingBidUsd = Math.max(50, parseFloat(String(row[columnMapping.startingBidUsd] || String(currentBidUsd * 0.8))) || currentBidUsd * 0.8);
        const estimatedBrazilRetailBrl = parseFloat(String(row[columnMapping.estimatedRetailBrl] || String(currentBidUsd * usdRate * 1.5))) || (currentBidUsd * usdRate * 1.5);

        return {
          id: `lot-imported-${Date.now()}-${idx}`,
          lotNumber,
          title,
          modelFamily,
          quantity,
          grade,
          primaryStorage: String(row[columnMapping.storage] || '256GB'),
          colorHighlights: ['Titanium', 'Space Black'],
          batteryHealthRange: String(row[columnMapping.batteryHealth] || '90% - 100%'),
          carrierStatus: 'Factory Unlocked (Global)',
          imeiStatus: 'Clean ESN / 100% Verificado',
          auctionHouse: String(row[columnMapping.auctionHouse] || 'Verizon Direct US Liquidation'),
          location: String(row[columnMapping.location] || 'Miami, FL (Armazém 01)'),
          startingBidUsd,
          currentBidUsd,
          reservePriceMet: true,
          estimatedBrazilRetailBrl,
          totalBidsCount: Math.floor(Math.random() * 20) + 1,
          endTime: new Date(Date.now() + 1000 * 60 * 60 * (Math.floor(Math.random() * 8) + 2)).toISOString(),
          imageUrl: quantity > 1 ? '/src/assets/images/iphone_lot_wholesale_inspection_1793849011081.jpg' : '/src/assets/images/iphone_16_pro_max_grade_a_1793849011033.jpg',
          galleryImages: [
            '/src/assets/images/iphone_16_pro_max_grade_a_1793849011033.jpg',
            '/src/assets/images/iphone_lot_wholesale_inspection_1793849011081.jpg'
          ],
          description: `Lote importado via planilha administrativa. Contém ${quantity} aparelho(s) com certificação Clean ESN e laudo de 30 pontos.`,
          diagnosticReport: {
            faceId: true,
            trueTone: true,
            camerasPassed: true,
            batteryTested: true,
            cleanEsn: true,
            mdmFree: true
          },
          manifest: Array.from({ length: quantity }).map((_, mIdx) => ({
            id: `dev-imp-${idx}-${mIdx}`,
            model: modelFamily,
            storage: '256GB',
            color: 'Titanium',
            grade,
            batteryHealth: 90 + (mIdx % 10),
            imeiMasked: `359820******${String(100 + mIdx * 13).slice(-3)}`,
            carrierStatus: 'Factory Unlocked',
            icloudStatus: 'Clean / FMI OFF',
            screenCondition: 'Conforme Grade',
            housingCondition: 'Conforme Grade'
          })),
          bidsHistory: [
            {
              id: `bid-seed-${idx}`,
              bidderName: 'Licitante EUA Inicial',
              amountUsd: currentBidUsd,
              timestamp: 'Início do Leilão'
            }
          ],
          sourceType: 'CUSTOM'
        };
      });

      const finalLots = replaceExistingLots ? newLots : [...newLots, ...auctions];
      onUpdateAuctions(finalLots);
      try {
        localStorage.setItem('us_iphone_auctions_v1', JSON.stringify(finalLots));
      } catch (e) {}

      showNotice(`${newLots.length} lotes importados e publicados no catálogo com sucesso!`);
      setParsedPreviewRows([]);
      setUploadedFileName(null);
      setAdminTab('lots');
    } catch (err: any) {
      showNotice(`Falha na importação: ${err?.message}`, 'error');
    }
  };

  const handleDownloadTemplate = () => {
    const templateData = [
      {
        'Lote': 'US-99100-MIA',
        'Titulo': 'Palete 10x iPhone 16 Pro Max 256GB Desbloqueados',
        'Modelo': 'iPhone 16 Pro Max',
        'Quantidade': 10,
        'Grade': 'Grade A+',
        'Armazenamento': '256GB',
        'Saude Bateria': '95% - 100%',
        'Lance Inicial USD': 6000,
        'Lance Atual USD': 7200,
        'Revenda Brasil BRL': 79000,
        'Casa de Leilao': 'Verizon Direct US Liquidation',
        'Localizacao': 'Miami, FL'
      },
      {
        'Lote': 'US-99101-DAL',
        'Titulo': 'Lote 5x iPhone 15 Pro 128GB Grade A Natural Titanium',
        'Modelo': 'iPhone 15 Pro',
        'Quantidade': 5,
        'Grade': 'Grade A',
        'Armazenamento': '128GB',
        'Saude Bateria': '88% - 94%',
        'Lance Inicial USD': 2200,
        'Lance Atual USD': 2800,
        'Revenda Brasil BRL': 26000,
        'Casa de Leilao': 'Liquidation.com Enterprise',
        'Localizacao': 'Dallas, TX'
      },
      {
        'Lote': 'US-99102-MIA',
        'Titulo': '1x iPhone 16 Pro Max 512GB Desert Titanium (Unidade Avulsa)',
        'Modelo': 'iPhone 16 Pro Max',
        'Quantidade': 1,
        'Grade': 'Grade A+',
        'Armazenamento': '512GB',
        'Saude Bateria': '100%',
        'Lance Inicial USD': 650,
        'Lance Atual USD': 890,
        'Revenda Brasil BRL': 9200,
        'Casa de Leilao': 'Apple Certified Wholesale',
        'Localizacao': 'Miami, FL'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Modelo Leiloes');
    XLSX.writeFile(wb, 'planilha_modelo_leiloes_iphones.xlsx');
    showNotice('Planilha modelo Excel baixada com sucesso!');
  };

  // ----------------------------------------------------
  // CONEXÃO PHP / API & EXPORTAÇÃO ARQUIVO ÚNICO
  // ----------------------------------------------------
  const handleDownloadStandaloneHtml = async () => {
    try {
      const res = await fetch('/standalone_single_file.html');
      if (!res.ok) throw new Error('Arquivo standalone não encontrado.');
      const htmlText = await res.text();
      const blob = new Blob([htmlText], { type: 'text/html;charset=utf-8' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'leiloes_iphones_standalone.html';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showNotice('Arquivo único (leiloes_iphones_standalone.html) baixado com sucesso!');
    } catch (e: any) {
      showNotice(`Erro ao baixar arquivo único: ${e?.message}`, 'error');
    }
  };

  const handleTestPhpConnection = async () => {
    setPhpTestResult({ testing: true });
    try {
      const res = await apiService.testConnection(phpConfig.baseUrl);
      setPhpTestResult({
        testing: false,
        success: res.success,
        latencyMs: res.latencyMs,
        message: res.message
      });
      if (res.success) {
        showNotice(`Conexão PHP bem sucedida! (${res.latencyMs}ms)`, 'success');
      } else {
        showNotice('Falha ao conectar no PHP. O sistema operará em Modo Simulado.', 'error');
      }
    } catch (err: any) {
      setPhpTestResult({
        testing: false,
        success: false,
        latencyMs: 0,
        message: err?.message || 'Falha na conexão'
      });
      showNotice('Não foi possível conectar ao servidor PHP.', 'error');
    }
  };

  const handleSavePhpConfig = () => {
    apiService.updateConfig(phpConfig);
    showNotice(`Configurações de API PHP salvas! Modo ${phpConfig.enabled ? 'Ativo (Fetch Real)' : 'Simulado (LocalStorage)'}.`);
  };

  const PHP_SCRIPTS: Record<string, { filename: string; title: string; desc: string; code: string }> = {
    'auctions.php': {
      filename: 'auctions.php',
      title: 'API de Leilões (auctions.php)',
      desc: 'Lista todos os lotes (GET), salva novos lotes (POST) e remove lotes (DELETE).',
      code: `<?php
require_once __DIR__ . '/db.php';
$method = $_SERVER['REQUEST_METHOD'];
$pdo = getDbConnection();

if ($method === 'GET') {
    if ($pdo) {
        $stmt = $pdo->query("SELECT * FROM auctions ORDER BY id DESC");
        $lots = $stmt->fetchAll();
        foreach ($lots as &$lot) {
            $mStmt = $pdo->prepare("SELECT * FROM manifest_items WHERE lot_id = ?");
            $mStmt->execute([$lot['id']]);
            $lot['manifest'] = $mStmt->fetchAll();
        }
        jsonResponse(['success' => true, 'data' => $lots]);
    } else {
        $data = getJsonData();
        jsonResponse(['success' => true, 'data' => $data['auctions']]);
    }
}

if ($method === 'POST') {
    $raw = file_get_contents('php://input');
    $lot = json_decode($raw, true);
    // Insere ou atualiza o lote no MySQL
    jsonResponse(['success' => true, 'message' => 'Lote salvo!']);
}`
    },
    'bids.php': {
      filename: 'bids.php',
      title: 'API de Lances em Tempo Real (bids.php)',
      desc: 'Registra lances de arrematantes (POST) e faz polling a cada poucos segundos (GET ?poll=1).',
      code: `<?php
require_once __DIR__ . '/db.php';
$method = $_SERVER['REQUEST_METHOD'];
$pdo = getDbConnection();

if ($method === 'GET' && isset($_GET['poll'])) {
    if ($pdo) {
        $stmt = $pdo->query("SELECT * FROM bids ORDER BY id DESC LIMIT 1");
        $latest = $stmt->fetch();
        jsonResponse(['success' => true, 'latestBid' => $latest ? [
            'lotId' => $latest['lot_id'],
            'newBidAmount' => (float)$latest['amount_usd'],
            'bidderName' => $latest['bidder_name']
        ] : null]);
    }
}

if ($method === 'POST') {
    $payload = json_decode(file_get_contents('php://input'), true);
    // Registra lance e atualiza currentBidUsd do lote
    jsonResponse(['success' => true, 'message' => 'Lance homologado com sucesso!']);
}`
    },
    'import.php': {
      filename: 'import.php',
      title: 'Importador de Planilha VERIZON (import.php)',
      desc: 'Recebe o lote consolidado do frontend e grava em transação atômica no MySQL.',
      code: `<?php
require_once __DIR__ . '/db.php';
$payload = json_decode(file_get_contents('php://input'), true);
$lots = $payload['lots'] ?? [];

$pdo = getDbConnection();
if ($pdo) {
    $pdo->beginTransaction();
    foreach ($lots as $lot) {
        // Grava lote na tabela auctions e linhas na tabela manifest_items
    }
    $pdo->commit();
    jsonResponse(['success' => true, 'imported' => count($lots)]);
}`
    },
    'schema.sql': {
      filename: 'schema.sql',
      title: 'Estrutura SQL do Banco de Dados (schema.sql)',
      desc: 'Tabelas MySQL com chaves estrangeiras, índices e campos completos.',
      code: `CREATE DATABASE IF NOT EXISTS \`leiloes_iphones\` DEFAULT CHARACTER SET utf8mb4;
USE \`leiloes_iphones\`;

CREATE TABLE IF NOT EXISTS \`auctions\` (
  \`id\` VARCHAR(100) PRIMARY KEY,
  \`lotNumber\` VARCHAR(60) UNIQUE NOT NULL,
  \`title\` VARCHAR(255) NOT NULL,
  \`modelFamily\` VARCHAR(100) NOT NULL,
  \`quantity\` INT NOT NULL DEFAULT 1,
  \`grade\` VARCHAR(30) NOT NULL,
  \`currentBidUsd\` DECIMAL(10,2) NOT NULL,
  \`estimatedBrazilRetailBrl\` DECIMAL(12,2) NOT NULL,
  \`endTime\` DATETIME NOT NULL,
  \`sourceType\` VARCHAR(40) DEFAULT 'VERIZON'
);

CREATE TABLE IF NOT EXISTS \`manifest_items\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`lot_id\` VARCHAR(100) NOT NULL,
  \`model\` VARCHAR(100) NOT NULL,
  \`storage\` VARCHAR(50),
  \`part_number\` VARCHAR(60),
  \`inventory_source\` VARCHAR(80),
  \`qty\` INT NOT NULL DEFAULT 1,
  FOREIGN KEY (\`lot_id\`) REFERENCES \`auctions\`(\`id\`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS \`bids\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`lot_id\` VARCHAR(100) NOT NULL,
  \`bidder_name\` VARCHAR(120) NOT NULL,
  \`amount_usd\` DECIMAL(10,2) NOT NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`
    }
  };

  // ----------------------------------------------------
  // GESTÃO DE LOTES (EDIÇÃO RÁPIDA & EXCLUSÃO)
  // ----------------------------------------------------
  const [editingLotId, setEditingLotId] = useState<string | null>(null);
  const [editPriceUsd, setEditPriceUsd] = useState<number>(0);
  const [editGrade, setEditGrade] = useState<GradeType>('Grade A');

  const handleStartEdit = (lot: AuctionLot) => {
    setEditingLotId(lot.id);
    setEditPriceUsd(lot.currentBidUsd);
    setEditGrade(lot.grade);
  };

  const handleSaveEdit = (lotId: string) => {
    const updated = auctions.map(lot => {
      if (lot.id === lotId) {
        return {
          ...lot,
          currentBidUsd: editPriceUsd,
          grade: editGrade
        };
      }
      return lot;
    });
    onUpdateAuctions(updated);
    setEditingLotId(null);
    showNotice('Lote atualizado com sucesso no catálogo!');
  };

  const handleDeleteLot = (lotId: string) => {
    if (!confirm('Deseja realmente remover este lote do leilão?')) return;
    const updated = auctions.filter(l => l.id !== lotId);
    onUpdateAuctions(updated);
    showNotice('Lote removido do catálogo com sucesso!');
  };

  // ----------------------------------------------------
  // OFERTAS COMPUTADAS (OFFERS CONSOLE)
  // ----------------------------------------------------
  const [offersList, setOffersList] = useState<AdminOffer[]>(() => {
    try {
      const saved = localStorage.getItem('us_admin_offers_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return [
      {
        id: 'off-101',
        lotId: auctions[0]?.id || 'lot-1',
        lotNumber: auctions[0]?.lotNumber || 'US-89104',
        lotTitle: auctions[0]?.title || 'Lote Master 10x iPhone 16 Pro Max',
        clientName: 'Carlos Mendes (Tech Imports)',
        clientEmail: 'carlos.mendes@importtech.com.br',
        amountUsd: 7450,
        amountBrl: 7450 * usdRate,
        timestamp: 'Hoje, 14:32',
        status: 'Vencendo',
        isAutoSniper: true
      },
      {
        id: 'off-102',
        lotId: auctions[1]?.id || 'lot-2',
        lotNumber: auctions[1]?.lotNumber || 'US-77402',
        lotTitle: 'Lote 5x iPhone 15 Pro 128GB Grade A',
        clientName: 'Pedro Apple Reseller SP',
        clientEmail: 'pedro@applereseller.com.br',
        amountUsd: 2850,
        amountBrl: 2850 * usdRate,
        timestamp: 'Hoje, 13:50',
        status: 'Homologada / Arrematada'
      },
      {
        id: 'off-103',
        lotId: auctions[2]?.id || 'lot-3',
        lotNumber: auctions[2]?.lotNumber || 'US-90311',
        lotTitle: '1x iPhone 16 Pro Max 512GB Desert Titanium',
        clientName: 'Vitor Importações Sul',
        clientEmail: 'vitor.imports@gmail.com',
        amountUsd: 890,
        amountBrl: 890 * usdRate,
        timestamp: 'Hoje, 12:15',
        status: 'Vencendo'
      }
    ];
  });

  const handleUpdateOfferStatus = (offerId: string, newStatus: AdminOffer['status']) => {
    setOffersList(prev => {
      const updated = prev.map(o => o.id === offerId ? { ...o, status: newStatus } : o);
      try {
        localStorage.setItem('us_admin_offers_v1', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    showNotice(`Status da oferta alterado para "${newStatus}"!`);
  };

  const handleExportOffersCsv = () => {
    const ws = XLSX.utils.json_to_sheet(offersList);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Ofertas');
    XLSX.writeFile(wb, 'relatorio_ofertas_computadas.xlsx');
    showNotice('Relatório de ofertas exportado em Excel!');
  };

  // ----------------------------------------------------
  // CLIENTES / PAINEL DE ARREMATANTES
  // ----------------------------------------------------
  const [clientsList, setClientsList] = useState<SystemUser[]>([
    currentUser,
    {
      name: 'EletroCell Lojistas Associados',
      email: 'compras@eletrocell.com.br',
      cpfCnpj: '24.119.802/0001-90',
      phone: '+55 (31) 98765-4321',
      biddingLimitUsd: 50000,
      verifiedStatus: true,
      registeredDate: '15/01/2026'
    },
    {
      name: 'Rodrigo Barbosa Silva',
      email: 'rodrigo.silva@gmail.com',
      cpfCnpj: '348.910.228-11',
      phone: '+55 (21) 97722-3344',
      biddingLimitUsd: 10000,
      verifiedStatus: false,
      registeredDate: '03/02/2026'
    }
  ]);

  const handleToggleClientVerify = (idx: number) => {
    setClientsList(prev => prev.map((c, i) => i === idx ? { ...c, verifiedStatus: !c.verifiedStatus } : c));
    showNotice('Status do cliente atualizado com sucesso!');
  };

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-slate-200 space-y-8">
      {/* Top Banner Notice */}
      {notification && (
        <div className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2 border animate-in fade-in ${
          notification.type === 'success'
            ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
            : 'bg-rose-500/10 border-rose-500/40 text-rose-300'
        }`}>
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-mono font-bold">
              USAFAST LEILÕES HUB · ADMIN
            </span>
            <span className="text-xs text-slate-500">·</span>
            <span className="text-xs text-emerald-400 font-mono">
              PTAX: R$ {usdRate.toFixed(2)}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
            USAFAST LEILÕES HUB — Painel Executivo
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Dashboard de pregões, gestão de ofertas computadas, importação de planilhas (Excel, CSV & XML) e controle de arrematações.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleDownloadStandaloneHtml}
            className="px-3.5 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-md shadow-amber-400/20 active:scale-95"
            title="Baixar sistema completo em arquivo único puro (HTML/JS com Tailwind, SheetJS e Leilões)"
          >
            <Download className="w-3.5 h-3.5" />
            <span>📥 Baixar Arquivo Único (HTML/JS Puro)</span>
          </button>
          <button
            onClick={handleDownloadTemplate}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5"
            title="Baixar planilha modelo no formato Excel"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>Planilha Modelo (XLSX)</span>
          </button>
          {onLogout && (
            <button
              onClick={onLogout}
              className="px-3 py-2 bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
              title="Encerrar sessão de administrador"
            >
              <Lock className="w-3.5 h-3.5 text-rose-400" />
              <span>Sair</span>
            </button>
          )}
        </div>
      </div>

      {/* Admin Tabs Bar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-2 text-xs font-semibold">
        <button
          onClick={() => setAdminTab('dashboard')}
          className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-2 ${
            adminTab === 'dashboard'
              ? 'bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-400/10'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Dashboard Geral</span>
        </button>

        <button
          onClick={() => setAdminTab('offers')}
          className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-2 ${
            adminTab === 'offers'
              ? 'bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-400/10'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Ofertas Computadas ({offersList.length})</span>
        </button>

        <button
          onClick={() => setAdminTab('upload')}
          className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-2 ${
            adminTab === 'upload'
              ? 'bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-400/10'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Upload className="w-4 h-4" />
          <span>Importar Planilhas (Excel, CSV & XML)</span>
        </button>

        <button
          onClick={() => setAdminTab('lots')}
          className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-2 ${
            adminTab === 'lots'
              ? 'bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-400/10'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Gavel className="w-4 h-4" />
          <span>Gerenciar Leilões ({auctions.length})</span>
        </button>

        <button
          onClick={() => setAdminTab('clients')}
          className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-2 ${
            adminTab === 'clients'
              ? 'bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-400/10'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Painel de Clientes ({clientsList.length})</span>
        </button>

        <button
          onClick={() => setAdminTab('php-api')}
          className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-2 border ${
            adminTab === 'php-api'
              ? 'bg-emerald-400 text-slate-950 font-bold border-emerald-400 shadow-md shadow-emerald-400/10'
              : 'border-slate-800 text-emerald-400 hover:text-white hover:bg-emerald-950/20'
          }`}
        >
          <Server className="w-4 h-4" />
          <span>Conexão API PHP & Arquivo Único</span>
          <span className={`w-2 h-2 rounded-full ${phpConfig.enabled ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
        </button>

        <button
          onClick={() => setAdminTab('settings')}
          className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-2 ${
            adminTab === 'settings'
              ? 'bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-400/10'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Configurações & Cotação</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 0: DASHBOARD EXECUTIVO USAFAST LEILÕES HUB */}
      {/* ======================================================== */}
      {adminTab === 'dashboard' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Top Operational Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
            <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-[11px]">
                <span>Lotes Ativos</span>
                <Gavel className="w-4 h-4 text-amber-400" />
              </div>
              <span className="text-2xl font-black text-white font-mono block">
                {auctions.length}
              </span>
              <span className="text-[10px] text-emerald-400 block font-medium">
                {auctions.filter(a => a.sourceType === 'VERIZON').length} lotes Padrão Oficial VERIZON
              </span>
            </div>

            <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-[11px]">
                <span>Total de Aparelhos</span>
                <Smartphone className="w-4 h-4 text-cyan-400" />
              </div>
              <span className="text-2xl font-black text-cyan-300 font-mono block">
                {auctions.reduce((acc, l) => acc + l.quantity, 0).toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-400 block">
                Unidades em disputa nos EUA
              </span>
            </div>

            <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-[11px]">
                <span>Volume em Pregão (USD)</span>
                <DollarSign className="w-4 h-4 text-emerald-400" />
              </div>
              <span className="text-2xl font-black text-emerald-400 font-mono block">
                ${auctions.reduce((acc, l) => acc + l.currentBidUsd, 0).toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-400 block font-mono">
                ≈ R$ {(auctions.reduce((acc, l) => acc + l.currentBidUsd, 0) * usdRate).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
              </span>
            </div>

            <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-[11px]">
                <span>Ofertas Computadas</span>
                <TrendingUp className="w-4 h-4 text-amber-400" />
              </div>
              <span className="text-2xl font-black text-amber-400 font-mono block">
                {offersList.length}
              </span>
              <span className="text-[10px] text-emerald-400 block">
                {offersList.filter(o => o.status === 'Vencendo').length} ofertas vencedoras
              </span>
            </div>

            <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-1 col-span-2 lg:col-span-1">
              <div className="flex items-center justify-between text-slate-400 text-[11px]">
                <span>Arrematantes</span>
                <Users className="w-4 h-4 text-purple-400" />
              </div>
              <span className="text-2xl font-black text-white font-mono block">
                {clientsList.length}
              </span>
              <span className="text-[10px] text-emerald-400 block">
                {clientsList.filter(c => c.verifiedStatus).length} verificados com limite
              </span>
            </div>
          </div>

          {/* Quick Action Shortcuts */}
          <div className="p-4 bg-gradient-to-r from-slate-900 via-amber-950/20 to-slate-900 border border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-slate-300">
                Ações rápidas da central <strong className="text-white">USAFAST LEILÕES HUB</strong>:
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setAdminTab('upload')}
                className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Importar Planilha (Excel / XML)</span>
              </button>
              <button
                onClick={() => setAdminTab('offers')}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5 font-medium"
              >
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                <span>Gerenciar Ofertas ({offersList.length})</span>
              </button>
              <button
                onClick={() => setAdminTab('lots')}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5 font-medium"
              >
                <Gavel className="w-3.5 h-3.5 text-amber-400" />
                <span>Ver Todos os Lotes</span>
              </button>
            </div>
          </div>

          {/* Analytical Charts and Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Model Family Breakdown */}
            <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-amber-400" />
                  <span>Distribuição por Modelo de Smartphone</span>
                </h3>
                <span className="text-[11px] text-slate-400 font-mono">
                  {auctions.length} lotes catalogados
                </span>
              </div>
              <div className="space-y-3 text-xs">
                {Array.from(new Set(auctions.map(a => a.modelFamily))).slice(0, 5).map(model => {
                  const count = auctions.filter(a => a.modelFamily === model).length;
                  const pct = Math.round((count / auctions.length) * 100) || 10;
                  return (
                    <div key={model} className="space-y-1">
                      <div className="flex justify-between text-slate-300 text-[11px]">
                        <span className="font-medium text-white">{model}</span>
                        <span className="font-mono text-amber-400">{count} lote(s) · {pct}%</span>
                      </div>
                      <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                        <div
                          className="bg-gradient-to-r from-amber-500 to-amber-300 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Aesthetic Grade Breakdown */}
            <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Distribuição por Grade Estético</span>
                </h3>
                <span className="text-[11px] text-slate-400 font-mono">
                  Laudo 30 pontos
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                {(['Grade A+', 'Grade A', 'Grade B', 'Grade C'] as GradeType[]).map(grade => {
                  const lotsWithGrade = auctions.filter(a => a.grade === grade);
                  const totalGradeUnits = lotsWithGrade.reduce((acc, l) => acc + l.quantity, 0);
                  return (
                    <div key={grade} className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-xs">{grade}</span>
                        <span className="text-[10px] text-amber-400 font-mono">{lotsWithGrade.length} lotes</span>
                      </div>
                      <span className="text-lg font-black text-slate-200 font-mono block">
                        {totalGradeUnits} aparelhos
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        {grade === 'Grade A+' ? 'Zero detalhes (Mint)' : grade === 'Grade A' ? 'Excelente estado' : grade === 'Grade B' ? 'Marcas leves' : 'Econômico'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Recent Live Computed Offers Feed */}
          <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  <span>Últimas Ofertas Computadas pelos Clientes</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Lances enviados em tempo real através do painel do cliente USAFAST
                </p>
              </div>
              <button
                onClick={() => setAdminTab('offers')}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors"
              >
                Ver Todas as Ofertas ({offersList.length}) →
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[11px] bg-slate-950/40">
                    <th className="py-2.5 px-3">Horário</th>
                    <th className="py-2.5 px-3">Lote</th>
                    <th className="py-2.5 px-3">Arrematante</th>
                    <th className="py-2.5 px-3">Oferta (USD)</th>
                    <th className="py-2.5 px-3">Valor (BRL)</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {offersList.slice(0, 5).map(offer => (
                    <tr key={offer.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px]">{offer.timestamp}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-amber-400">{offer.lotNumber}</td>
                      <td className="py-2.5 px-3 font-semibold text-white">{offer.clientName}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-emerald-400">${offer.amountUsd.toLocaleString()} USD</td>
                      <td className="py-2.5 px-3 font-mono text-slate-300">R$ {offer.amountBrl.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          offer.status === 'Vencendo'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : offer.status === 'Homologada / Arrematada'
                            ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}>
                          {offer.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => handleUpdateOfferStatus(offer.id, 'Homologada / Arrematada')}
                          className="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40 rounded text-[11px] font-medium transition-colors"
                        >
                          Homologar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 1: UPLOAD / IMPORTAR (EXCEL, CSV & XML) */}
      {/* ======================================================== */}
      {adminTab === 'upload' && (
        <div className="space-y-6">
          {/* Verizon Featured Banner */}
          <div className="p-6 bg-gradient-to-r from-red-950/40 via-slate-900 to-amber-950/30 border border-red-500/40 rounded-2xl space-y-4 shadow-xl">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded bg-red-600 text-white font-black text-[11px] tracking-wider uppercase shadow-md">
                    PADRÃO VERIZON
                  </span>
                  <span className="px-2.5 py-0.5 rounded bg-slate-800 text-amber-400 border border-amber-500/30 font-mono text-[11px]">
                    US Carrier Wholesale Standard
                  </span>
                </div>
                <h2 className="text-xl font-black text-white tracking-tight">
                  Importador Especializado de Leilões VERIZON (Arquivo Anexado)
                </h2>
                <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                  Reconhece o layout exato com as 16 colunas oficiais (<span className="text-amber-300 font-mono">Lot #, Title, Qty, OEM, Model, Item Description, Part #, Category, Grade, Capacity, Color, Inventory Source, End Date, End Time, URL</span>) e agrupa automaticamente linhas com o mesmo número de lote.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <button
                  type="button"
                  disabled={isLoadingVerizon}
                  onClick={handleLoadAttachedVerizonCsv}
                  className="px-4 py-2.5 bg-red-600 hover:bg-red-500 disabled:bg-slate-800 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 active:scale-95"
                >
                  {isLoadingVerizon ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <FileSpreadsheet className="w-4 h-4 text-white" />
                  )}
                  <span>
                    {isLoadingVerizon ? 'Lendo e Agrupando...' : '⚡ Carregar CSV VERIZON Oficial (Anexo)'}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={handleLoadSampleXml}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-sm"
                  title="Testar importação com XML modelo da Verizon"
                >
                  <Code className="w-4 h-4 text-amber-400" />
                  <span>⚡ Carregar Exemplo XML (Verizon)</span>
                </button>
              </div>
            </div>
          </div>

          <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-5">
            {/* Format & Mode Selector Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs font-bold text-slate-300 block">Formato de Importação:</span>
                <div className="flex items-center gap-2 mt-1.5">
                  <button
                    type="button"
                    onClick={() => setPresetFormat('VERIZON')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      presetFormat === 'VERIZON'
                        ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    <span>★ Padrão VERIZON Oficial (Agrupado por Lote #)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPresetFormat('GENERIC')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      presetFormat === 'GENERIC'
                        ? 'bg-amber-400 text-slate-950 font-bold'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    <span>Padrão Custom / Genérico (1 linha por lote)</span>
                  </button>
                </div>
              </div>

              {/* Upload Mode Tabs */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setUploadMode('file')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                    uploadMode === 'file'
                      ? 'bg-slate-700 text-white font-bold'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Arquivo (.xlsx / .csv / .xml)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setUploadMode('paste')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                    uploadMode === 'paste'
                      ? 'bg-slate-700 text-white font-bold'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Colar Texto ou XML (Ctrl+V)</span>
                </button>
              </div>
            </div>

            {/* Mode 1: Drag & Drop File Zone */}
            {uploadMode === 'file' ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-700 hover:border-red-500/80 rounded-2xl p-6 sm:p-10 text-center cursor-pointer bg-slate-950/40 hover:bg-slate-950/80 transition-all space-y-3"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".xlsx, .xls, .csv, .xml, text/xml, application/xml"
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center mx-auto">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <span className="text-sm font-bold text-white block">
                    {uploadedFileName ? `Arquivo Carregado: ${uploadedFileName}` : 'Clique para subir ou arraste sua planilha VERIZON aqui'}
                  </span>
                  <span className="text-xs text-slate-400 block">
                    Formatos aceitos: Microsoft Excel (.xlsx, .xls), CSV (.csv) e Arquivos XML (.xml)
                  </span>
                  <span className="text-[11px] text-amber-400/90 block font-medium">
                    💡 Caso sua planilha esteja em XML e você não consiga anexar, use a aba "Colar Texto ou XML" ao lado!
                  </span>
                </div>
              </div>
            ) : (
              /* Mode 2: Paste Direct from Excel or Paste XML */
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-slate-300 block font-medium">
                    Cole abaixo as linhas copiadas do Excel, CSV ou o código XML da sua planilha:
                  </label>
                  <button
                    type="button"
                    onClick={() => setPasteText(SAMPLE_VERIZON_XML)}
                    className="text-amber-400 hover:underline text-[11px] font-semibold"
                  >
                    Inserir Exemplo de XML no Campo
                  </button>
                </div>
                <textarea
                  rows={8}
                  value={pasteText}
                  onChange={e => setPasteText(e.target.value)}
                  placeholder="Cole aqui linhas tabulares do Excel OU o código XML completo (ex: <?xml version='1.0'?> <Workbook>... ou <listings><listing>...)"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-red-400"
                />
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleProcessPastedText}
                    className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-2 shadow-md shadow-red-600/20"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Processar Dados Colados (Excel / CSV / XML)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPasteText('')}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs transition-colors"
                  >
                    Limpar Campo
                  </button>
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 pt-2 border-t border-slate-800">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Compatível com exportações oficiais Verizon Wireless Returns, AT&T Liquidation e operadoras dos EUA.
              </span>
              <button
                onClick={handleDownloadTemplate}
                className="text-amber-400 hover:underline font-semibold"
              >
                Baixar Planilha Modelo Exemplo (.xlsx) ➔
              </button>
            </div>
          </div>

          {/* ======================================================== */}
          {/* VERIZON PREVIEW & PUBLISH CONSOLE */}
          {/* ======================================================== */}
          {presetFormat === 'VERIZON' && verizonGroupedLots.length > 0 && (
            <div className="space-y-6 p-6 bg-slate-900/90 border border-red-500/40 rounded-2xl shadow-2xl">
              {/* Header & Stats Banner */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded bg-red-600 text-white text-[10px] font-black uppercase">
                      VERIZON OFICIAL PRONTO
                    </span>
                    <h3 className="font-black text-white text-lg">
                      {verizonGroupedLots.length} Lotes Agrupados Detectados ({verizonGroupedLots.reduce((acc, l) => acc + l.totalQty, 0).toLocaleString()} Aparelhos)
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Cada lote foi unificado a partir de suas respectivas linhas de manifesto com IMEI mascarado, capacidade e operadora limpa.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={handleApplyVerizonImport}
                    className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-95"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Publicar {verizonGroupedLots.length} Lotes no Catálogo & Painel</span>
                  </button>
                </div>
              </div>

              {/* Price Multiplier & Settings Bar */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-950 rounded-xl border border-slate-800">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                    <span>Custo Base Estimado por Aparelho (USD):</span>
                    <span className="text-amber-400 font-mono font-black">${verizonUnitRate} USD</span>
                  </label>
                  <input
                    type="range"
                    min="30"
                    max="200"
                    step="5"
                    value={verizonUnitRate}
                    onChange={e => handleRecalculateVerizonRate(parseInt(e.target.value, 10) || 85)}
                    className="w-full accent-amber-400 cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-500 block">
                    Ajuste dinâmico do lance wholesale por unidade nos lotes (multiplica pela quantidade de aparelhos).
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Modo de Publicação no Catálogo:</label>
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer bg-slate-900 p-2.5 rounded-lg border border-slate-800 hover:border-slate-700">
                    <input
                      type="checkbox"
                      checked={replaceExistingLots}
                      onChange={e => setReplaceExistingLots(e.target.checked)}
                      className="accent-amber-400 rounded w-4 h-4"
                    />
                    <span>Substituir leilões mock pelos 50 lotes oficiais VERIZON</span>
                  </label>
                </div>

                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-slate-300 block">Resumo do Catálogo VERIZON:</span>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300 font-mono">
                      {verizonGroupedLots.length} Lotes
                    </span>
                    <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-emerald-400 font-mono font-bold">
                      {verizonGroupedLots.reduce((acc, l) => acc + l.totalQty, 0).toLocaleString()} Aparelhos
                    </span>
                  </div>
                </div>
              </div>

              {/* Grouped Lots Accordion Preview Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold text-slate-300">Prévia dos Lotes Agrupados:</span>
                  <span>Clique em &quot;Ver Manifesto&quot; para auditar cada aparelho</span>
                </div>

                <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950 divide-y divide-slate-800/80 max-h-[500px] overflow-y-auto">
                  {verizonGroupedLots.map((lot, idx) => {
                    const isExpanded = verizonExpandedLot === lot.lotNumber;
                    return (
                      <div key={lot.lotNumber} className="transition-colors hover:bg-slate-900/40">
                        {/* Summary Row */}
                        <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <span className="font-mono text-xs px-2 py-1 rounded bg-red-500/10 text-red-400 border border-red-500/30 font-bold shrink-0">
                              #{idx + 1} · {lot.lotNumber}
                            </span>
                            <div className="min-w-0 flex-1">
                              <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                                {lot.title}
                              </h4>
                              <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-slate-400">
                                <span className="text-slate-300 font-medium">{lot.primaryModel}</span>
                                <span>·</span>
                                <span className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-400 font-mono font-bold">
                                  {lot.totalQty} unidades
                                </span>
                                <span>·</span>
                                <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                                  {lot.mappedGrade} ({lot.gradeRaw})
                                </span>
                                <span>·</span>
                                <span>Fontes: {lot.uniqueSources.slice(0, 2).join(', ') || 'Carrier'}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <div className="text-right">
                              <span className="text-xs font-mono font-black text-emerald-400 block">
                                ${lot.calculatedCurrentBidUsd.toLocaleString()} USD
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono block">
                                R$ {lot.calculatedRetailBrl.toLocaleString('pt-BR')} (Revenda BR)
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() => setVerizonExpandedLot(isExpanded ? null : lot.lotNumber)}
                              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                            >
                              <Layers className="w-3.5 h-3.5 text-amber-400" />
                              <span>{isExpanded ? 'Ocultar' : `Manifesto (${lot.manifest.length})`}</span>
                            </button>
                          </div>
                        </div>

                        {/* Expanded Manifest Accordion */}
                        {isExpanded && (
                          <div className="p-4 bg-slate-900/80 border-t border-slate-800 space-y-3">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-white flex items-center gap-1.5">
                                <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                                Itens e Especificações de Peças do Lote {lot.lotNumber}
                              </span>
                              {lot.url && (
                                <a
                                  href={lot.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-amber-400 hover:underline flex items-center gap-1 text-[11px]"
                                >
                                  <span>Ver anúncio oficial do lote ↗</span>
                                </a>
                              )}
                            </div>

                            <div className="overflow-x-auto max-h-48 overflow-y-auto rounded-lg border border-slate-800">
                              <table className="w-full text-left text-[11px] border-collapse bg-slate-950">
                                <thead>
                                  <tr className="border-b border-slate-800 text-slate-400 bg-slate-900/90">
                                    <th className="py-1.5 px-2.5">Qtd</th>
                                    <th className="py-1.5 px-2.5">Modelo</th>
                                    <th className="py-1.5 px-2.5">Memória</th>
                                    <th className="py-1.5 px-2.5">Part #</th>
                                    <th className="py-1.5 px-2.5">Descrição da Peça</th>
                                    <th className="py-1.5 px-2.5">Origem</th>
                                    <th className="py-1.5 px-2.5">Grade</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                                  {lot.manifest.map((item, mIdx) => (
                                    <tr key={mIdx} className="hover:bg-slate-900/50">
                                      <td className="py-1.5 px-2.5 font-mono text-amber-400 font-bold">{item.qty || 1}x</td>
                                      <td className="py-1.5 px-2.5 font-medium text-white">{item.model}</td>
                                      <td className="py-1.5 px-2.5 font-mono">{item.storage}</td>
                                      <td className="py-1.5 px-2.5 font-mono text-slate-400">{item.partNumber || '-'}</td>
                                      <td className="py-1.5 px-2.5 text-slate-300 truncate max-w-[200px]" title={item.itemDescription}>
                                        {item.itemDescription || '-'}
                                      </td>
                                      <td className="py-1.5 px-2.5">
                                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300">
                                          {item.inventorySource || 'Return'}
                                        </span>
                                      </td>
                                      <td className="py-1.5 px-2.5">{item.grade}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* GENERIC PREVIEW & MAPPING CONSOLE */}
          {/* ======================================================== */}
          {presetFormat === 'GENERIC' && parsedPreviewRows.length > 0 && (
            <div className="space-y-4 p-6 bg-slate-900/70 border border-amber-500/30 rounded-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-white text-base">
                    Mapeamento de Colunas ({parsedPreviewRows.length} linhas prontas)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Confira se os campos da sua planilha correspondem aos atributos do leilão
                  </p>
                </div>

                <button
                  onClick={handleApplyImport}
                  className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-colors flex items-center gap-2 shadow-lg shadow-emerald-500/20"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Publicar {parsedPreviewRows.length} Lotes no Catálogo Agora</span>
                </button>
              </div>

              {/* Mapping Selectors Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs p-4 bg-slate-950 rounded-xl border border-slate-800">
                <div>
                  <label className="text-slate-400 block mb-1 font-medium">Lote / ID:</label>
                  <select
                    value={columnMapping.lotNumber}
                    onChange={e => setColumnMapping({ ...columnMapping, lotNumber: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-white"
                  >
                    {rawHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-medium">Título do Lote:</label>
                  <select
                    value={columnMapping.title}
                    onChange={e => setColumnMapping({ ...columnMapping, title: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-white"
                  >
                    {rawHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-medium">Modelo Aparelho:</label>
                  <select
                    value={columnMapping.modelFamily}
                    onChange={e => setColumnMapping({ ...columnMapping, modelFamily: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-white"
                  >
                    {rawHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-medium">Grade (A+, A, B, C):</label>
                  <select
                    value={columnMapping.grade}
                    onChange={e => setColumnMapping({ ...columnMapping, grade: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-white"
                  >
                    {rawHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-medium">Quantidade (Qtd):</label>
                  <select
                    value={columnMapping.quantity}
                    onChange={e => setColumnMapping({ ...columnMapping, quantity: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-white"
                  >
                    {rawHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-medium">Lance Atual USD ($):</label>
                  <select
                    value={columnMapping.currentBidUsd}
                    onChange={e => setColumnMapping({ ...columnMapping, currentBidUsd: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-white"
                  >
                    {rawHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-medium">Casa de Leilão:</label>
                  <select
                    value={columnMapping.auctionHouse}
                    onChange={e => setColumnMapping({ ...columnMapping, auctionHouse: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-white"
                  >
                    {rawHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-medium">Localização / Galpão:</label>
                  <select
                    value={columnMapping.location}
                    onChange={e => setColumnMapping({ ...columnMapping, location: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-white"
                  >
                    {rawHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
              </div>

              {/* Preview Table of Rows */}
              <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-950 max-h-64 overflow-y-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-900 text-slate-400 text-[11px]">
                      <th className="py-2 px-3">#</th>
                      <th className="py-2 px-3">Lote</th>
                      <th className="py-2 px-3">Título</th>
                      <th className="py-2 px-3">Modelo</th>
                      <th className="py-2 px-3">Qtd</th>
                      <th className="py-2 px-3">Grade</th>
                      <th className="py-2 px-3">Lance USD</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {parsedPreviewRows.slice(0, 10).map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/40">
                        <td className="py-2 px-3 font-mono text-slate-500">{idx + 1}</td>
                        <td className="py-2 px-3 font-mono font-bold text-amber-400">{row[columnMapping.lotNumber] || '-'}</td>
                        <td className="py-2 px-3 font-semibold text-white truncate max-w-[200px]">{row[columnMapping.title] || '-'}</td>
                        <td className="py-2 px-3">{row[columnMapping.modelFamily] || '-'}</td>
                        <td className="py-2 px-3 font-mono">{row[columnMapping.quantity] || '1'}</td>
                        <td className="py-2 px-3">{row[columnMapping.grade] || 'Grade A'}</td>
                        <td className="py-2 px-3 font-mono text-emerald-400">${row[columnMapping.currentBidUsd] || '0'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: GERENCIAR LEILÕES (EDIÇÃO & STATUS) */}
      {/* ======================================================== */}
      {adminTab === 'lots' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-white">Catálogo de Leilões em Andamento</h2>
              <p className="text-xs text-slate-400">Edite lances atuais, altere grades ou remova lotes encerrados</p>
            </div>
            <button
              onClick={() => setAdminTab('upload')}
              className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Importar Mais Lotes (Excel)</span>
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-800 rounded-2xl bg-slate-900/60">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 text-[11px]">
                  <th className="py-3 px-3">Lote</th>
                  <th className="py-3 px-3">Título</th>
                  <th className="py-3 px-3">Qtd</th>
                  <th className="py-3 px-3">Grade</th>
                  <th className="py-3 px-3">Lance Atual (USD)</th>
                  <th className="py-3 px-3">Revenda Brasil</th>
                  <th className="py-3 px-3">Origem</th>
                  <th className="py-3 px-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {auctions.map(lot => {
                  const isEditing = editingLotId === lot.id;
                  return (
                    <tr key={lot.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-amber-400">{lot.lotNumber}</td>
                      <td className="py-3 px-3">
                        <span className="font-semibold text-white block truncate max-w-[240px]">{lot.title}</span>
                        <span className="text-[10px] text-slate-400">{lot.modelFamily} · {lot.primaryStorage}</span>
                      </td>
                      <td className="py-3 px-3 font-mono">{lot.quantity} un</td>
                      <td className="py-3 px-3">
                        {isEditing ? (
                          <select
                            value={editGrade}
                            onChange={e => setEditGrade(e.target.value as GradeType)}
                            className="bg-slate-950 border border-slate-700 rounded px-1.5 py-1 text-xs text-white"
                          >
                            <option value="Grade A+">Grade A+</option>
                            <option value="Grade A">Grade A</option>
                            <option value="Grade B">Grade B</option>
                            <option value="Grade C">Grade C</option>
                            <option value="CPO Refurbished">CPO Refurbished</option>
                          </select>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-800 border border-slate-700">
                            {lot.grade}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        {isEditing ? (
                          <input
                            type="number"
                            value={editPriceUsd}
                            onChange={e => setEditPriceUsd(Number(e.target.value))}
                            className="w-24 bg-slate-950 border border-slate-700 rounded px-2 py-1 font-mono text-emerald-400"
                          />
                        ) : (
                          <span className="font-mono font-bold text-emerald-400">
                            ${lot.currentBidUsd.toLocaleString()} USD
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-300">
                        R$ {lot.estimatedBrazilRetailBrl.toLocaleString('pt-BR')}
                      </td>
                      <td className="py-3 px-3 text-slate-400 truncate max-w-[120px]">
                        {lot.location}
                      </td>
                      <td className="py-3 px-3 text-right">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleSaveEdit(lot.id)}
                              className="px-2.5 py-1 bg-emerald-500 text-slate-950 font-bold rounded text-[11px]"
                            >
                              Salvar
                            </button>
                            <button
                              onClick={() => setEditingLotId(null)}
                              className="px-2 py-1 bg-slate-800 text-slate-300 rounded text-[11px]"
                            >
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleStartEdit(lot)}
                              className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded transition-colors"
                              title="Editar preço e grade"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteLot(lot.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
                              title="Excluir lote"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: OFERTAS COMPUTADAS (OFFERS CONSOLE) */}
      {/* ======================================================== */}
      {adminTab === 'offers' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-white">Central de Ofertas Computadas (Offers)</h2>
              <p className="text-xs text-slate-400">
                Lances e ofertas enviadas pelos arrematantes brasileiros em tempo real
              </p>
            </div>

            <button
              onClick={handleExportOffersCsv}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar Ofertas (Excel)</span>
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-800 rounded-2xl bg-slate-900/60">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 text-[11px]">
                  <th className="py-3 px-3">Data / Hora</th>
                  <th className="py-3 px-3">Lote</th>
                  <th className="py-3 px-3">Arrematante / Cliente</th>
                  <th className="py-3 px-3">Valor USD</th>
                  <th className="py-3 px-3">Valor BRL (PTAX)</th>
                  <th className="py-3 px-3">Status da Oferta</th>
                  <th className="py-3 px-3 text-right">Gerenciar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {offersList.map(offer => (
                  <tr key={offer.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3 text-slate-400">{offer.timestamp}</td>
                    <td className="py-3 px-3">
                      <span className="font-mono font-bold text-amber-400 block">{offer.lotNumber}</span>
                      <span className="text-[10px] text-slate-400 truncate max-w-[160px] block">{offer.lotTitle}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-semibold text-white block">{offer.clientName}</span>
                      <span className="text-[10px] text-slate-400">{offer.clientEmail}</span>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-amber-400">
                      ${offer.amountUsd.toLocaleString()} USD
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-200">
                      R$ {offer.amountBrl.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                        offer.status === 'Vencendo'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : offer.status === 'Homologada / Arrematada'
                          ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}>
                        {offer.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleUpdateOfferStatus(offer.id, 'Homologada / Arrematada')}
                          className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-semibold"
                          title="Homologar arrematação"
                        >
                          Homologar
                        </button>
                        <button
                          onClick={() => handleUpdateOfferStatus(offer.id, 'Superada')}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px]"
                          title="Marcar como superada"
                        >
                          Superar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: CLIENTES & PAINEL DE ARREMATANTES */}
      {/* ======================================================== */}
      {adminTab === 'clients' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-white">Base de Arrematantes Credenciados</h2>
              <p className="text-xs text-slate-400">
                Controle os limites em dólares e aprovação de habilitação cadastral
              </p>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-800 rounded-2xl bg-slate-900/60">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 text-[11px]">
                  <th className="py-3 px-3">Arrematante / Razão Social</th>
                  <th className="py-3 px-3">E-mail</th>
                  <th className="py-3 px-3">CPF / CNPJ</th>
                  <th className="py-3 px-3">Telefone WhatsApp</th>
                  <th className="py-3 px-3">Limite de Arrematação</th>
                  <th className="py-3 px-3">Status de Habilitação</th>
                  <th className="py-3 px-3 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {clientsList.map((client, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3 font-semibold text-white">{client.name}</td>
                    <td className="py-3 px-3 text-slate-400">{client.email}</td>
                    <td className="py-3 px-3 font-mono">{client.cpfCnpj}</td>
                    <td className="py-3 px-3 font-mono text-slate-300">{client.phone}</td>
                    <td className="py-3 px-3 font-mono font-bold text-amber-400">
                      ${client.biddingLimitUsd.toLocaleString()} USD
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                        client.verifiedStatus
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      }`}>
                        {client.verifiedStatus ? '● Habilitado / Verificado' : '○ Em Análise'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handleToggleClientVerify(idx)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-medium transition-colors"
                      >
                        {client.verifiedStatus ? 'Suspender' : 'Aprovar'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 5: CONFIGURAÇÕES GERAIS */}
      {/* ======================================================== */}
      {adminTab === 'settings' && (
        <div className="max-w-2xl space-y-6 p-6 bg-slate-900/60 border border-slate-800 rounded-2xl">
          <h2 className="text-lg font-bold text-white">Parâmetros Operacionais do Sistema</h2>
          
          <div className="space-y-4 text-xs">
            <div>
              <label className="text-slate-300 block mb-1 font-semibold">
                Cotação PTAX Dólar Comercial (USD / BRL):
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.01"
                  value={usdRate}
                  onChange={e => onUpdateUsdRate(parseFloat(e.target.value) || 5.75)}
                  className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-amber-400 focus:outline-none focus:border-amber-400"
                />
                <span className="text-slate-400">Usado para cálculo em reais de todos os leilões</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800">
              <label className="text-slate-300 block mb-1 font-semibold">
                Endereço do Galpão de Recebimento em Miami:
              </label>
              <input
                type="text"
                disabled
                value="8350 NW 53rd Street, Suite 302, Doral, FL 33166"
                className="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-400"
              />
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 6: CONEXÃO API PHP & ARQUIVO ÚNICO (STANDALONE HTML) */}
      {/* ======================================================== */}
      {adminTab === 'php-api' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Card 1: Arquivo Único HTML/JS Puro */}
          <div className="p-6 bg-gradient-to-br from-amber-950/30 via-slate-900 to-slate-950 border border-amber-500/30 rounded-2xl shadow-xl space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded bg-amber-400 text-slate-950 font-black text-[11px] tracking-wide uppercase">
                    DISTRIBUIÇÃO STANDALONE
                  </span>
                  <span className="text-xs text-amber-300 font-medium">100% Autocontido em 1 Arquivo</span>
                </div>
                <h2 className="text-xl font-bold text-white">
                  Sistema de Leilões em Arquivo Único (HTML / JS Puro)
                </h2>
                <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                  Adaptado para rodar em <strong>qualquer hospedagem PHP, Apache, Nginx, cPanel, XAMPP ou direto no navegador com duplo-clique</strong>.
                  Não requer Node.js, compilação ou NPM. Já inclui Tailwind CSS via CDN, leitor de planilhas Excel/CSV (SheetJS), agrupamento inteligente padrão VERIZON, painel do cliente e funções de lance em tempo real prontas para conexão via API/Fetch em PHP.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <button
                  onClick={handleDownloadStandaloneHtml}
                  className="px-5 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-400/20 active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  <span>Baixar Arquivo Único (.HTML)</span>
                </button>
                <a
                  href="/standalone_single_file.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                >
                  <Eye className="w-4 h-4 text-amber-400" />
                  <span>Abrir no Navegador ↗</span>
                </a>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-800/80 text-[11px] text-slate-300">
              <div className="flex items-start gap-2 bg-slate-950/40 p-3 rounded-lg border border-slate-800">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Zero dependências locais: abra com 2 cliques em qualquer computador.</span>
              </div>
              <div className="flex items-start gap-2 bg-slate-950/40 p-3 rounded-lg border border-slate-800">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Suporte completo ao upload de planilhas CSV/XLSX da Verizon e operadoras dos EUA.</span>
              </div>
              <div className="flex items-start gap-2 bg-slate-950/40 p-3 rounded-lg border border-slate-800">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Pronto para conectar ao seu backend PHP via Fetch ou usar Modo Simulado.</span>
              </div>
            </div>
          </div>

          {/* Card 2: Configuração da API PHP / Backend */}
          <div className="p-6 bg-slate-900/70 border border-slate-800 rounded-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Server className="w-5 h-5 text-emerald-400" />
                  <span>Configurações da Conexão PHP (Fetch / REST API)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Conecte o front-end ao seu servidor PHP para persistir leilões, lances de clientes e importações no MySQL.
                </p>
              </div>

              {phpTestResult && (
                <div className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold flex items-center gap-1.5 border ${
                  phpTestResult.success
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${phpTestResult.success ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                  <span>
                    {phpTestResult.success
                      ? `Conectado (${phpTestResult.latencyMs}ms)`
                      : 'Falha na Conexão (Operando Simulado)'}
                  </span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4 text-xs">
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">
                    URL Base dos Scripts PHP:
                  </label>
                  <input
                    type="text"
                    value={phpConfig.baseUrl}
                    onChange={e => setPhpConfig({ ...phpConfig, baseUrl: e.target.value })}
                    placeholder="/backend_php ou https://seusite.com/backend_php"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-400"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Caminho onde os arquivos .php foram hospedados (padrão local: <code className="text-emerald-400">/backend_php</code>).
                  </span>
                </div>

                <div className="space-y-2 pt-2">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={phpConfig.enabled}
                      onChange={e => setPhpConfig({ ...phpConfig, enabled: e.target.checked })}
                      className="w-4 h-4 rounded border-slate-700 text-emerald-500 focus:ring-0 bg-slate-950"
                    />
                    <div>
                      <span className="text-slate-200 font-semibold block">Habilitar Chamadas Fetch Reais para API PHP</span>
                      <span className="text-[11px] text-slate-400 block">
                        Se desativado, o sistema usa o Modo Simulado (LocalStorage) com latência simulada e polling local.
                      </span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={phpConfig.autoPollBids}
                      onChange={e => setPhpConfig({ ...phpConfig, autoPollBids: e.target.checked })}
                      className="w-4 h-4 rounded border-slate-700 text-emerald-500 focus:ring-0 bg-slate-950"
                    />
                    <div>
                      <span className="text-slate-200 font-semibold block">Polling Automático de Lances em Tempo Real</span>
                      <span className="text-[11px] text-slate-400 block">
                        Atualiza os lances na tela a cada 5 segundos para todos os compradores conectados.
                      </span>
                    </div>
                  </label>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={handleTestPhpConnection}
                    disabled={phpTestResult?.testing}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${phpTestResult?.testing ? 'animate-spin' : ''}`} />
                    <span>{phpTestResult?.testing ? 'Testando Ping...' : 'Testar Conexão com Servidor PHP'}</span>
                  </button>

                  <button
                    onClick={handleSavePhpConfig}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs transition-colors flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Salvar Configuração</span>
                  </button>
                </div>
              </div>

              {/* Endpoints & Status Overview */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 space-y-3 text-xs">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] block">
                  Endpoints Mapeados no PHP:
                </span>
                <div className="space-y-2 font-mono text-[11px]">
                  <div className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800">
                    <span className="text-slate-300">GET/POST /auctions.php</span>
                    <span className="text-emerald-400 text-[10px]">Lotes & Manifestos</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800">
                    <span className="text-slate-300">POST /bids.php</span>
                    <span className="text-emerald-400 text-[10px]">Envio de Lances</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800">
                    <span className="text-slate-300">GET /bids.php?poll=1</span>
                    <span className="text-emerald-400 text-[10px]">Tempo Real (5s)</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800">
                    <span className="text-slate-300">POST /import.php</span>
                    <span className="text-emerald-400 text-[10px]">Carga em Lote Excel</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800">
                    <span className="text-slate-300">GET /health.php</span>
                    <span className="text-emerald-400 text-[10px]">Healthcheck / Ping</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 pt-1">
                  💡 <strong>Dica de Armazenamento Híbrido:</strong> Se você ainda não configurou o MySQL, o PHP salva tudo automaticamente em <code className="text-amber-400">data_storage.json</code>.
                </p>
              </div>
            </div>
          </div>

          {/* Card 3: Kit de Scripts PHP Prontos */}
          <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Code className="w-5 h-5 text-amber-400" />
                  <span>Scripts PHP & Esquema SQL Prontos para Uso</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Copie ou baixe os arquivos para colocar na pasta do seu servidor (Apache, Nginx, cPanel ou XAMPP).
                </p>
              </div>
              <span className="text-xs font-mono text-slate-500">
                Localizados em /public/backend_php/
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.entries(PHP_SCRIPTS).map(([key, script]) => (
                <div
                  key={key}
                  className="p-4 bg-slate-950/70 border border-slate-800 hover:border-slate-700 rounded-xl space-y-3 transition-colors flex flex-col justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-400 font-mono text-[11px] font-bold">
                        {script.filename}
                      </span>
                      <span className="text-[10px] text-slate-500 uppercase">
                        {key.endsWith('.sql') ? 'MySQL' : 'PHP 8+'}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-white pt-1">{script.title}</h4>
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                      {script.desc}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                    <button
                      onClick={() => setSelectedPhpFile(key)}
                      className="flex-1 py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5 text-amber-400" />
                      <span>Ver Código</span>
                    </button>
                    <a
                      href={`/backend_php/${script.filename}`}
                      download={script.filename}
                      className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1"
                      title={`Baixar ${script.filename}`}
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Code Modal for PHP Scripts */}
      {selectedPhpFile && PHP_SCRIPTS[selectedPhpFile] && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded bg-amber-400/10 border border-amber-400/30 text-amber-400 font-mono text-xs font-bold">
                  {PHP_SCRIPTS[selectedPhpFile].filename}
                </span>
                <span className="text-xs text-slate-400">
                  {PHP_SCRIPTS[selectedPhpFile].title}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(PHP_SCRIPTS[selectedPhpFile].code);
                    setCopiedCode(true);
                    setTimeout(() => setCopiedCode(false), 2000);
                  }}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
                >
                  {copiedCode ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-amber-400" />
                      <span>Copiar Código</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => setSelectedPhpFile(null)}
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-sm font-bold"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-4 overflow-y-auto font-mono text-xs text-emerald-300 bg-slate-950/90 leading-relaxed selection:bg-amber-400 selection:text-slate-950">
              <pre className="whitespace-pre-wrap">{PHP_SCRIPTS[selectedPhpFile].code}</pre>
            </div>

            <div className="p-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
              <span>{PHP_SCRIPTS[selectedPhpFile].desc}</span>
              <button
                onClick={() => setSelectedPhpFile(null)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

