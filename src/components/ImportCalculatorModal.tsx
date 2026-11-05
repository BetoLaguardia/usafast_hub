import React, { useState } from 'react';
import { X, Calculator, DollarSign, TrendingUp, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react';

interface ImportCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  usdRate: number;
  initialLotPriceUsd?: number;
  initialLotUnits?: number;
}

export const ImportCalculatorModal: React.FC<ImportCalculatorModalProps> = ({
  isOpen,
  onClose,
  usdRate,
  initialLotPriceUsd = 7450,
  initialLotUnits = 10
}) => {
  const [bidUsd, setBidUsd] = useState<number>(initialLotPriceUsd);
  const [units, setUnits] = useState<number>(initialLotUnits);
  const [buyerFeePercent, setBuyerFeePercent] = useState<number>(10); // taxa da casa de leilão EUA (5-10%)
  const [shippingUsdPerUnit, setShippingUsdPerUnit] = useState<number>(38); // Frete seguro Miami -> Brasil por un.
  const [taxRegime, setTaxRegime] = useState<'remessa' | 'importa_facil' | 'despacho_comercial'>('importa_facil');
  const [resellPricePerUnitBrl, setResellPricePerUnitBrl] = useState<number>(7990); // preço de revenda no Brasil

  if (!isOpen) return null;

  // Calculations
  const buyerFeeUsd = (bidUsd * buyerFeePercent) / 100;
  const totalShippingUsd = shippingUsdPerUnit * units;
  const subtotalUsd = bidUsd + buyerFeeUsd + totalShippingUsd;
  
  // Tax estimate
  // Importa fácil / RFB: roughly 60% on goods + freight or corporate tax regime
  const effectiveTaxRate = taxRegime === 'remessa' ? 0.60 : taxRegime === 'importa_facil' ? 0.45 : 0.35;
  const taxUsd = (bidUsd + totalShippingUsd) * effectiveTaxRate;
  
  const totalLandedCostUsd = subtotalUsd + taxUsd;
  const totalLandedCostBrl = totalLandedCostUsd * usdRate;
  const unitCostBrl = totalLandedCostBrl / (units || 1);

  const totalGrossRevenueBrl = resellPricePerUnitBrl * units;
  const netProfitBrl = totalGrossRevenueBrl - totalLandedCostBrl;
  const profitMarginPercent = totalLandedCostBrl > 0 ? (netProfitBrl / totalLandedCostBrl) * 100 : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Simulador de Importação & Lucro Líquido
              </h2>
              <p className="text-xs text-slate-400">
                Calcule o custo total de arrematação nos EUA até a entrega e margem de revenda no Brasil
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-200 text-xs">
          {/* Preset Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-400 font-medium">Simulações Rápidas:</span>
            <button
              onClick={() => {
                setBidUsd(890);
                setUnits(1);
                setResellPricePerUnitBrl(8900);
              }}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs transition-colors"
            >
              1x iPhone 16 Pro Max
            </button>
            <button
              onClick={() => {
                setBidUsd(2850);
                setUnits(5);
                setResellPricePerUnitBrl(5300);
              }}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs transition-colors"
            >
              5x iPhone 15 Pro
            </button>
            <button
              onClick={() => {
                setBidUsd(7450);
                setUnits(10);
                setResellPricePerUnitBrl(7990);
              }}
              className="px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded text-xs transition-colors"
            >
              Lote 10x 16 Pro Max
            </button>
          </div>

          {/* Input Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
            <div>
              <label className="text-slate-300 block mb-1 font-medium">
                Valor do Lance Arrematado (USD):
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-slate-500 font-mono font-bold">$</span>
                <input
                  type="number"
                  value={bidUsd}
                  onChange={e => setBidUsd(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-emerald-400"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-300 block mb-1 font-medium">
                Quantidade de Aparelhos no Lote:
              </label>
              <input
                type="number"
                min="1"
                value={units}
                onChange={e => setUnits(Math.max(1, Number(e.target.value)))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-emerald-400"
              />
            </div>

            <div>
              <label className="text-slate-300 block mb-1 font-medium">
                Taxa de Leilão (Buyer's Premium):
              </label>
              <select
                value={buyerFeePercent}
                onChange={e => setBuyerFeePercent(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-400"
              >
                <option value="5">5% (Grandes Lotes / Atacado Operadoras)</option>
                <option value="10">10% (Padrão Casas de Leilão EUA)</option>
                <option value="12">12% (GovDeals / Liquidation.com)</option>
              </select>
            </div>

            <div>
              <label className="text-slate-300 block mb-1 font-medium">
                Frete Aéreo Miami ➔ Brasil por unidade (USD):
              </label>
              <input
                type="number"
                value={shippingUsdPerUnit}
                onChange={e => setShippingUsdPerUnit(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-emerald-400"
              />
            </div>

            <div>
              <label className="text-slate-300 block mb-1 font-medium">
                Cotação Atual Dólar PTAX (R$):
              </label>
              <input
                type="text"
                disabled
                value={`R$ ${usdRate.toFixed(2)}`}
                className="w-full bg-slate-900/50 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-400"
              />
            </div>

            <div>
              <label className="text-slate-300 block mb-1 font-medium">
                Preço Médio de Revenda no Brasil por Unidade (R$):
              </label>
              <input
                type="number"
                value={resellPricePerUnitBrl}
                onChange={e => setResellPricePerUnitBrl(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-mono text-emerald-300 focus:outline-none focus:border-emerald-400"
              />
            </div>
          </div>

          {/* Breakdown & Results Box */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
              <span className="font-semibold text-slate-300 block">Composição de Custos Landed:</span>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Lance Arrematado:</span>
                  <span className="font-mono text-slate-200">${bidUsd.toLocaleString()} USD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Taxa Leiloeiro ({buyerFeePercent}%):</span>
                  <span className="font-mono text-slate-200">${buyerFeeUsd.toFixed(2)} USD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Frete Redirecionador Seguro:</span>
                  <span className="font-mono text-slate-200">${totalShippingUsd.toFixed(2)} USD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Tributos Alfandegários Estimados:</span>
                  <span className="font-mono text-slate-200">${taxUsd.toFixed(2)} USD</span>
                </div>
                <div className="pt-2 border-t border-slate-800 flex justify-between font-bold text-white">
                  <span>Custo Total no Brasil:</span>
                  <span className="font-mono text-amber-400">
                    R$ {totalLandedCostBrl.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                  </span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Custo Médio por Aparelho:</span>
                  <span className="font-mono text-slate-300">
                    R$ {unitCostBrl.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} / un
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-br from-emerald-950/40 to-slate-950 border border-emerald-500/30 rounded-xl flex flex-col justify-between">
              <div>
                <span className="font-semibold text-emerald-400 block text-xs flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4" />
                  Projeção de Retorno Financeiro
                </span>
                
                <div className="mt-3 space-y-2">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Faturamento Bruto de Venda:</span>
                    <span className="text-lg font-bold text-white font-mono">
                      R$ {totalGrossRevenueBrl.toLocaleString('pt-BR')}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Lucro Líquido Estimado:</span>
                    <span className="text-xl font-black text-emerald-400 font-mono">
                      R$ {netProfitBrl.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-slate-400 text-[11px]">Retorno sobre Investimento (ROI):</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold font-mono text-xs">
                      +{profitMarginPercent.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-emerald-500/20 flex items-center gap-2 text-[11px] text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Simulação calculada com desembaraço no galpão Miami Doral.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-mono">
            Cotação base: R$ {usdRate.toFixed(2)} por US Dollar
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg font-bold text-xs transition-colors"
          >
            Aplicar ao Leilão
          </button>
        </div>
      </div>
    </div>
  );
};
