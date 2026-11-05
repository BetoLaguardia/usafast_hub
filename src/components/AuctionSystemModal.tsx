import React, { useState } from 'react';
import { X, Gavel, UserCheck, Shield, MapPin, CheckCircle2, AlertTriangle, ArrowRight, DollarSign, Clock, RefreshCw, Send, Lock } from 'lucide-react';
import { AuctionLot, SystemUser } from '../types/auction';

interface AuctionSystemModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'terminal' | 'register';
  auctions: AuctionLot[];
  userBids: { lotId: string; lotTitle: string; amountUsd: number; timestamp: string; status: 'vencendo' | 'superado' }[];
  onPlaceQuickBid: (lotId: string, customAmount: number) => void;
  currentUser: SystemUser;
  onUpdateUser: (user: SystemUser) => void;
  usdRate: number;
}

export const AuctionSystemModal: React.FC<AuctionSystemModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'terminal',
  auctions,
  userBids,
  onPlaceQuickBid,
  currentUser,
  onUpdateUser,
  usdRate
}) => {
  const [activeTab, setActiveTab] = useState<'terminal' | 'register' | 'sniper'>(initialTab);
  
  // Registration form state
  const [formData, setFormData] = useState({
    name: currentUser.name || '',
    email: currentUser.email || '',
    cpfCnpj: currentUser.cpfCnpj || '',
    phone: currentUser.phone || '',
    companyType: 'lojista',
    monthlyVolume: '10-30',
    warehousePref: 'miami'
  });
  const [registeredSuccess, setRegisteredSuccess] = useState(false);

  // Quick bid selector
  const [selectedLotId, setSelectedLotId] = useState<string>(auctions[0]?.id || '');
  const [customBidAmount, setCustomBidAmount] = useState<number>(0);
  const [bidSuccessNotice, setBidSuccessNotice] = useState<string | null>(null);

  // Sniper setting
  const [sniperActive, setSniperActive] = useState<boolean>(true);
  const [sniperMaxLimit, setSniperMaxLimit] = useState<number>(2500);

  if (!isOpen) return null;

  const currentSelectedLot = auctions.find(a => a.id === selectedLotId) || auctions[0];
  const minRequiredBid = currentSelectedLot ? currentSelectedLot.currentBidUsd + 25 : 100;

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    onUpdateUser({
      name: formData.name,
      email: formData.email,
      cpfCnpj: formData.cpfCnpj || '00.000.000/0001-99',
      phone: formData.phone || '+55 (11) 99876-5432',
      biddingLimitUsd: 25000,
      verifiedStatus: true,
      registeredDate: new Date().toLocaleDateString('pt-BR')
    });
    setRegisteredSuccess(true);
    setTimeout(() => {
      setRegisteredSuccess(false);
      setActiveTab('terminal');
    }, 1800);
  };

  const handleExecuteBid = () => {
    const amountToBid = customBidAmount > 0 ? customBidAmount : minRequiredBid;
    onPlaceQuickBid(currentSelectedLot.id, amountToBid);
    setBidSuccessNotice(`Lance de $${amountToBid.toLocaleString()} USD registrado com sucesso no lote ${currentSelectedLot.lotNumber}!`);
    setTimeout(() => setBidSuccessNotice(null), 3500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Gavel className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Nosso Sistema de Leilões
                </h2>
                <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold font-mono">
                  SISTEMA OFICIAL ARREMATANTE
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Plataforma integrada de lances, habilitação e despacho alfandegário Miami/EUA
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Fechar sistema"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* System Navigation Tabs */}
        <div className="flex items-center gap-1 px-6 pt-3 border-b border-slate-800 bg-slate-900/40 text-xs font-medium">
          <button
            onClick={() => setActiveTab('terminal')}
            className={`px-4 py-2.5 border-b-2 font-semibold transition-colors flex items-center gap-2 ${
              activeTab === 'terminal'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Gavel className="w-4 h-4" />
            <span>Painel de Lances & Arrematação</span>
          </button>
          
          <button
            onClick={() => setActiveTab('register')}
            className={`px-4 py-2.5 border-b-2 font-semibold transition-colors flex items-center gap-2 ${
              activeTab === 'register'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Cadastro & Habilitação de Importador</span>
          </button>

          <button
            onClick={() => setActiveTab('sniper')}
            className={`px-4 py-2.5 border-b-2 font-semibold transition-colors flex items-center gap-2 ${
              activeTab === 'sniper'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Sniper Automático & Logística</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-200 text-sm">
          {bidSuccessNotice && (
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{bidSuccessNotice}</span>
            </div>
          )}

          {/* TAB 1: TERMINAL DE LANCES */}
          {activeTab === 'terminal' && (
            <div className="space-y-6">
              {/* Account Quick Status Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-950/70 border border-slate-800 rounded-xl">
                <div>
                  <span className="text-[11px] text-slate-400 block">Arrematante Registrado</span>
                  <span className="font-semibold text-white">{currentUser.name || 'Importador Brasil Conectado'}</span>
                  <span className="text-[10px] text-emerald-400 font-mono block mt-0.5">
                    ● Licença Ativa ({currentUser.verifiedStatus ? 'Verificado' : 'Pré-aprovado'})
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Limite de Lances em Aberto</span>
                  <span className="font-semibold text-amber-400 font-mono">
                    ${currentUser.biddingLimitUsd.toLocaleString()} USD
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                    ≈ R$ {(currentUser.biddingLimitUsd * usdRate).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Armazém de Consolidação</span>
                  <span className="font-semibold text-slate-200 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    Miami Hub FL (Suite #8920)
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Doral / Miami - Frete Aéreo Express</span>
                </div>
              </div>

              {/* Live Bidding Console */}
              <div className="p-4 bg-slate-800/40 border border-slate-700/60 rounded-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-white text-base flex items-center gap-2">
                      <Gavel className="w-4 h-4 text-amber-400" />
                      Lançador Rápido de Lances
                    </h3>
                    <p className="text-xs text-slate-400">
                      Envie lances diretamente para as casas de leilão autorizadas dos EUA
                    </p>
                  </div>
                  <div className="text-xs text-slate-400 font-mono">
                    Conexão Segura com Verizon & Operadoras dos EUA
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1">
                      Selecione o Lote Desejado:
                    </label>
                    <select
                      value={selectedLotId}
                      onChange={e => {
                        setSelectedLotId(e.target.value);
                        const lot = auctions.find(a => a.id === e.target.value);
                        if (lot) setCustomBidAmount(lot.currentBidUsd + 25);
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                    >
                      {auctions.map(lot => (
                        <option key={lot.id} value={lot.id}>
                          {lot.lotNumber} - {lot.title.slice(0, 48)}... (${lot.currentBidUsd} USD)
                        </option>
                      ))}
                    </select>

                    {currentSelectedLot && (
                      <div className="mt-3 p-3 bg-slate-950/80 rounded-lg text-xs space-y-1.5 border border-slate-800">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Lance Atual no Leilão:</span>
                          <span className="font-mono font-bold text-white">${currentSelectedLot.currentBidUsd.toLocaleString()} USD</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Lance Mínimo Aceito:</span>
                          <span className="font-mono font-semibold text-amber-400">${minRequiredBid.toLocaleString()} USD</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Grade & Aparelhos:</span>
                          <span className="text-slate-200">{currentSelectedLot.grade} · {currentSelectedLot.quantity} unidade(s)</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col justify-between">
                    <div>
                      <label className="text-xs font-medium text-slate-300 block mb-1">
                        Seu Lance em Dólar (USD):
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-slate-500 font-mono font-bold">$</span>
                        <input
                          type="number"
                          min={minRequiredBid}
                          step="25"
                          value={customBidAmount || minRequiredBid}
                          onChange={e => setCustomBidAmount(Number(e.target.value))}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-amber-400"
                        />
                      </div>
                      <span className="text-[11px] text-slate-400 block mt-1">
                        Valor aproximado em Reais: R$ {(((customBidAmount || minRequiredBid) * usdRate)).toLocaleString('pt-BR', { maximumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="pt-4 flex items-center gap-2">
                      <button
                        onClick={handleExecuteBid}
                        className="flex-1 py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-2 shadow-md shadow-amber-500/10"
                      >
                        <Gavel className="w-4 h-4" />
                        <span>Confirmar Lance no Sistema</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Meus Lances Registrados */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-white text-xs">
                    Histórico de Lances Ativos no Nosso Sistema
                  </h4>
                  <span className="text-[11px] text-slate-400">
                    {userBids.length} lance(s) monitorado(s)
                  </span>
                </div>

                {userBids.length === 0 ? (
                  <div className="p-6 text-center border border-dashed border-slate-800 rounded-xl text-slate-500 text-xs">
                    Nenhum lance efetuado ainda nesta sessão. Escolha um lote acima ou clique em "Dar Lance" em qualquer anúncio de leilão.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-800 border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40">
                    {userBids.map((ub, idx) => (
                      <div key={idx} className="p-3 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-semibold text-white block">{ub.lotTitle}</span>
                          <span className="text-[11px] text-slate-400">{ub.timestamp}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-bold text-amber-400 block">
                            ${ub.amountUsd.toLocaleString()} USD
                          </span>
                          <span className="text-[10px] text-emerald-400">
                            {ub.status === 'vencendo' ? '● Maior Lance (Ganhando)' : '● Lance Superado'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: CADASTRO DE ARREMATANTE */}
          {activeTab === 'register' && (
            <div className="space-y-5">
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-emerald-300 text-sm">
                      Habilitação Oficial para Leilões nos EUA
                    </h3>
                    <p className="text-xs text-slate-300 mt-1">
                      O cadastro no nosso sistema permite dar lances em leilões fechados da Apple, Verizon e AT&T Surplus sem necessidade de Social Security Number (SSN) americano.
                    </p>
                  </div>
                </div>
              </div>

              {registeredSuccess ? (
                <div className="p-8 text-center bg-slate-950 rounded-xl border border-emerald-500/40 space-y-3">
                  <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                  <h4 className="text-base font-bold text-white">Cadastro Aprovado no Sistema de Leilões!</h4>
                  <p className="text-xs text-slate-300 max-w-md mx-auto">
                    Seu limite de arrematação de $25.000 USD foi liberado e seu endereço de redirecionamento no galpão de Miami foi ativado. Redirecionando para o terminal...
                  </p>
                </div>
              ) : (
                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-slate-300 block mb-1">Nome Completo / Razão Social *</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Ex: Carlos Eduardo / Tech Imports Ltda"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-300 block mb-1">E-mail Corporativo ou Pessoal *</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        placeholder="seuemail@exemplo.com.br"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-300 block mb-1">CPF ou CNPJ do Arrematante *</label>
                      <input
                        type="text"
                        required
                        value={formData.cpfCnpj}
                        onChange={e => setFormData({ ...formData, cpfCnpj: e.target.value })}
                        placeholder="000.000.000-00 ou CNPJ"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-300 block mb-1">WhatsApp / Telefone para Alertas de Lances *</label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+55 (11) 99999-9999"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-300 block mb-1">Perfil do Comprador</label>
                      <select
                        value={formData.companyType}
                        onChange={e => setFormData({ ...formData, companyType: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                      >
                        <option value="lojista">Lojista de Celulares / Assistência Técnica</option>
                        <option value="importador">Importador Profissional / Distribuidor</option>
                        <option value="individual">Comprador Individual / Uso Próprio e Revenda</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-slate-300 block mb-1">Volume Mensal Pretendido</label>
                      <select
                        value={formData.monthlyVolume}
                        onChange={e => setFormData({ ...formData, monthlyVolume: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                      >
                        <option value="1-5">1 a 5 aparelhos por mês</option>
                        <option value="10-30">10 a 30 aparelhos (Lotes Pequenos)</option>
                        <option value="50+">50+ aparelhos (Paletes Fechados de Atacado)</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      ✓ Sem taxa de anuidade · Habilitação imediata
                    </span>
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs transition-colors shadow-lg shadow-emerald-500/10 flex items-center gap-2"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>Concluir Cadastro & Liberar Lances</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 3: SNIPER & LOGÍSTICA */}
          {activeTab === 'sniper' && (
            <div className="space-y-5">
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-white text-sm">
                      Ferramenta de Lance Automático (Bid Sniper)
                    </h4>
                    <p className="text-xs text-slate-400">
                      O robô envia seu lance nos últimos 4 segundos antes do encerramento do leilão americano para evitar guerra de preços.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sniperActive}
                      onChange={e => setSniperActive(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                  </label>
                </div>

                <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="text-slate-400 block mb-1">Teto Máximo do Sniper (USD):</label>
                    <input
                      type="number"
                      value={sniperMaxLimit}
                      onChange={e => setSniperMaxLimit(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Margem de Incremento:</label>
                    <select className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400">
                      <option value="25">+$25 USD sobre o lance concorrente</option>
                      <option value="50">+$50 USD sobre o lance concorrente</option>
                      <option value="100">+$100 USD sobre o lance concorrente</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Endereço de Entrega nos EUA */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <h4 className="font-semibold text-white text-sm flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-amber-400" />
                  Seu Endereço de Recebimento no Galpão Miami
                </h4>
                <p className="text-xs text-slate-400">
                  Ao arrematar qualquer lote nos EUA, este é o endereço fornecido para as casas de leilão enviarem seus iPhones:
                </p>
                <div className="p-3 bg-slate-900 rounded-lg font-mono text-xs text-slate-200 border border-slate-800 space-y-1">
                  <div><strong>Destinatário:</strong> US iPhone Hub / {currentUser.name || 'Arrematante Brasil'}</div>
                  <div><strong>Endereço:</strong> 8350 NW 53rd Street, Suite 302</div>
                  <div><strong>Cidade / Estado:</strong> Doral / Miami - Florida (FL)</div>
                  <div><strong>ZIP Code:</strong> 33166-4702</div>
                  <div><strong>Telefone do Galpão:</strong> +1 (305) 555-0199</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Sistema Criptografado SSL 256-bit</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium transition-colors"
          >
            Fechar Painel
          </button>
        </div>
      </div>
    </div>
  );
};
