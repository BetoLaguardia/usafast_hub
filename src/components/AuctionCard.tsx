import React, { useState, useEffect } from 'react';
import { Gavel, Clock, MapPin, Battery, Smartphone, ShieldCheck, ArrowUpRight, Calculator, Layers } from 'lucide-react';
import { AuctionLot } from '../types/auction';
import { GRADE_EXPLANATIONS } from '../data/auctionsData';

interface AuctionCardProps {
  lot: AuctionLot;
  onSelectLot: (lot: AuctionLot) => void;
  onQuickBid: (lot: AuctionLot) => void;
  onCalculateLot: (lot: AuctionLot) => void;
  currency: 'USD' | 'BRL';
  usdRate: number;
}

export const AuctionCard: React.FC<AuctionCardProps> = ({
  lot,
  onSelectLot,
  onQuickBid,
  onCalculateLot,
  currency,
  usdRate
}) => {
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number; isExpired: boolean }>({
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false
  });

  useEffect(() => {
    const calculateTime = () => {
      const difference = new Date(lot.endTime).getTime() - Date.now();
      if (difference <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, isExpired: true });
        return;
      }
      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      setTimeLeft({ hours, minutes, seconds, isExpired: false });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [lot.endTime]);

  const gradeInfo = GRADE_EXPLANATIONS[lot.grade] || GRADE_EXPLANATIONS['Grade A'];

  const formattedCurrentPrice = currency === 'USD'
    ? `$ ${lot.currentBidUsd.toLocaleString()} USD`
    : `R$ ${(lot.currentBidUsd * usdRate).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`;

  const currentBidBrl = lot.currentBidUsd * usdRate;
  const estimatedGrossProfitBrl = lot.estimatedBrazilRetailBrl - currentBidBrl;

  return (
    <div className="group bg-slate-900/90 border border-slate-800 hover:border-slate-700/90 rounded-2xl overflow-hidden flex flex-col transition-all duration-200 hover:shadow-xl hover:shadow-black/50">
      {/* Top Image & Badge Container */}
      <div 
        className="relative aspect-[4/3] bg-slate-950 overflow-hidden cursor-pointer"
        onClick={() => onSelectLot(lot)}
      >
        <img
          src={lot.imageUrl}
          alt={lot.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/30 pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-1.5">
            <span className={`px-2.5 py-1 rounded text-xs font-bold border backdrop-blur-md shadow-sm ${gradeInfo.badgeColor}`}>
              {lot.grade}
            </span>
            {(lot.sourceType === 'VERIZON' || /verizon/i.test(lot.auctionHouse) || /verizon/i.test(lot.carrierStatus)) && (
              <span className="px-2 py-0.5 rounded bg-red-600 text-white font-black text-[10px] tracking-wider uppercase shadow-md">
                VERIZON
              </span>
            )}
          </div>

          <span className="px-2.5 py-1 rounded bg-slate-950/80 backdrop-blur-md border border-slate-800 text-slate-200 text-[11px] font-mono flex items-center gap-1.5 shadow-sm">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            {timeLeft.isExpired ? (
              <span className="text-rose-400 font-bold">Encerrado</span>
            ) : (
              <span>
                {String(timeLeft.hours).padStart(2, '0')}h {String(timeLeft.minutes).padStart(2, '0')}m {String(timeLeft.seconds).padStart(2, '0')}s
              </span>
            )}
          </span>
        </div>

        {/* Bottom overlay info */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-slate-300">
          <span className="font-mono text-[11px] bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800 text-amber-300">
            {lot.lotNumber}
          </span>
          <span className="text-[11px] bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800 text-slate-300">
            {lot.quantity} {lot.quantity === 1 ? 'Aparelho' : 'Aparelhos'}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* US Auction Origin */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
            <span className="truncate max-w-[180px]">{lot.auctionHouse}</span>
            <span className="flex items-center gap-1 text-slate-300 shrink-0">
              <MapPin className="w-3 h-3 text-amber-400" />
              {lot.location}
            </span>
          </div>

          {/* Title */}
          <h3 
            onClick={() => onSelectLot(lot)}
            className="text-base font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-2 cursor-pointer leading-snug"
          >
            {lot.title}
          </h3>

          {/* Key Specs Breakdown */}
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
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
              <span className="truncate text-slate-400">Clean ESN / FMI OFF</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span>
              <span className="truncate text-emerald-400">Desbloqueado</span>
            </div>
          </div>
        </div>

        {/* Pricing & Bids Section */}
        <div className="pt-2 border-t border-slate-800/80 space-y-3">
          <div className="flex items-end justify-between">
            <div>
              <span className="text-[11px] text-slate-400 block">Lance Atual:</span>
              <span className="text-xl sm:text-2xl font-black text-amber-400 font-mono tracking-tight block">
                {formattedCurrentPrice}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {currency === 'USD' ? `≈ R$ ${currentBidBrl.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}` : `≈ $ ${lot.currentBidUsd.toLocaleString()} USD`}
              </span>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-400 block">Lucro Bruto Est.:</span>
              <span className="text-xs font-bold text-emerald-400 font-mono block">
                + R$ {estimatedGrossProfitBrl.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {lot.totalBidsCount} lances dados
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => onSelectLot(lot)}
              className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Ver Manifesto</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <button
              onClick={() => onQuickBid(lot)}
              className="py-2 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm shadow-amber-500/10"
            >
              <Gavel className="w-3.5 h-3.5" />
              <span>Dar Lance</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
