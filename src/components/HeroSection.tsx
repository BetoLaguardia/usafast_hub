import React from 'react';
import { Gavel, UserPlus, ShieldCheck, CheckCircle2, Layers, Calculator, MapPin, ArrowRight } from 'lucide-react';

interface HeroSectionProps {
  onOpenSystem: (tab?: 'terminal' | 'register') => void;
  onOpenGradingGuide: () => void;
  onOpenCalculator: () => void;
  totalAuctionsCount: number;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onOpenSystem,
  onOpenGradingGuide,
  onOpenCalculator,
  totalAuctionsCount
}) => {
  return (
    <section className="relative overflow-hidden border-b border-slate-800 bg-[#0b0f17]">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Headlines & 2 Primary System Links */}
          <div className="lg:col-span-7 space-y-6">
            {/* Trust Kicker */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-700/80 text-xs text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Hub Oficial de Leilões Atacadistas dos Estados Unidos</span>
              <span className="text-slate-600">·</span>
              <span className="font-mono text-amber-400 font-bold">{totalAuctionsCount} Lotes Ativos</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.15] text-balance">
              Leilões Americanos de iPhones com <span className="text-amber-400">Grading Oficial</span> e Lances Ao Vivo
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
              Arremate paletes e unidades avulsas de iPhones direto das maiores liquidações dos EUA (Apple Surplus, Verizon e AT&T Carrier Returns). Com manifestos completos de IMEI, laudo de 30 pontos e despacho via galpão de Miami.
            </p>

            {/* TWO PROMINENT LINKS TO "NOSSO SISTEMA DE LEILÕES" */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                onClick={() => onOpenSystem('terminal')}
                className="py-3 px-6 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-sm rounded-xl transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2.5 active:scale-[0.98]"
              >
                <Gavel className="w-4 h-4 text-slate-950" />
                <span>Acessar Sistema de Leilões</span>
              </button>

              <button
                onClick={() => onOpenSystem('register')}
                className="py-3 px-6 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm border border-slate-700 hover:border-emerald-500/50 rounded-xl transition-all flex items-center justify-center gap-2.5 active:scale-[0.98]"
              >
                <UserPlus className="w-4 h-4 text-emerald-400" />
                <span>Cadastrar no Sistema de Leilões</span>
              </button>
            </div>

            {/* Secondary actions: Grading Guide & Calculator */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
              <button
                onClick={onOpenGradingGuide}
                className="hover:text-amber-300 transition-colors inline-flex items-center gap-1.5 underline underline-offset-4"
              >
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                <span>Ver Padrão de Grades (A+, A, B, C)</span>
              </button>

              <button
                onClick={onOpenCalculator}
                className="hover:text-emerald-300 transition-colors inline-flex items-center gap-1.5 underline underline-offset-4"
              >
                <Calculator className="w-3.5 h-3.5 text-emerald-400" />
                <span>Simulador de Lucro & Tributos</span>
              </button>
            </div>
          </div>

          {/* Right Column: Hero Visual Showcase */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl overflow-hidden border border-slate-700/80 bg-slate-900 shadow-2xl">
              <img
                src="/src/assets/images/hero_auction_warehouse_iphones_1793849010124.jpg"
                alt="Galpão de Logística de Leilões de iPhone em Miami"
                className="w-full aspect-[16/10] sm:aspect-[4/3] object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

              {/* Float Card */}
              <div className="absolute bottom-4 left-4 right-4 p-3.5 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-800 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="font-semibold text-white">Inspeção Ativa · Miami Logistics Hub</span>
                  </div>
                  <span className="font-mono text-amber-400 font-bold">FL 33166</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-300 pt-1 border-t border-slate-800">
                  <span>Diagnóstico Apple 30 Pontos</span>
                  <span className="text-emerald-400 font-semibold">100% Clean ESN</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4-Column KPI Trust Strip */}
        <div className="mt-12 pt-8 border-t border-slate-800/80 grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-3.5 bg-slate-900/40 border border-slate-800/80 rounded-xl space-y-1">
            <div className="flex items-center gap-2 text-white font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Clean IMEI & FMI OFF</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Zero aparelhos bloqueados. Todos consultados na GSMA e aptos para ativação global.
            </p>
          </div>

          <div className="p-3.5 bg-slate-900/40 border border-slate-800/80 rounded-xl space-y-1">
            <div className="flex items-center gap-2 text-white font-bold">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Grading Rigoroso A+ / A / B / C</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Fotos reais, saúde de bateria discriminada e peças originais Apple certificadas.
            </p>
          </div>

          <div className="p-3.5 bg-slate-900/40 border border-slate-800/80 rounded-xl space-y-1">
            <div className="flex items-center gap-2 text-white font-bold">
              <MapPin className="w-4 h-4 text-amber-400" />
              <span>Armazém Próprio em Miami</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Consolidação de lotes, inspeção física e despacho aéreo seguro para o Brasil.
            </p>
          </div>

          <div className="p-3.5 bg-slate-900/40 border border-slate-800/80 rounded-xl space-y-1">
            <div className="flex items-center gap-2 text-white font-bold">
              <Gavel className="w-4 h-4 text-amber-400" />
              <span>Sistema Oficial de Arrematação</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Lances automáticos e credenciamento sem exigência de SSN americano para brasileiros.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
