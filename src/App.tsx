import React, { useState, useMemo, useEffect } from 'react';
import { Header, AppPage } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { AuctionCard } from './components/AuctionCard';
import { AuctionDetailModal } from './components/AuctionDetailModal';
import { AuctionSystemModal } from './components/AuctionSystemModal';
import { GradingGuideModal } from './components/GradingGuideModal';
import { ImportCalculatorModal } from './components/ImportCalculatorModal';
import { QuemSomosPage } from './pages/QuemSomosPage';
import { GradeamentoPage } from './pages/GradeamentoPage';
import { AdminPage } from './pages/AdminPage';
import { ClientePage } from './pages/ClientePage';
import { AdminLoginGate, ClientLoginGate } from './components/AuthGates';
import { INITIAL_AUCTIONS, DEFAULT_PTAX_USD_BRL, GRADE_EXPLANATIONS } from './data/auctionsData';
import { AuctionLot, GradeType, SystemUser, AdminOffer } from './types/auction';
import { apiService } from './services/apiService';
import { 
  Search, 
  Filter, 
  Layers, 
  Gavel, 
  Calculator, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  MapPin, 
  SlidersHorizontal,
  Package,
  FileSpreadsheet,
  Lock,
  Sparkles,
  UserCheck,
  Download,
  Server
} from 'lucide-react';

