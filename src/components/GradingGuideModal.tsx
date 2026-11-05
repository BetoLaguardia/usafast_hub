import React from 'react';
import { X, Layers, CheckCircle2, ShieldAlert, Battery, Smartphone, Award, Sparkles } from 'lucide-react';
import { GRADE_EXPLANATIONS } from '../data/auctionsData';
import { GradeType } from '../types/auction';

interface GradingGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectGradeFilter?: (grade: GradeType | 'all') => void;
}

export const GradingGuideModal: React.FC<GradingGuideModalProps> = ({
  isOpen,
  onClose,
  onSelectGradeFilter
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Padrão Americano de Grades & Especificações
              </h2>
              <p className="text-xs text-slate-400">
                Entenda a classificação técnica dos leilões dos EUA (CTIA Standards & Apple QA)
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

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-200">
          {/* Top Info Banner */}
          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl flex items-start gap-3">
            <Award className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <span className="font-semibold text-white">Garantia Técnica de Leilão Americano</span>
              <p className="text-slate-400 leading-relaxed">
                Todos os lotes listados contam com <strong>Clean ESN / Clean IMEI</strong> (sem impedimentos mundiais), <strong>FMI OFF</strong> (iCloud livre), ausência de bloqueio corporativo (MDM) e 100% de peças funcionais testadas por software especializado.
              </p>
            </div>
          </div>

          {/* Cards for each Grade */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(Object.keys(GRADE_EXPLANATIONS) as GradeType[]).map(gradeKey => {
              const info = GRADE_EXPLANATIONS[gradeKey];
              return (
                <div
                  key={gradeKey}
                  className="p-4 bg-slate-950/50 border border-slate-800 rounded-xl hover:border-slate-700 transition-colors space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className={`px-2.5 py-1 rounded text-xs font-bold border ${info.badgeColor}`}>
                      {info.label}
                    </span>
                    {onSelectGradeFilter && (
                      <button
                        onClick={() => {
                          onSelectGradeFilter(gradeKey);
                          onClose();
                        }}
                        className="text-xs text-amber-400 hover:text-amber-300 font-medium"
                      >
                        Filtrar Lotes →
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-slate-300 font-medium leading-relaxed">
                    {info.shortDesc}
                  </p>

                  <div className="space-y-1.5 text-xs pt-1 border-t border-slate-800/80">
                    <div className="flex items-start gap-2">
                      <Smartphone className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-slate-400">Tela: </span>
                        <span className="text-slate-200">{info.screenDesc}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-slate-400">Carcaça: </span>
                        <span className="text-slate-200">{info.housingDesc}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Battery className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-slate-400">Saúde Bateria: </span>
                        <span className="font-mono text-emerald-400 font-semibold">{info.batteryMin}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-slate-400">Perfil de Venda: </span>
                        <span className="text-slate-300">{info.targetMarket}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Checklist 30 Pontos */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
            <h3 className="font-semibold text-white text-xs">
              Checklist de 30 Pontos Executado nos Galpões dos EUA:
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-slate-300">
              <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Face ID & Sensores</div>
              <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Câmeras 48MP & 12MP</div>
              <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> True Tone & Brilho</div>
              <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Conexão 5G / Wi-Fi 7</div>
              <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Carregamento MagSafe / USB-C</div>
              <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Alto-falantes Estéreo & Mic</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg font-bold text-xs transition-colors"
          >
            Entendido, Ver Leilões
          </button>
        </div>
      </div>
    </div>
  );
};
