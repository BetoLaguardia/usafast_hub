import React, { useState } from 'react';
import { X, Gavel, MapPin, Download, CheckCircle2, ShieldCheck, Battery, Smartphone, Award, Clock, ArrowRight, Share2, DollarSign } from 'lucide-react';
import { AuctionLot } from '../types/auction';
import { GRADE_EXPLANATIONS } from '../data/auctionsData';

interface AuctionDetailModalProps {
  lot: AuctionLot | null;
  isOpen: boolean;
  onClose: () => void;
  onPlaceBid: (lotId: string, amountUsd: number) => void;
  onOpenSystem: () => void;
  currency: 'USD' | 'BRL';
  usdRate: number;
}

export const AuctionDetailModal: React.FC<AuctionDetailModalProps> = ({
  lot,
  isOpen,
  onClose,
  onPlaceBid,
  onOpenSystem,
  currency,
  usdRate
}) => {
  if (!isOpen || !lot) return null;

  const minBid = lot.currentBidUsd + 25;
  const [bidValue, setBidValue] = useState<number>(minBid);
  const [bidStatus, setBidStatus] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState<string>(lot.imageUrl);

  const gradeInfo = GRADE_EXPLANATIONS[lot.grade];

  const handleBidSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (bidValue < minBid) {
      alert(`O lance mínimo precisa ser de $${minBid} USD`);
      return;
    }
    onPlaceBid(lot.id, bidValue);
    setBidStatus(`Lance de $${bidValue.toLocaleString()} USD enviado com sucesso para ${lot.auctionHouse}!`);
    setTimeout(() => setBidStatus(null), 4000);
  };

  const handleDownloadCsv = () => {
    const headers = ['Item', 'Modelo', 'Armazenamento', 'Cor', 'Grade', 'Bateria %', 'IMEI Status', 'Operadora', 'Part #', 'Origem Estoque', 'Descricao'];
    const rows = lot.manifest.map((item, idx) => [
      `#${idx + 1}`,
      `"${item.model}"`,
      item.storage,
      item.color,
      item.grade,
      `${item.batteryHealth}%`,
      item.imeiMasked,
      item.carrierStatus,
      item.partNumber || '-',
      item.inventorySource || 'Carrier Return',
      `"${item.itemDescription || '-'}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `manifesto_lote_${lot.lotNumber}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formattedCurrentPrice = currency === 'USD'
    ? `$ ${lot.currentBidUsd.toLocaleString()} USD`
    : `R$ ${(lot.currentBidUsd * usdRate).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`;

  const formattedRetailPrice = currency === 'USD'
    ? `$ ${(lot.estimatedBrazilRetailBrl / usdRate).toLocaleString('en-US', { maximumFractionDigits: 0 })} USD`
    : `R$ ${lot.estimatedBrazilRetailBrl.toLocaleString('pt-BR')}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
      <div 
        className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-5xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-amber-400 font-bold">
              LOTE {lot.lotNumber}
            </span>
            {(lot.sourceType === 'VERIZON' || /verizon/i.test(lot.auctionHouse) || /verizon/i.test(lot.carrierStatus)) && (
              <span className="px-2.5 py-0.5 rounded bg-red-600 text-white font-black text-[10px] tracking-wider uppercase shadow-md">
                VERIZON OFICIAL
              </span>
            )}
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
              <span>{lot.auctionHouse}</span>
              <span>·</span>
              <span className="flex items-center gap-1 text-slate-300">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                {lot.location}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {(lot.originalListingUrl || lot.listingUrl) && (
              <a
                href={lot.originalListingUrl || lot.listingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-red-300 rounded-lg text-xs font-semibold transition-colors"
                title="Abrir anúncio oficial do lote"
              >
                <span>Ver Anúncio Oficial ↗</span>
              </a>
            )}
            <button
              onClick={handleDownloadCsv}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors"
              title="Baixar lista completa de aparelhos em CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Manifesto (CSV)</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-200 text-xs">
          {bidStatus && (
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-medium">{bidStatus}</span>
            </div>
          )}

          {/* Top Split: Gallery & Purchase / Bid Module */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Gallery Column (5 cols) */}
            <div className="lg:col-span-5 space-y-3">
              <div className="aspect-[4/3] rounded-xl overflow-hidden bg-slate-950 border border-slate-800 relative">
                <img
                  src={activeImage}
                  alt={lot.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3">
                  <span className={`px-2.5 py-1 rounded text-xs font-bold border backdrop-blur-md ${gradeInfo.badgeColor}`}>
                    {lot.grade}
                  </span>
                </div>
                <div className="absolute bottom-3 left-3 right-3 bg-slate-950/80 backdrop-blur-sm border border-slate-800/80 rounded-lg p-2 flex items-center justify-between text-[11px]">
                  <span className="text-slate-300">Quantidade no Lote:</span>
                  <span className="font-bold text-white font-mono">{lot.quantity} {lot.quantity === 1 ? 'Aparelho' : 'Aparelhos'}</span>
                </div>
              </div>

              {/* Thumbnails */}
              {lot.galleryImages && lot.galleryImages.length > 1 && (
                <div className="flex gap-2">
                  {lot.galleryImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(img)}
                      className={`w-16 h-12 rounded-lg overflow-hidden border transition-all ${
                        activeImage === img ? 'border-amber-400 scale-95' : 'border-slate-800 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Diagnostic 30-points summary */}
              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
                <span className="font-semibold text-slate-300 block">Laudo de Inspeção Técnica:</span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Clean IMEI / ESN OK</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>iCloud / FMI OFF</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Face ID 100% Ativo</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>True Tone Original</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Sem Bloqueio MDM</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Câmeras 48MP Testadas</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bidding & Spec Module (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
                  {lot.title}
                </h1>
                <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
                  {lot.description}
                </p>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 p-3.5 bg-slate-950/50 border border-slate-800 rounded-xl text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Classificação / Grade</span>
                  <span className={`font-bold font-mono ${gradeInfo.textColor}`}>{lot.grade}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Saúde de Bateria</span>
                  <span className="font-semibold text-white font-mono flex items-center gap-1">
                    <Battery className="w-3.5 h-3.5 text-emerald-400" />
                    {lot.batteryHealthRange}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Armazenamento</span>
                  <span className="font-semibold text-white">{lot.primaryStorage}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Status Operadora</span>
                  <span className="font-semibold text-emerald-400">{lot.carrierStatus}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Casa de Leilão EUA</span>
                  <span className="font-semibold text-slate-200">{lot.auctionHouse}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Localização EUA</span>
                  <span className="font-semibold text-slate-200">{lot.location}</span>
                </div>
              </div>

              {/* Price & Bidding Form Box */}
              <div className="p-4 bg-gradient-to-br from-slate-950 to-slate-900 border border-amber-500/30 rounded-xl space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-[11px] text-slate-400 uppercase font-semibold block">
                      Lance Atual no Leilão:
                    </span>
                    <span className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">
                      {formattedCurrentPrice}
                    </span>
                    <span className="text-[11px] text-slate-400 block font-mono">
                      {currency === 'USD' ? `≈ R$ ${(lot.currentBidUsd * usdRate).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}` : `≈ $ ${lot.currentBidUsd.toLocaleString()} USD`}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 block">Revenda Estimada Brasil:</span>
                    <span className="text-base font-bold text-white font-mono">
                      {formattedRetailPrice}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-semibold block">
                      Margem Bruta Estimada: R$ {(lot.estimatedBrazilRetailBrl - (lot.currentBidUsd * usdRate)).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                </div>

                <form onSubmit={handleBidSubmit} className="pt-2 border-t border-slate-800/80 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-2.5 text-slate-400 font-mono font-bold">$</span>
                      <input
                        type="number"
                        min={minBid}
                        step="25"
                        value={bidValue}
                        onChange={e => setBidValue(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-8 pr-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-amber-400"
                        placeholder={`Mínimo $${minBid}`}
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs transition-colors flex items-center gap-2 shadow-md shadow-amber-500/10 shrink-0"
                    >
                      <Gavel className="w-4 h-4" />
                      <span>Dar Lance Agora</span>
                    </button>
                  </div>

                  {/* Preset Bids */}
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400">Sugestões:</span>
                    <button
                      type="button"
                      onClick={() => setBidValue(lot.currentBidUsd + 25)}
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-[11px] font-mono text-slate-300"
                    >
                      + $25
                    </button>
                    <button
                      type="button"
                      onClick={() => setBidValue(lot.currentBidUsd + 50)}
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-[11px] font-mono text-slate-300"
                    >
                      + $50
                    </button>
                    <button
                      type="button"
                      onClick={() => setBidValue(lot.currentBidUsd + 100)}
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-[11px] font-mono text-slate-300"
                    >
                      + $100
                    </button>
                    <button
                      type="button"
                      onClick={onOpenSystem}
                      className="ml-auto text-amber-400 hover:text-amber-300 text-[11px] underline"
                    >
                      Configurar no Nosso Sistema ➔
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Device Manifest Table (Itemized breakdown) */}
          <div className="space-y-3 pt-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-amber-400" />
                  Manifesto Técnico Item a Item ({lot.manifest.length} aparelhos inspecionados)
                </h3>
                <p className="text-[11px] text-slate-400">
                  Cada iPhone possui número IMEI mascarado por segurança, capacidade e percentual de saúde de bateria comprovada.
                </p>
              </div>

              <button
                onClick={handleDownloadCsv}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs transition-colors flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exportar CSV</span>
              </button>
            </div>

            <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-950/60 max-h-64 overflow-y-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 text-[11px]">
                    <th className="py-2 px-3 font-semibold">#</th>
                    <th className="py-2 px-3 font-semibold">Modelo & Peça</th>
                    <th className="py-2 px-3 font-semibold">Armazenamento</th>
                    <th className="py-2 px-3 font-semibold">Grade</th>
                    <th className="py-2 px-3 font-semibold">Part #</th>
                    <th className="py-2 px-3 font-semibold">Origem Estoque</th>
                    <th className="py-2 px-3 font-semibold">Bateria</th>
                    <th className="py-2 px-3 font-semibold">IMEI / Clean ESN</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-200">
                  {lot.manifest.map((dev, idx) => (
                    <tr key={dev.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-2 px-3 font-mono text-slate-400">{idx + 1}</td>
                      <td className="py-2 px-3">
                        <span className="font-semibold text-white block">{dev.model}</span>
                        {dev.itemDescription && (
                          <span className="text-[10px] text-slate-400 font-mono block truncate max-w-[200px]" title={dev.itemDescription}>
                            {dev.itemDescription}
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3 font-mono">{dev.storage}</td>
                      <td className="py-2 px-3">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${GRADE_EXPLANATIONS[dev.grade]?.badgeColor || ''}`}>
                          {dev.grade}
                        </span>
                      </td>
                      <td className="py-2 px-3 font-mono text-slate-400">{dev.partNumber || '-'}</td>
                      <td className="py-2 px-3">
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300">
                          {dev.inventorySource || 'Carrier Clean'}
                        </span>
                      </td>
                      <td className="py-2 px-3 font-mono text-emerald-400 font-semibold">{dev.batteryHealth}%</td>
                      <td className="py-2 px-3 font-mono text-slate-400">{dev.imeiMasked}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bid History Table */}
          <div className="space-y-2 pt-2">
            <h4 className="font-semibold text-white text-xs">
              Histórico Recente de Lances deste Lote:
            </h4>
            <div className="divide-y divide-slate-800/60 border border-slate-800 rounded-xl bg-slate-950/40 overflow-hidden">
              {lot.bidsHistory.map(bh => (
                <div key={bh.id} className="p-2.5 px-3.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-200">{bh.bidderName}</span>
                    {bh.isAutomatic && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 font-mono">
                        Sniper Auto
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-slate-500 text-[11px]">{bh.timestamp}</span>
                    <span className="font-mono font-bold text-white">${bh.amountUsd.toLocaleString()} USD</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs">
          <span className="text-slate-400">
            Arrematações sujeitas a despacho aéreo express via Porto de Miami.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium transition-colors"
          >
            Fechar Janela
          </button>
        </div>
      </div>
    </div>
  );
};
