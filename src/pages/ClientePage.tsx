import React, { useState } from 'react';
import { 
  UserCheck, 
  Gavel, 
  ShieldCheck, 
  MapPin, 
  Clock, 
  DollarSign, 
  Smartphone, 
  Battery, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  SlidersHorizontal, 
  ArrowUpRight, 
  Download, 
  Copy, 
  Sparkles, 
  Layers,
  ChevronRight,
  TrendingUp,
  FileText,
  List,
  LayoutGrid
} from 'lucide-react';
import { AuctionLot, GradeType, SystemUser } from '../types/auction';
import { GRADE_EXPLANATIONS } from '../data/auctionsData';

interface ClientePageProps {
  currentUser: SystemUser;
  onUpdateCurrentUser: (user: SystemUser) => void;
  auctions: AuctionLot[];
  userBids: {
    lotId: string;
    lotTitle: string;
    amountUsd: number;
    timestamp: string;
    status: 'vencendo' | 'superado';
  }[];
  onPlaceBid: (lotId: string, amountUsd: number) => void;
  onSelectLot: (lot: AuctionLot) => void;
  currency: 'USD' | 'BRL';
  usdRate: number;
  onLogout?: () => void;
}

export const ClientePage: React.FC<ClientePageProps> = ({
  currentUser,
  onUpdateCurrentUser,
  auctions,
  userBids,
  onPlaceBid,
  onSelectLot,
  currency,
  usdRate,
  onLogout
}) => {
  const [activeTab, setActiveTab] = useState<'modelos' | 'meus-lances' | 'arrematados' | 'perfil'>('modelos');
  
  // Multi-Options Filters for Vigorous Auctions
  const [selectedModelFilter, setSelectedModelFilter] = useState<string>('all');
  const [selectedGradeFilter, setSelectedGradeFilter] = useState<string>('all');
  const [selectedCapacityFilter, setSelectedCapacityFilter] = useState<string>('all');
  const [selectedAuctionHouseFilter, setSelectedAuctionHouseFilter] = useState<string>('all');
  const [selectedLotTypeFilter, setSelectedLotTypeFilter] = useState<string>('all');
  const [clientSearch, setClientSearch] = useState('');
  
  // View mode for client catalog: 'list' (default) or 'cards'
  const [viewMode, setViewMode] = useState<'list' | 'cards'>('list');
  
  // Quick bid modal state inside client panel
  const [quickBidLot, setQuickBidLot] = useState<AuctionLot | null>(null);
  const [quickBidAmount, setQuickBidAmount] = useState<number>(0);
  const [sniperEnabled, setSniperEnabled] = useState(true);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const showSuccess = (msg: string) => {
    setSuccessNotice(msg);
    setTimeout(() => setSuccessNotice(null), 3500);
  };

  const copyMiamiAddress = () => {
    const text = `USAFAST LEILÕES HUB / ${currentUser.name}\n8350 NW 53rd Street, Suite 302\nDoral / Miami - FL 33166\nPhone: +1 (305) 555-0199`;
    navigator.clipboard.writeText(text);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2500);
  };

  const handleOpenBidModal = (lot: AuctionLot) => {
    setQuickBidLot(lot);
    setQuickBidAmount(lot.currentBidUsd + 25);
  };

  const handleConfirmBid = () => {
    if (!quickBidLot) return;
    const minRequired = quickBidLot.currentBidUsd + 25;
    if (quickBidAmount < minRequired) {
      alert(`O lance precisa ser no mínimo $${minRequired} USD`);
      return;
    }
    onPlaceBid(quickBidLot.id, quickBidAmount);
    showSuccess(`🎉 Oferta de $${quickBidAmount.toLocaleString()} USD computada com sucesso no lote ${quickBidLot.lotNumber}!`);
    setQuickBidLot(null);
  };

  // Dynamic list of models and capacities present in active catalog
  const availableModels = Array.from(new Set(auctions.map(a => a.modelFamily))).filter(Boolean);
  const availableAuctionHouses = Array.from(new Set(auctions.map(a => a.auctionHouse))).filter(Boolean);

  // Filtered devices for client
  const clientFilteredLots = auctions.filter(lot => {
    if (clientSearch.trim()) {
      const q = clientSearch.toLowerCase();
      const matchTitle = lot.title.toLowerCase().includes(q);
      const matchLot = lot.lotNumber.toLowerCase().includes(q);
      const matchModel = lot.modelFamily.toLowerCase().includes(q);
      const matchStorage = lot.primaryStorage.toLowerCase().includes(q);
      const matchOem = (lot.oemBrand || '').toLowerCase().includes(q);
      const matchSource = (lot.sourceType || '').toLowerCase().includes(q);
      if (!matchTitle && !matchLot && !matchModel && !matchStorage && !matchOem && !matchSource) return false;
    }
    if (selectedModelFilter === 'verizon') {
      if (lot.sourceType !== 'VERIZON' && !/verizon/i.test(lot.auctionHouse) && !/verizon/i.test(lot.carrierStatus)) return false;
    } else if (selectedModelFilter !== 'all' && lot.modelFamily !== selectedModelFilter) {
      return false;
    }
    if (selectedGradeFilter !== 'all' && lot.grade !== selectedGradeFilter) return false;
    if (selectedCapacityFilter !== 'all' && !lot.primaryStorage.toLowerCase().includes(selectedCapacityFilter.toLowerCase())) return false;
    if (selectedAuctionHouseFilter !== 'all' && lot.auctionHouse !== selectedAuctionHouseFilter) return false;
    if (selectedLotTypeFilter === 'wholesale' && lot.quantity <= 1) return false;
    if (selectedLotTypeFilter === 'single' && lot.quantity > 1) return false;
    return true;
  });

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-slate-200 space-y-8">
      {/* Toast Notice */}
      {successNotice && (
        <div className="p-4 bg-emerald-500/15 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successNotice}</span>
        </div>
      )}

      {/* Client Identity & Credential Banner */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40 border border-slate-800 rounded-2xl shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-xl shadow-inner">
              <UserCheck className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Painel do Arrematante Cadastrado
                </h1>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px] font-mono font-bold">
                  ● HABILITADO
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {currentUser.name} · CPF/CNPJ: <span className="font-mono text-slate-300">{currentUser.cpfCnpj}</span> · {currentUser.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={copyMiamiAddress}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-medium transition-colors flex items-center gap-2"
              title="Copiar endereço do galpão de Miami"
            >
              <Copy className="w-3.5 h-3.5 text-amber-400" />
              <span>{copiedAddress ? 'Endereço Copiado!' : 'Copiar Suíte Miami (Doral FL)'}</span>
            </button>
          </div>
        </div>

        {/* Financial & Logistics Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-800/80 text-xs">
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Limite Disponível em Dólares</span>
            <span className="text-lg font-black text-amber-400 font-mono">
              ${currentUser.biddingLimitUsd.toLocaleString()} USD
            </span>
            <span className="text-[10px] text-slate-500 block font-mono">
              ≈ R$ {(currentUser.biddingLimitUsd * usdRate).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
            </span>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Lances em Disputa</span>
            <span className="text-lg font-black text-emerald-400 font-mono">
              {userBids.length} Lote(s)
            </span>
            <span className="text-[10px] text-slate-500 block">
              {userBids.filter(b => b.status === 'vencendo').length} com maior lance
            </span>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Armazém de Recebimento EUA</span>
            <span className="text-xs font-bold text-white flex items-center gap-1.5 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              Doral / Miami - Florida (FL 33166)
            </span>
            <span className="text-[10px] text-emerald-400 block">Despacho Aéreo Prioritário Seguro</span>
          </div>
        </div>
      </div>

      {/* Client Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-2 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('modelos')}
          className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-2 ${
            activeTab === 'modelos'
              ? 'bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-400/10'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span>Todos os Modelos & Lances ({auctions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('meus-lances')}
          className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-2 ${
            activeTab === 'meus-lances'
              ? 'bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-400/10'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Gavel className="w-4 h-4" />
          <span>Meus Lances Ativos ({userBids.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('arrematados')}
          className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-2 ${
            activeTab === 'arrematados'
              ? 'bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-400/10'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Lotes Arrematados (Invoices)</span>
        </button>

        <button
          onClick={() => setActiveTab('perfil')}
          className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-2 ${
            activeTab === 'perfil'
              ? 'bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-400/10'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Dados do Arrematante & Suíte</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: TODOS OS MODELOS, FOTOS, DADOS & LANCES */}
      {/* ========================================================= */}
      {activeTab === 'modelos' && (
        <div className="space-y-6">
          {/* Multi-Options Filter Bar for Vigorous Auctions */}
          <div className="p-4 sm:p-5 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-4">
            <div className="flex flex-col lg:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={clientSearch}
                  onChange={e => setClientSearch(e.target.value)}
                  placeholder="Pesquisar por modelo (16 Pro Max, 15 Pro), lote (US-89104), IMEI, cor ou galpão..."
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>

              {clientSearch && (
                <button
                  onClick={() => setClientSearch('')}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition-colors"
                >
                  Limpar Busca
                </button>
              )}
            </div>

            {/* Filter Dropdowns Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-1 text-xs">
              {/* Filter 1: Model */}
              <div>
                <label className="text-[10px] text-slate-400 font-semibold block mb-1">Modelo:</label>
                <select
                  value={selectedModelFilter}
                  onChange={e => setSelectedModelFilter(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400 font-medium"
                >
                  <option value="all">Todos os Modelos</option>
                  <option value="verizon">⚡ Padrão VERIZON</option>
                  {availableModels.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              {/* Filter 2: Grade */}
              <div>
                <label className="text-[10px] text-slate-400 font-semibold block mb-1">Grade Estético:</label>
                <select
                  value={selectedGradeFilter}
                  onChange={e => setSelectedGradeFilter(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400 font-medium"
                >
                  <option value="all">Todas as Grades</option>
                  <option value="Grade A+">Grade A+ (Mint)</option>
                  <option value="Grade A">Grade A (Excelente)</option>
                  <option value="Grade B">Grade B (Muito Bom)</option>
                  <option value="Grade C">Grade C (Econômico)</option>
                  <option value="CPO Refurbished">CPO Refurbished</option>
                </select>
              </div>

              {/* Filter 3: Capacity */}
              <div>
                <label className="text-[10px] text-slate-400 font-semibold block mb-1">Capacidade / Memória:</label>
                <select
                  value={selectedCapacityFilter}
                  onChange={e => setSelectedCapacityFilter(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400 font-medium"
                >
                  <option value="all">Todas as Capacidades</option>
                  <option value="128GB">128GB</option>
                  <option value="256GB">256GB</option>
                  <option value="512GB">512GB</option>
                  <option value="1TB">1TB</option>
                </select>
              </div>

              {/* Filter 4: Auction House */}
              <div>
                <label className="text-[10px] text-slate-400 font-semibold block mb-1">Casa de Leilão / Origem:</label>
                <select
                  value={selectedAuctionHouseFilter}
                  onChange={e => setSelectedAuctionHouseFilter(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400 font-medium"
                >
                  <option value="all">Todas as Casas</option>
                  {availableAuctionHouses.map(h => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>

              {/* Filter 5: Lot Type */}
              <div className="col-span-2 sm:col-span-1">
                <label className="text-[10px] text-slate-400 font-semibold block mb-1">Tipo de Lote:</label>
                <select
                  value={selectedLotTypeFilter}
                  onChange={e => setSelectedLotTypeFilter(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400 font-medium"
                >
                  <option value="all">Todos os Tipos</option>
                  <option value="wholesale">Atacado (Paletes & Lotes &gt; 1 un)</option>
                  <option value="single">Avulso (1 Unidade)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
              <span>
                Exibindo <strong className="text-amber-400">{clientFilteredLots.length}</strong> de {auctions.length} leilões vigentes
              </span>
              <span className="text-emerald-400 font-semibold">
                ● Lances computados instantaneamente no pregão oficial
              </span>
            </div>
          </div>

          {/* View Mode Switcher Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-300 font-bold">Modo de Exibição dos Modelos:</span>
              <span className="text-[11px] text-slate-500 hidden md:inline">· Escolha entre a lista consolidada ou cards visuais</span>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                  viewMode === 'list'
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-400/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>Lista de Modelos & Ofertas</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                  viewMode === 'cards'
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-400/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Cards em Grade</span>
              </button>
            </div>
          </div>

          {clientFilteredLots.length === 0 ? (
            <div className="p-12 text-center bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl space-y-3">
              <Search className="w-8 h-8 text-slate-600 mx-auto" />
              <h4 className="text-sm font-bold text-white">Nenhum modelo encontrado com os filtros selecionados</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Tente ajustar os filtros de modelo, grade ou capacidade para visualizar os leilões vigentes.
              </p>
              <button
                type="button"
                onClick={() => {
                  setClientSearch('');
                  setSelectedModelFilter('all');
                  setSelectedGradeFilter('all');
                  setSelectedCapacityFilter('all');
                  setSelectedAuctionHouseFilter('all');
                  setSelectedLotTypeFilter('all');
                }}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold text-xs rounded-xl border border-slate-700"
              >
                Limpar Todos os Filtros
              </button>
            </div>
          ) : viewMode === 'list' ? (
            /* ======================================================== */
            /* LIST VIEW: MODELOS, ESPECIFICAÇÕES E BOTÃO DE OFERTA     */
            /* ======================================================== */
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/90 text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800 tracking-wider">
                    <tr>
                      <th className="p-3.5">Foto</th>
                      <th className="p-3.5">Modelo & Lote</th>
                      <th className="p-3.5">Grade</th>
                      <th className="p-3.5">Qtd / Memória</th>
                      <th className="p-3.5">Status / Laudo</th>
                      <th className="p-3.5">Lance Atual</th>
                      <th className="p-3.5 text-center">Oferta Rápida</th>
                      <th className="p-3.5 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-sans">
                    {clientFilteredLots.map(lot => {
                      const gradeInfo = GRADE_EXPLANATIONS[lot.grade];
                      const currentBrl = lot.currentBidUsd * usdRate;
                      const isVerizon = lot.sourceType === 'VERIZON' || lot.grade.includes('DNA') || lot.grade.includes('DNB') || lot.grade.includes('DNC');

                      return (
                        <tr key={lot.id} className="hover:bg-slate-800/40 transition-colors">
                          {/* Photo Thumbnail */}
                          <td className="p-3.5">
                            <div 
                              onClick={() => onSelectLot(lot)}
                              className="w-14 h-14 rounded-xl bg-slate-950 overflow-hidden border border-slate-800 cursor-pointer relative group shrink-0"
                              title="Clique para ver fotos e laudo do lote"
                            >
                              <img src={lot.imageUrl} alt={lot.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                              <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent" />
                            </div>
                          </td>

                          {/* Model & Lot Title */}
                          <td className="p-3.5">
                            <div className="space-y-0.5">
                              <span 
                                className="font-bold text-white text-sm block hover:text-amber-400 cursor-pointer transition-colors"
                                onClick={() => onSelectLot(lot)}
                              >
                                {lot.modelFamily}
                              </span>
                              <span className="text-[11px] text-slate-300 font-medium line-clamp-1">
                                {lot.title}
                              </span>
                              <div className="flex items-center gap-2 pt-0.5">
                                <span className="font-mono text-[10px] text-amber-300 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                                  {lot.lotNumber}
                                </span>
                                <span className="text-[10px] text-slate-400 truncate max-w-[150px]">
                                  {lot.auctionHouse}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Grade Badge */}
                          <td className="p-3.5">
                            <div className="space-y-1">
                              <span className={`px-2.5 py-1 rounded text-xs font-bold border inline-block ${gradeInfo?.badgeColor || 'bg-slate-800 text-slate-200'}`}>
                                {lot.grade}
                              </span>
                              {isVerizon && (
                                <span className="px-1.5 py-0.5 rounded bg-red-600/90 text-white font-black text-[9px] block w-max uppercase tracking-wider">
                                  VERIZON
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Quantity & Storage */}
                          <td className="p-3.5">
                            <div className="font-mono">
                              <span className="text-white font-bold block">{lot.quantity} {lot.quantity === 1 ? 'unidade' : 'unidades'}</span>
                              <span className="text-slate-400 text-[11px] block">{lot.primaryStorage}</span>
                            </div>
                          </td>

                          {/* Diagnostics & Clean ESN */}
                          <td className="p-3.5">
                            <div className="text-[11px] space-y-0.5">
                              <span className="text-emerald-400 font-mono font-semibold flex items-center gap-1">
                                <Battery className="w-3 h-3 text-emerald-400 shrink-0" />
                                {lot.batteryHealthRange}
                              </span>
                              <span className="text-slate-400 flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3 text-amber-400 shrink-0" />
                                Clean ESN
                              </span>
                            </div>
                          </td>

                          {/* Current Bid */}
                          <td className="p-3.5">
                            <div className="font-mono">
                              <span className="text-base font-black text-amber-400 block">
                                ${lot.currentBidUsd.toLocaleString()} USD
                              </span>
                              <span className="text-[10px] text-slate-400 block">
                                ≈ R$ {currentBrl.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                              </span>
                              <span className="text-[10px] text-slate-500 font-sans block">
                                {lot.totalBidsCount} lances
                              </span>
                            </div>
                          </td>

                          {/* Quick Bids */}
                          <td className="p-3.5">
                            <div className="flex items-center justify-center gap-1 font-mono">
                              {[25, 50, 100, 250].map(inc => (
                                <button
                                  key={inc}
                                  type="button"
                                  onClick={() => {
                                    const val = lot.currentBidUsd + inc;
                                    onPlaceBid(lot.id, val);
                                    showSuccess(`🎉 Oferta de $${val.toLocaleString()} USD computada no modelo ${lot.modelFamily} (${lot.lotNumber})!`);
                                  }}
                                  className="py-1 px-1.5 bg-slate-800 hover:bg-amber-400 hover:text-slate-950 active:scale-95 text-amber-300 border border-slate-700/80 rounded text-[10px] font-bold transition-all"
                                  title={`Ofertar +$${inc} USD agora`}
                                >
                                  +${inc}
                                </button>
                              ))}
                            </div>
                          </td>

                          {/* Primary Action: Dar Oferta */}
                          <td className="p-3.5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => handleOpenBidModal(lot)}
                                className="px-3.5 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black rounded-xl text-xs transition-all shadow-md shadow-amber-400/20 active:scale-95 flex items-center gap-1.5 shrink-0"
                              >
                                <Gavel className="w-3.5 h-3.5" />
                                <span>Dar Oferta</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => onSelectLot(lot)}
                                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs transition-colors"
                                title="Ver detalhes do lote"
                              >
                                <ArrowUpRight className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* ======================================================== */
            /* CARDS VIEW: GRADE DE CARDS COM FOTOS GRANDES              */
            /* ======================================================== */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {clientFilteredLots.map(lot => {
                const gradeInfo = GRADE_EXPLANATIONS[lot.grade];
                const currentBrl = lot.currentBidUsd * usdRate;
                const grossProfitBrl = lot.estimatedBrazilRetailBrl - currentBrl;

                return (
                  <div
                    key={lot.id}
                    className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl overflow-hidden flex flex-col justify-between shadow-xl transition-all"
                  >
                    {/* Photo & Badge */}
                    <div className="relative aspect-[4/3] bg-slate-950 overflow-hidden">
                      <img
                        src={lot.imageUrl}
                        alt={lot.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/30 pointer-events-none" />

                      <div className="absolute top-3 left-3 flex items-center gap-1.5">
                        <span className={`px-2.5 py-1 rounded text-xs font-bold border backdrop-blur-md ${gradeInfo?.badgeColor || ''}`}>
                          {lot.grade}
                        </span>
                        {(lot.sourceType === 'VERIZON' || /verizon/i.test(lot.auctionHouse) || /verizon/i.test(lot.carrierStatus)) && (
                          <span className="px-2 py-0.5 rounded bg-red-600 text-white font-black text-[10px] tracking-wider uppercase shadow-md">
                            VERIZON
                          </span>
                        )}
                      </div>

                      <div className="absolute top-3 right-3">
                        <span className="px-2.5 py-1 rounded bg-slate-950/80 backdrop-blur-md border border-slate-800 text-slate-200 text-[11px] font-mono">
                          {lot.quantity} {lot.quantity === 1 ? 'Aparelho' : 'Aparelhos'}
                        </span>
                      </div>

                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] text-slate-300">
                        <span className="font-mono bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800 text-amber-300">
                          {lot.lotNumber}
                        </span>
                        <span className="bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800 text-slate-300 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-amber-400" />
                          {lot.location}
                        </span>
                      </div>
                    </div>

                    {/* Body & Specs */}
                    <div className="p-4 sm:p-5 space-y-4 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-white text-base leading-snug line-clamp-2">
                          {lot.title}
                        </h3>

                        {/* Diagnostic & Technical Spec Badges */}
                        <div className="mt-3 grid grid-cols-2 gap-2 text-xs bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
                          <div className="flex items-center gap-1.5">
                            <Smartphone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{lot.primaryStorage} · {lot.modelFamily}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Battery className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span className="font-mono text-emerald-400 font-semibold">{lot.batteryHealthRange}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span className="truncate text-slate-300">Clean ESN / FMI OFF</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                            <span className="truncate text-emerald-400">{lot.carrierStatus}</span>
                          </div>
                        </div>
                      </div>

                      {/* Price & Direct Bidding Controls */}
                      <div className="pt-2 border-t border-slate-800/80 space-y-3">
                        <div className="flex items-end justify-between">
                          <div>
                            <span className="text-[11px] text-slate-400 block">Lance Atual:</span>
                            <span className="text-xl sm:text-2xl font-black text-amber-400 font-mono tracking-tight block">
                              ${lot.currentBidUsd.toLocaleString()} USD
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              ≈ R$ {currentBrl.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                            </span>
                          </div>

                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 block">Lucro Bruto Est.:</span>
                            <span className="text-xs font-bold text-emerald-400 font-mono block">
                              + R$ {grossProfitBrl.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {lot.totalBidsCount} lances dados
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2 pt-1 border-t border-slate-800/80">
                          <span className="text-[10px] text-slate-400 font-semibold block">Computar Oferta Rápida:</span>
                          <div className="grid grid-cols-4 gap-1.5">
                            {[25, 50, 100, 250].map(inc => (
                              <button
                                key={inc}
                                type="button"
                                onClick={() => {
                                  const val = lot.currentBidUsd + inc;
                                  onPlaceBid(lot.id, val);
                                  showSuccess(`🎉 Oferta de $${val.toLocaleString()} USD computada no lote ${lot.lotNumber}!`);
                                }}
                                className="py-1 px-1 bg-slate-800/90 hover:bg-amber-400 hover:text-slate-950 active:scale-95 text-amber-300 border border-slate-700/80 rounded-lg text-[10px] font-mono font-bold transition-all text-center"
                                title={`Computar oferta imediata de +$${inc} USD`}
                              >
                                +${inc}
                              </button>
                            ))}
                          </div>

                          <div className="grid grid-cols-2 gap-2 pt-1">
                            <button
                              onClick={() => onSelectLot(lot)}
                              className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
                            >
                              <span>Ver Detalhes</span>
                              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
                            </button>

                            <button
                              onClick={() => handleOpenBidModal(lot)}
                              className="py-2.5 px-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-md shadow-amber-400/20 active:scale-95"
                            >
                              <Gavel className="w-3.5 h-3.5" />
                              <span>Computar Oferta</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: MEUS LANCES ATIVOS */}
      {/* ========================================================= */}
      {activeTab === 'meus-lances' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">Lotes com Seus Lances Computados</h2>
              <p className="text-xs text-slate-400">Acompanhe se você é o arrematante vencedor ou se seu lance foi superado</p>
            </div>
          </div>

          {userBids.length === 0 ? (
            <div className="p-12 text-center bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl space-y-3">
              <Gavel className="w-10 h-10 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-white">Você ainda não deu lances em nenhum lote</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Explore a aba "Todos os Modelos" acima e clique em "Dar Oferta" para disputar leilões oficiais da Apple e Verizon.
              </p>
              <button
                onClick={() => setActiveTab('modelos')}
                className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl text-xs transition-colors inline-block"
              >
                Ver Modelos e Dar Lances
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-800 rounded-2xl bg-slate-900/60">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 text-[11px]">
                    <th className="py-3 px-4">Lote / Modelo</th>
                    <th className="py-3 px-4">Seu Lance em USD</th>
                    <th className="py-3 px-4">Equivalente em Reais (PTAX)</th>
                    <th className="py-3 px-4">Momento do Lance</th>
                    <th className="py-3 px-4">Situação da Disputa</th>
                    <th className="py-3 px-4 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {userBids.map((b, idx) => {
                    const lot = auctions.find(a => a.id === b.lotId);
                    return (
                      <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-semibold text-white block">{b.lotTitle}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{lot?.lotNumber || b.lotId}</span>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-amber-400">
                          ${b.amountUsd.toLocaleString()} USD
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-300">
                          R$ {(b.amountUsd * usdRate).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                        </td>
                        <td className="py-3 px-4 text-slate-400">{b.timestamp}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold border ${
                            b.status === 'vencendo'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                          }`}>
                            {b.status === 'vencendo' ? '● Maior Lance (Você está ganhando)' : '○ Lance Superado'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          {lot && (
                            <button
                              onClick={() => handleOpenBidModal(lot)}
                              className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs transition-colors"
                            >
                              Cobrir Lance
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: LOTES ARREMATADOS & INVOICES */}
      {/* ========================================================= */}
      {activeTab === 'arrematados' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">Lotes Homologados e Arrematados</h2>
              <p className="text-xs text-slate-400">
                Aparelhos prontos para conferência física no galpão de Miami e expedição para o Brasil
              </p>
            </div>
          </div>

          <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-950 rounded-xl border border-emerald-500/30">
              <div className="space-y-1">
                <span className="font-bold text-white text-sm block">Lote US-88201-MIA · 10x iPhone 15 Pro 128GB Grade A</span>
                <span className="text-xs text-slate-400">
                  Arrematado em 02/11/2026 por <strong>$5.400 USD</strong> · Conferido e Embalado no Galpão Miami Doral
                </span>
              </div>
              <button
                onClick={() => showSuccess('Download da Invoice e Ordem de Despacho iniciado!')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-2 shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Baixar Invoice Oficial (PDF)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: PERFIL DO ARREMATANTE & SUÍTE MIAMI */}
      {/* ========================================================= */}
      {activeTab === 'perfil' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-4">
            <h2 className="text-lg font-bold text-white">Dados do Arrematante</h2>
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Nome do Titular / Razão Social:</span>
                <span className="text-white font-bold text-sm">{currentUser.name}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">CPF ou CNPJ:</span>
                <span className="font-mono text-slate-200">{currentUser.cpfCnpj}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">E-mail Registrado:</span>
                <span className="text-slate-200">{currentUser.email}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">WhatsApp / Contato:</span>
                <span className="font-mono text-slate-200">{currentUser.phone}</span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 block text-[11px]">Limite Liberado para Arrematação:</span>
                  <span className="font-mono font-bold text-amber-400 text-base">
                    ${currentUser.biddingLimitUsd.toLocaleString()} USD
                  </span>
                </div>
                <span className="px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
                  Verificado
                </span>
              </div>
            </div>
          </div>

          <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-amber-400" />
                Sua Suíte de Recebimento nos EUA
              </h2>
              <button
                onClick={copyMiamiAddress}
                className="text-xs text-amber-400 hover:underline flex items-center gap-1 font-semibold"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedAddress ? 'Copiado!' : 'Copiar'}</span>
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Use este endereço para entrega dos aparelhos arrematados nas plataformas americanas. Nossa equipe recebe, inspeciona e consolida os lotes para envio ao Brasil.
            </p>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs space-y-1.5 text-slate-200">
              <div><strong>Recipient:</strong> US iPhone Hub / {currentUser.name}</div>
              <div><strong>Address Line 1:</strong> 8350 NW 53rd Street</div>
              <div><strong>Address Line 2 (Suite):</strong> Suite 302 - Box BR-88201</div>
              <div><strong>City / State:</strong> Doral / Miami - Florida (FL)</div>
              <div><strong>ZIP Code:</strong> 33166-4702</div>
              <div><strong>Country:</strong> United States (USA)</div>
              <div><strong>Warehouse Phone:</strong> +1 (305) 555-0199</div>
            </div>
          </div>
        </div>
      )}

      {/* QUICK BID MODAL INSIDE CLIENT PANEL */}
      {quickBidLot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-amber-400">{quickBidLot.lotNumber}</span>
                <h3 className="text-base font-bold text-white">{quickBidLot.title}</h3>
                <span className="text-xs text-slate-400">{quickBidLot.quantity} aparelho(s) · {quickBidLot.grade}</span>
              </div>
              <button
                onClick={() => setQuickBidLot(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Lance Atual no Leilão:</span>
                <span className="font-mono font-bold text-white">${quickBidLot.currentBidUsd.toLocaleString()} USD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Lance Mínimo Requerido:</span>
                <span className="font-mono font-bold text-amber-400">${(quickBidLot.currentBidUsd + 25).toLocaleString()} USD</span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                <span>Conversão PTAX:</span>
                <span className="font-mono text-slate-300">R$ {((quickBidLot.currentBidUsd + 25) * usdRate).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Seu Lance em Dólar (USD):
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-500 font-mono font-bold">$</span>
                <input
                  type="number"
                  min={quickBidLot.currentBidUsd + 25}
                  step="25"
                  value={quickBidAmount}
                  onChange={e => setQuickBidAmount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-8 pr-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Presets */}
              <div className="flex items-center gap-2 pt-2">
                <span className="text-[11px] text-slate-400">Adicionar:</span>
                <button
                  type="button"
                  onClick={() => setQuickBidAmount(quickBidLot.currentBidUsd + 25)}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-mono"
                >
                  +$25
                </button>
                <button
                  type="button"
                  onClick={() => setQuickBidAmount(quickBidLot.currentBidUsd + 50)}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-mono"
                >
                  +$50
                </button>
                <button
                  type="button"
                  onClick={() => setQuickBidAmount(quickBidLot.currentBidUsd + 100)}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-mono"
                >
                  +$100
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sniperEnabled}
                  onChange={e => setSniperEnabled(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-amber-400 focus:ring-amber-400"
                />
                <span>Ativar Sniper (Lance nos últimos 4s)</span>
              </label>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setQuickBidLot(null)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl text-xs transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmBid}
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2 shadow-md shadow-amber-500/10"
              >
                <Gavel className="w-4 h-4" />
                <span>Confirmar Lance</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