export default function App() {
  // Navigation Page State
  const [currentPage, setCurrentPage] = useState<AppPage>('home');

  // Auction State with Persistent LocalStorage
  const [auctions, setAuctions] = useState<AuctionLot[]>(() => {
    try {
      const saved = localStorage.getItem('us_iphone_auctions_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      // ignore
    }
    return INITIAL_AUCTIONS;
  });

  const [currency, setCurrency] = useState<'USD' | 'BRL'>('USD');
  const [usdRate, setUsdRate] = useState<number>(() => {
    try {
      const savedRate = localStorage.getItem('us_ptax_rate');
      if (savedRate) return parseFloat(savedRate) || DEFAULT_PTAX_USD_BRL;
    } catch (e) {}
    return DEFAULT_PTAX_USD_BRL;
  });

  const handleUpdateUsdRate = (rate: number) => {
    setUsdRate(rate);
    try {
      localStorage.setItem('us_ptax_rate', String(rate));
    } catch (e) {}
  };

  // User & Bidding State with Persistent LocalStorage
  const [currentUser, setCurrentUser] = useState<SystemUser>(() => {
    try {
      const savedUser = localStorage.getItem('us_iphone_client_user');
      if (savedUser) return JSON.parse(savedUser);
    } catch (e) {}
    return {
      name: 'Carlos Mendes',
      email: 'carlos.mendes@importtech.com.br',
      cpfCnpj: '18.492.301/0001-44',
      phone: '+55 (11) 98844-1290',
      biddingLimitUsd: 25000,
      verifiedStatus: true,
      registeredDate: '01/02/2026'
    };
  });

  const handleUpdateCurrentUser = (user: SystemUser) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('us_iphone_client_user', JSON.stringify(user));
    } catch (e) {}
  };

  // Authentication Gates State (Admin and Client)
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem('us_admin_auth') === 'true';
    } catch (e) {
      return false;
    }
  });

  const [isClientAuthenticated, setIsClientAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem('us_client_auth') === 'true';
    } catch (e) {
      return false;
    }
  });

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    try {
      localStorage.removeItem('us_admin_auth');
    } catch (e) {}
    showToast('Sessão administrativa encerrada.');
  };

  const handleClientLogout = () => {
    setIsClientAuthenticated(false);
    try {
      localStorage.removeItem('us_client_auth');
    } catch (e) {}
    showToast('Sessão do arrematante encerrada.');
  };

  const [userBids, setUserBids] = useState<{
    lotId: string;
    lotTitle: string;
    amountUsd: number;
    timestamp: string;
    status: 'vencendo' | 'superado';
  }[]>(() => {
    try {
      const savedBids = localStorage.getItem('us_iphone_user_bids');
      if (savedBids) return JSON.parse(savedBids);
    } catch (e) {}
    return [
      {
        lotId: 'lot-us-16pm-01',
        lotTitle: 'Lote Master 10x iPhone 16 Pro Max 256GB',
        amountUsd: 7450,
        timestamp: 'Hoje, 14:32',
        status: 'vencendo'
      }
    ];
  });

  // Modals State
  const [selectedLotForDetail, setSelectedLotForDetail] = useState<AuctionLot | null>(null);
  const [isSystemModalOpen, setIsSystemModalOpen] = useState(false);
  const [systemModalTab, setSystemModalTab] = useState<'terminal' | 'register'>('terminal');
  const [isGradingModalOpen, setIsGradingModalOpen] = useState(false);
  const [isCalculatorModalOpen, setIsCalculatorModalOpen] = useState(false);
  const [calculatorInitData, setCalculatorInitData] = useState({ priceUsd: 7450, units: 10 });

  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterModel, setFilterModel] = useState<string>('all');
  const [filterGrade, setFilterGrade] = useState<string>('all');
  const [filterLotType, setFilterLotType] = useState<string>('all');
  const [filterAuctionHouse, setFilterAuctionHouse] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'endingSoon' | 'priceAsc' | 'priceDesc' | 'profitDesc' | 'mostBids'>('endingSoon');

  // Quick Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Helper to persist auctions
  const handleUpdateAuctions = (newAuctions: AuctionLot[]) => {
    setAuctions(newAuctions);
    try {
      localStorage.setItem('us_iphone_auctions_v1', JSON.stringify(newAuctions));
    } catch (e) {}
  };

  // Real-time live bidding polling effect (connects to PHP or simulated live pool)
  useEffect(() => {
    const cfg = apiService.getConfig();
    if (!cfg.autoPollBids) return;

    const interval = setInterval(async () => {
      try {
        const liveBid = await apiService.pollLatestBids(auctions);
        if (liveBid && liveBid.newBidAmount) {
          setAuctions(prev => {
            let hasChanges = false;
            const next = prev.map(lot => {
              const isMatch = lot.id === liveBid.lotId || lot.lotNumber === liveBid.lotId;
              if (isMatch && liveBid.newBidAmount > lot.currentBidUsd) {
                hasChanges = true;
                return {
                  ...lot,
                  currentBidUsd: liveBid.newBidAmount,
                  totalBidsCount: lot.totalBidsCount + 1,
                  bidsHistory: [
                    {
                      id: `bid-live-${Date.now()}`,
                      bidderName: liveBid.bidderName || 'Licitante EUA Concorrente',
                      amountUsd: liveBid.newBidAmount,
                      timestamp: 'Agora'
                    },
                    ...lot.bidsHistory
                  ]
                };
              }
              return lot;
            });
            return hasChanges ? next : prev;
          });
        }
      } catch (e) {
        // silent fallback
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Place a Bid Handler (Connected to PHP API / Simulated Bridge)
  const handlePlaceBid = (lotId: string, amountUsd: number) => {
    const bidderName = currentUser.name ? `${currentUser.name} (Você)` : 'Arrematante Autorizado (Você)';

    // Trigger API / Backend submission
    apiService.submitBid(lotId, amountUsd, bidderName).catch(err => {
      console.warn('Falha no envio da API PHP, operando localmente:', err);
    });

    const updatedAuctions = auctions.map(lot => {
      if (lot.id === lotId) {
        const newBidHistory = [
          {
            id: `bid-${Date.now()}`,
            bidderName,
            amountUsd,
            timestamp: 'Agora'
          },
          ...lot.bidsHistory
        ];
        return {
          ...lot,
          currentBidUsd: amountUsd,
          totalBidsCount: lot.totalBidsCount + 1,
          bidsHistory: newBidHistory
        };
      }
      return lot;
    });

    handleUpdateAuctions(updatedAuctions);

    const targetLot = auctions.find(a => a.id === lotId);
    if (targetLot) {
      const updatedBids = [
        {
          lotId,
          lotTitle: targetLot.title,
          amountUsd,
          timestamp: 'Agora mesmo',
          status: 'vencendo' as const
        },
        ...userBids.filter(b => b.lotId !== lotId)
      ];
      setUserBids(updatedBids);
      try {
        localStorage.setItem('us_iphone_user_bids', JSON.stringify(updatedBids));
      } catch (e) {}

      // Real-time synchronization with Admin Console ("Ofertas Computadas")
      try {
        const savedAdminOffers = localStorage.getItem('us_admin_offers_v1');
        const curOffers: AdminOffer[] = savedAdminOffers ? JSON.parse(savedAdminOffers) : [];
        const newAdminOffer: AdminOffer = {
          id: `off-${Date.now()}`,
          lotId,
          lotNumber: targetLot.lotNumber || `US-${lotId.slice(-5)}`,
          lotTitle: targetLot.title,
          clientName: currentUser.name || 'Arrematante Autorizado',
          clientEmail: currentUser.email || 'cliente@usafastleiloes.com',
          amountUsd,
          amountBrl: Math.round(amountUsd * usdRate),
          timestamp: 'Agora mesmo',
          status: 'Vencendo',
          isAutoSniper: false
        };
        const nextAdminOffers = [newAdminOffer, ...curOffers.filter(o => o.lotId !== lotId)];
        localStorage.setItem('us_admin_offers_v1', JSON.stringify(nextAdminOffers));
      } catch (e) {}
    }

    showToast(`⚡ Lance de $${amountUsd.toLocaleString()} USD computado com sucesso!`);
  };

  const handleOpenSystem = (tab: 'terminal' | 'register' = 'terminal') => {
    if (tab === 'terminal') {
      setCurrentPage('cliente');
    } else {
      setSystemModalTab(tab);
      setIsSystemModalOpen(true);
    }
  };

  const handleOpenCalculatorForLot = (lot: AuctionLot) => {
    setCalculatorInitData({
      priceUsd: lot.currentBidUsd,
      units: lot.quantity
    });
    setIsCalculatorModalOpen(true);
  };

  // Filtered & Sorted Auctions
  const filteredAuctions = useMemo(() => {
    return auctions.filter(lot => {
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = lot.title.toLowerCase().includes(query);
        const matchesLotNum = lot.lotNumber.toLowerCase().includes(query);
        const matchesModel = lot.modelFamily.toLowerCase().includes(query);
        const matchesLoc = lot.location.toLowerCase().includes(query);
        const matchesStorage = lot.primaryStorage.toLowerCase().includes(query);
        const matchesOem = (lot.oemBrand || '').toLowerCase().includes(query);
        const matchesSource = (lot.sourceType || '').toLowerCase().includes(query);
        if (!matchesTitle && !matchesLotNum && !matchesModel && !matchesLoc && !matchesStorage && !matchesOem && !matchesSource) {
          return false;
        }
      }

      if (filterModel !== 'all' && lot.modelFamily !== filterModel) {
        return false;
      }

      if (filterGrade !== 'all' && lot.grade !== filterGrade) {
        return false;
      }

      if (filterLotType === 'single' && lot.quantity !== 1) return false;
      if (filterLotType === 'small' && (lot.quantity < 2 || lot.quantity > 8)) return false;
      if (filterLotType === 'wholesale' && lot.quantity < 10) return false;

      if (filterAuctionHouse === 'VERIZON') {
        if (lot.sourceType !== 'VERIZON' && !/verizon/i.test(lot.auctionHouse) && !/verizon/i.test(lot.carrierStatus)) return false;
      } else if (filterAuctionHouse !== 'all' && lot.auctionHouse !== filterAuctionHouse) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'endingSoon') {
        return new Date(a.endTime).getTime() - new Date(b.endTime).getTime();
      }
      if (sortBy === 'priceAsc') {
        return a.currentBidUsd - b.currentBidUsd;
      }
      if (sortBy === 'priceDesc') {
        return b.currentBidUsd - a.currentBidUsd;
      }
      if (sortBy === 'profitDesc') {
        const profitA = a.estimatedBrazilRetailBrl - (a.currentBidUsd * usdRate);
        const profitB = b.estimatedBrazilRetailBrl - (b.currentBidUsd * usdRate);
        return profitB - profitA;
      }
      if (sortBy === 'mostBids') {
        return b.totalBidsCount - a.totalBidsCount;
      }
      return 0;
    });
  }, [auctions, searchQuery, filterModel, filterGrade, filterLotType, filterAuctionHouse, sortBy, usdRate]);

  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-100 flex flex-col font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 bg-emerald-600 text-white rounded-xl shadow-2xl flex items-center gap-3 border border-emerald-400/40 animate-in slide-in-from-bottom duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-200 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header with Navigation Menu & TWO Prominent Links to "Nosso Sistema de Leilões" */}
      <Header
        currentPage={currentPage}
        onNavigate={page => setCurrentPage(page)}
        onOpenSystem={handleOpenSystem}
        currency={currency}
        onToggleCurrency={() => setCurrency(prev => prev === 'USD' ? 'BRL' : 'USD')}
        usdRate={usdRate}
        isClientAuthenticated={isClientAuthenticated}
        isAdminAuthenticated={isAdminAuthenticated}
        onClientLogout={handleClientLogout}
        onAdminLogout={handleAdminLogout}
        clientName={currentUser.name}
      />

      <main className="flex-1">
        {/* ========================================================= */}
        {/* VIEW 1: HOME (VISÃO GERAL + HERO + LEILÕES EM DESTAQUE) */}
        {/* ========================================================= */}
        {currentPage === 'home' && (
          <div>
            <HeroSection
              onOpenSystem={handleOpenSystem}
              onOpenGradingGuide={() => setCurrentPage('gradeamento')}
              onOpenCalculator={() => setIsCalculatorModalOpen(true)}
              totalAuctionsCount={auctions.length}
            />

            {/* Quick Admin Banner */}
            <div className="bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 border-y border-amber-500/20 py-3.5 px-4">
              <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-slate-300">
                    Importação Excel/CSV (Padrão Oficial VERIZON) e integração PHP:
                  </span>
                  <span className="font-semibold text-white hidden md:inline">
                    Disponível também como arquivo único puro (HTML/JS) para rodar em qualquer hospedagem.
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href="/standalone_single_file.html"
                    download="leiloes_iphones_standalone.html"
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5 font-medium"
                    title="Baixar leiloes_iphones_standalone.html"
                  >
                    <Download className="w-3.5 h-3.5 text-amber-400" />
                    <span>Baixar Arquivo Único (HTML/JS)</span>
                  </a>
                  <button
                    onClick={() => setCurrentPage('admin')}
                    className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Painel Admin & Conexão PHP</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Destaques de Leilões na Home */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                    OPORTUNIDADES DE MAIOR MARGEM
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    Leilões Mais Disputados dos EUA
                  </h2>
                </div>
                <button
                  onClick={() => setCurrentPage('leiloes')}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2 self-start sm:self-auto"
                >
                  <span>Ver Todos os {auctions.length} Leilões</span>
                  <ArrowRight className="w-4 h-4 text-amber-400" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {auctions.slice(0, 3).map(lot => (
                  <AuctionCard
                    key={lot.id}
                    lot={lot}
                    onSelectLot={lotItem => setSelectedLotForDetail(lotItem)}
                    onQuickBid={lotItem => setSelectedLotForDetail(lotItem)}
                    onCalculateLot={lotItem => handleOpenCalculatorForLot(lotItem)}
                    currency={currency}
                    usdRate={usdRate}
                  />
                ))}
              </div>
            </section>

            {/* Como Funciona na Home */}
            <section className="bg-slate-950 border-t border-slate-800 py-16">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
                <div className="text-center max-w-3xl mx-auto space-y-2">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                    PASSO A PASSO
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    Como Arrematar iPhones nos EUA pelo Nosso Sistema
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-xs">
                  <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-2">
                    <span className="font-mono text-amber-400 font-bold text-sm block">01. Cadastro</span>
                    <h3 className="text-sm font-bold text-white">Habilitação Gratuita</h3>
                    <p className="text-slate-400 leading-relaxed">
                      Cadastre seu CPF ou CNPJ no topo para liberar limite em dólares e sua suíte de recebimento em Miami.
                    </p>
                  </div>
                  <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-2">
                    <span className="font-mono text-amber-400 font-bold text-sm block">02. Seleção</span>
                    <h3 className="text-sm font-bold text-white">Análise de Grades</h3>
                    <p className="text-slate-400 leading-relaxed">
                      Escolha lotes com base no laudo técnico de 30 pontos e consulte os IMEIs antes de lançar.
                    </p>
                  </div>
                  <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-2">
                    <span className="font-mono text-amber-400 font-bold text-sm block">03. Arrematação</span>
                    <h3 className="text-sm font-bold text-white">Lances ou Sniper</h3>
                    <p className="text-slate-400 leading-relaxed">
                      Dê lances manuais ou ative o robô para cobrir concorrentes no último segundo do leilão.
                    </p>
                  </div>
                  <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-2">
                    <span className="font-mono text-amber-400 font-bold text-sm block">04. Despacho</span>
                    <h3 className="text-sm font-bold text-white">Envio Aéreo ao Brasil</h3>
                    <p className="text-slate-400 leading-relaxed">
                      Recebemos no galpão parceiro de Miami e enviamos com seguro para seu endereço no Brasil.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW 2: LEILÕES (CATÁLOGO COMPLETO COM FILTROS) */}
        {/* ========================================================= */}
        {currentPage === 'leiloes' && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 mb-1">
                  <Gavel className="w-4 h-4" />
                  <span>CATÁLOGO COMPLETO DE LEILÕES DOS EUA</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Lotes de iPhones Disponíveis para Arrematação
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
                  Filtragem avançada por modelo, grade estético, quantidade por palete e casa de leilão americana.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenSystem('terminal')}
                  className="px-3.5 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2"
                >
                  <Gavel className="w-3.5 h-3.5 text-amber-400" />
                  <span>Terminal de Lances</span>
                </button>
                <button
                  onClick={() => setCurrentPage('admin')}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition-colors flex items-center gap-2"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Importar Planilha</span>
                </button>
              </div>
            </div>

            {/* Search & Filter Controls */}
            <div className="p-4 sm:p-5 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-4 shadow-lg shadow-black/20">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Buscar por modelo (16 Pro Max, 15 Pro), lote (US-89104), cor ou cidade dos EUA..."
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-2.5 text-xs text-slate-500 hover:text-slate-300"
                    >
                      Limpar
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-slate-400 hidden sm:inline">Ordenar:</span>
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value as any)}
                    className="bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                  >
                    <option value="endingSoon">Terminando Logo (Tempo)</option>
                    <option value="profitDesc">Maior Lucro Estimado no Brasil</option>
                    <option value="priceAsc">Menor Lance Atual</option>
                    <option value="priceDesc">Maior Lance Atual</option>
                    <option value="mostBids">Mais Disputados (Lances)</option>
                  </select>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80 text-xs">
                <span className="text-slate-400 font-medium mr-1 flex items-center gap-1">
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  Grade:
                </span>
                <button
                  onClick={() => setFilterGrade('all')}
                  className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                    filterGrade === 'all'
                      ? 'bg-amber-400 text-slate-950 font-bold'
                      : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  Todas
                </button>
                {(Object.keys(GRADE_EXPLANATIONS) as GradeType[]).map(gradeKey => (
                  <button
                    key={gradeKey}
                    onClick={() => setFilterGrade(gradeKey)}
                    className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                      filterGrade === gradeKey
                        ? 'bg-amber-400 text-slate-950 font-bold'
                        : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {gradeKey}
                  </button>
                ))}

                <div className="h-4 w-px bg-slate-800 mx-1 hidden md:block" />

                <span className="text-slate-400 font-medium ml-1 mr-1">Tipo de Lote:</span>
                <button
                  onClick={() => setFilterLotType('all')}
                  className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                    filterLotType === 'all'
                      ? 'bg-slate-200 text-slate-950 font-bold'
                      : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setFilterLotType('single')}
                  className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                    filterLotType === 'single'
                      ? 'bg-slate-200 text-slate-950 font-bold'
                      : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  Unidade (1x)
                </button>
                <button
                  onClick={() => setFilterLotType('small')}
                  className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                    filterLotType === 'small'
                      ? 'bg-slate-200 text-slate-950 font-bold'
                      : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  Pequenos (3 a 8x)
                </button>
                <button
                  onClick={() => setFilterLotType('wholesale')}
                  className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                    filterLotType === 'wholesale'
                      ? 'bg-slate-200 text-slate-950 font-bold'
                      : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  Atacado (10x a 25x)
                </button>

                <div className="h-4 w-px bg-slate-800 mx-1 hidden sm:block" />

                <button
                  onClick={() => setFilterAuctionHouse(filterAuctionHouse === 'VERIZON' ? 'all' : 'VERIZON')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                    filterAuctionHouse === 'VERIZON'
                      ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                      : 'bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20'
                  }`}
                >
                  <span>⚡ Lotes VERIZON</span>
                </button>
              </div>
            </div>

            {/* Results Count */}
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>
                Exibindo <strong>{filteredAuctions.length}</strong> leilões ativos de iPhones
              </span>
              {(filterGrade !== 'all' || filterLotType !== 'all' || searchQuery) && (
                <button
                  onClick={() => {
                    setFilterGrade('all');
                    setFilterLotType('all');
                    setSearchQuery('');
                  }}
                  className="text-amber-400 hover:underline"
                >
                  Limpar filtros
                </button>
              )}
            </div>

            {/* Grid */}
            {filteredAuctions.length === 0 ? (
              <div className="p-12 text-center bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl space-y-3">
                <Package className="w-10 h-10 text-slate-600 mx-auto" />
                <h3 className="text-base font-bold text-white">Nenhum leilão encontrado com estes filtros</h3>
                <button
                  onClick={() => {
                    setFilterGrade('all');
                    setFilterLotType('all');
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold"
                >
                  Restaurar Todos os Leilões
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAuctions.map(lot => (
                  <AuctionCard
                    key={lot.id}
                    lot={lot}
                    onSelectLot={lotItem => setSelectedLotForDetail(lotItem)}
                    onQuickBid={lotItem => setSelectedLotForDetail(lotItem)}
                    onCalculateLot={lotItem => handleOpenCalculatorForLot(lotItem)}
                    currency={currency}
                    usdRate={usdRate}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* ========================================================= */}
        {/* VIEW 3: GRADEAMENTO (PÁGINA INTERNA DEDICADA) */}
        {/* ========================================================= */}
        {currentPage === 'gradeamento' && (
          <GradeamentoPage
            onSelectGradeFilter={grade => {
              setFilterGrade(grade);
              setCurrentPage('leiloes');
            }}
            onNavigateLeiloes={() => setCurrentPage('leiloes')}
          />
        )}

        {/* ========================================================= */}
        {/* VIEW 4: QUEM SOMOS (PÁGINA INTERNA DEDICADA) */}
        {/* ========================================================= */}
        {currentPage === 'quem-somos' && (
          <QuemSomosPage
            onNavigateLeiloes={() => setCurrentPage('leiloes')}
            onOpenSystem={handleOpenSystem}
          />
        )}

        {/* ========================================================= */}
        {/* VIEW 5: PAINEL DO CLIENTE (PORTAL DO ARREMATANTE) */}
        {/* ========================================================= */}
        {currentPage === 'cliente' && (
          !isClientAuthenticated ? (
            <ClientLoginGate
              currentUser={currentUser}
              onLoginSuccess={(user) => {
                setIsClientAuthenticated(true);
                setCurrentUser(user);
                try {
                  localStorage.setItem('us_client_auth', 'true');
                  localStorage.setItem('us_iphone_client_user', JSON.stringify(user));
                } catch (e) {}
                showToast(`Bem-vindo, ${user.name}! Acesso ao portal liberado.`);
              }}
              onCancel={() => setCurrentPage('home')}
            />
          ) : (
            <ClientePage
              currentUser={currentUser}
              onUpdateCurrentUser={handleUpdateCurrentUser}
              auctions={auctions}
              userBids={userBids}
              onPlaceBid={handlePlaceBid}
              onSelectLot={lotItem => setSelectedLotForDetail(lotItem)}
              currency={currency}
              usdRate={usdRate}
              onLogout={handleClientLogout}
            />
          )
        )}

        {/* ========================================================= */}
        {/* VIEW 6: PAINEL ADMIN (IMPORTAÇÃO EXCEL, OFERTAS, LOTES) */}
        {/* ========================================================= */}
        {currentPage === 'admin' && (
          !isAdminAuthenticated ? (
            <AdminLoginGate
              onLoginSuccess={() => {
                setIsAdminAuthenticated(true);
                try {
                  localStorage.setItem('us_admin_auth', 'true');
                } catch (e) {}
                showToast('Login de administrador realizado com sucesso!');
              }}
              onCancel={() => setCurrentPage('home')}
            />
          ) : (
            <AdminPage
              auctions={auctions}
              onUpdateAuctions={handleUpdateAuctions}
              currentUser={currentUser}
              onUpdateCurrentUser={handleUpdateCurrentUser}
              usdRate={usdRate}
              onUpdateUsdRate={handleUpdateUsdRate}
              onLogout={handleAdminLogout}
            />
          )
        )}
      </main>

      {/* Global Footer */}
      <footer className="border-t border-slate-800 bg-[#080c13] py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-bold text-slate-300">USAFAST LEILÕES HUB</span>
            <span>·</span>
            <span>Assessoria de Leilões em Miami & Plataforma Oficial de Arrematação</span>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={() => setCurrentPage('quem-somos')}
              className="hover:text-slate-300 transition-colors"
            >
              Quem Somos
            </button>
            <span>·</span>
            <button
              onClick={() => setCurrentPage('leiloes')}
              className="hover:text-slate-300 transition-colors"
            >
              Leilões
            </button>
            <span>·</span>
            <button
              onClick={() => setCurrentPage('gradeamento')}
              className="hover:text-slate-300 transition-colors"
            >
              Gradeamento
            </button>
            <span>·</span>
            <button
              onClick={() => setCurrentPage('cliente')}
              className="text-emerald-400 hover:underline font-semibold"
            >
              Painel do Cliente
            </button>
            <span>·</span>
            <button
              onClick={() => setCurrentPage('admin')}
              className="text-amber-400 hover:underline font-semibold"
            >
              Painel Admin (Excel)
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AuctionDetailModal
        lot={selectedLotForDetail}
        isOpen={!!selectedLotForDetail}
        onClose={() => setSelectedLotForDetail(null)}
        onPlaceBid={handlePlaceBid}
        onOpenSystem={() => {
          setSelectedLotForDetail(null);
          handleOpenSystem('terminal');
        }}
        currency={currency}
        usdRate={usdRate}
      />

      <AuctionSystemModal
        isOpen={isSystemModalOpen}
        onClose={() => setIsSystemModalOpen(false)}
        initialTab={systemModalTab}
        auctions={auctions}
        userBids={userBids}
        onPlaceQuickBid={handlePlaceBid}
        currentUser={currentUser}
        onUpdateUser={updated => {
          setCurrentUser(updated);
          showToast('Cadastro atualizado com sucesso no sistema!');
        }}
        usdRate={usdRate}
      />

      <GradingGuideModal
        isOpen={isGradingModalOpen}
        onClose={() => setIsGradingModalOpen(false)}
        onSelectGradeFilter={grade => {
          setFilterGrade(grade);
          setCurrentPage('leiloes');
        }}
      />

      <ImportCalculatorModal
        isOpen={isCalculatorModalOpen}
        onClose={() => setIsCalculatorModalOpen(false)}
        usdRate={usdRate}
        initialLotPriceUsd={calculatorInitData.priceUsd}
        initialLotUnits={calculatorInitData.units}
      />
    </div>
  );
}
