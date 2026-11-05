import React from 'react';
import { Layers, ShieldCheck, Battery, Smartphone, Award, Sparkles, CheckCircle2, AlertTriangle, ArrowRight, Info, HelpCircle } from 'lucide-react';
import { GRADE_EXPLANATIONS } from '../data/auctionsData';
import { GradeType } from '../types/auction';

interface GradeamentoPageProps {
  onSelectGradeFilter: (grade: GradeType) => void;
  onNavigateLeiloes: () => void;
}

export const GradeamentoPage: React.FC<GradeamentoPageProps> = ({
  onSelectGradeFilter,
  onNavigateLeiloes
}) => {
  return (
    <div className="space-y-16 py-8 sm:py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-slate-200">
      {/* Hero Gradeamento */}
      <div className="space-y-4 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-700/80 text-xs text-amber-400 font-semibold">
          <Layers className="w-4 h-4" />
          <span>Classificação Técnica Oficial CTIA & Apple Quality Standards</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
          Guia Definitivo de <span className="text-amber-400">Gradeamento de iPhones</span> nos Leilões dos EUA
        </h1>
        <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
          Compreenda com precisão cirúrgica o que significa cada grade estético e funcional utilizado pelas gigantes americanas (Verizon, operadoras dos EUA e Apple Surplus) para arrematar com 100% de confiança e previsibilidade de margem.
        </p>
      </div>

      {/* Explicação dos Padrões CTIA */}
      <div className="p-6 sm:p-8 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h2 className="text-lg sm:text-xl font-bold text-white">
              O que é o Padrão CTIA de Classificação de Usados?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              O padrão CTIA (<em>Cellular Telecommunications and Internet Association</em>) é a métrica universal adotada por operadoras (Verizon, AT&T, T-Mobile) e pelas maiores plataformas de liquidação atacadista dos EUA. Ele estabelece distâncias ópticas de inspeção (inspeção visual a 20 cm e 30 cm de distância com ângulo de luz controlado) para determinar a ausência ou severidade de qualquer marca física.
            </p>
          </div>
        </div>
      </div>

      {/* Detalhamento dos Grades (A+, A, B, C, CPO) */}
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              ESPECIFICAÇÕES INDIVIDUAIS
            </span>
            <h2 className="text-2xl font-black text-white tracking-tight">
              Análise Pormenorizada de Cada Categoria de Grade
            </h2>
          </div>
          <button
            onClick={onNavigateLeiloes}
            className="text-xs text-amber-400 hover:text-amber-300 font-semibold inline-flex items-center gap-1.5"
          >
            <span>Ver leilões em tempo real</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(Object.keys(GRADE_EXPLANATIONS) as GradeType[]).map(gradeKey => {
            const info = GRADE_EXPLANATIONS[gradeKey];
            return (
              <div
                key={gradeKey}
                className="p-6 bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-2xl flex flex-col justify-between space-y-5 shadow-lg shadow-black/30"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${info.badgeColor}`}>
                      {info.label}
                    </span>
                    <button
                      onClick={() => onSelectGradeFilter(gradeKey)}
                      className="px-3 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-md text-xs font-semibold transition-colors"
                    >
                      Filtrar Lotes {gradeKey} ➔
                    </button>
                  </div>

                  <p className="text-sm font-medium text-white leading-relaxed">
                    {info.shortDesc}
                  </p>

                  <div className="space-y-2.5 text-xs pt-3 border-t border-slate-800">
                    <div className="p-3 bg-slate-950/70 rounded-xl space-y-1">
                      <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                        <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                        Critério de Tela (Display OLED / Super Retina)
                      </span>
                      <p className="text-slate-200">{info.screenDesc}</p>
                    </div>

                    <div className="p-3 bg-slate-950/70 rounded-xl space-y-1">
                      <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-slate-300" />
                        Critério de Carcaça & Bordas (Titânio / Alumínio)
                      </span>
                      <p className="text-slate-200">{info.housingDesc}</p>
                    </div>

                    <div className="p-3 bg-slate-950/70 rounded-xl space-y-1">
                      <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                        <Battery className="w-3.5 h-3.5 text-emerald-400" />
                        Saúde de Bateria Oficial
                      </span>
                      <p className="font-mono text-emerald-400 font-bold">{info.batteryMin}</p>
                    </div>

                    <div className="p-3 bg-slate-950/70 rounded-xl space-y-1">
                      <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                        Funcionalidade & Diagnóstico
                      </span>
                      <p className="text-slate-200">{info.functionality}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Sugestão de Revenda:</span>
                  <span className="font-medium text-slate-200">{info.targetMarket}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Matriz Comparativa Resumida */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white tracking-tight">
          Tabela Comparativa Rápida de Especificações
        </h2>
        <div className="overflow-x-auto border border-slate-800 rounded-2xl bg-slate-900/60">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400">
                <th className="py-3 px-4 font-semibold">Grade</th>
                <th className="py-3 px-4 font-semibold">Tela</th>
                <th className="py-3 px-4 font-semibold">Carcaça</th>
                <th className="py-3 px-4 font-semibold">Bateria Média</th>
                <th className="py-3 px-4 font-semibold">Garantia IMEI</th>
                <th className="py-3 px-4 font-semibold">Perfil Indicado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              <tr className="hover:bg-slate-800/30">
                <td className="py-3 px-4 font-bold text-emerald-400 font-mono">Grade A+</td>
                <td className="py-3 px-4">Zero riscos (100% Impecável)</td>
                <td className="py-3 px-4">Sem arranhões ou amassados</td>
                <td className="py-3 px-4 font-mono text-emerald-400 font-semibold">95% a 100%</td>
                <td className="py-3 px-4 text-emerald-400">Clean ESN / FMI OFF</td>
                <td className="py-3 px-4">Vitrine / Seminovo Premium</td>
              </tr>
              <tr className="hover:bg-slate-800/30">
                <td className="py-3 px-4 font-bold text-cyan-400 font-mono">Grade A</td>
                <td className="py-3 px-4">Micro-marcas imperceptíveis a 20cm</td>
                <td className="py-3 px-4">Leves marcas de case</td>
                <td className="py-3 px-4 font-mono text-cyan-400 font-semibold">88% a 95%</td>
                <td className="py-3 px-4 text-emerald-400">Clean ESN / FMI OFF</td>
                <td className="py-3 px-4">Alta rotatividade / Revenda rápida</td>
              </tr>
              <tr className="hover:bg-slate-800/30">
                <td className="py-3 px-4 font-bold text-amber-400 font-mono">Grade B</td>
                <td className="py-3 px-4">Pequenos riscos (somem com película)</td>
                <td className="py-3 px-4">Pequenos desgastes nas laterais</td>
                <td className="py-3 px-4 font-mono text-amber-400 font-semibold">82% a 89%</td>
                <td className="py-3 px-4 text-emerald-400">Clean ESN / FMI OFF</td>
                <td className="py-3 px-4">Custo-benefício equilibrado</td>
              </tr>
              <tr className="hover:bg-slate-800/30">
                <td className="py-3 px-4 font-bold text-orange-400 font-mono">Grade C</td>
                <td className="py-3 px-4">Riscos visíveis, sem trincos</td>
                <td className="py-3 px-4">Marcas evidentes de uso</td>
                <td className="py-3 px-4 font-mono text-orange-400 font-semibold">80% a 85%</td>
                <td className="py-3 px-4 text-emerald-400">Clean ESN / FMI OFF</td>
                <td className="py-3 px-4">Revenda popular ou polimento</td>
              </tr>
              <tr className="hover:bg-slate-800/30">
                <td className="py-3 px-4 font-bold text-indigo-400 font-mono">CPO Refurbished</td>
                <td className="py-3 px-4">Nova oficial (Apple Refurbished)</td>
                <td className="py-3 px-4">Nova sem qualquer marca (10/10)</td>
                <td className="py-3 px-4 font-mono text-indigo-400 font-semibold">100% (Bateria nova)</td>
                <td className="py-3 px-4 text-emerald-400">Clean ESN / FMI OFF</td>
                <td className="py-3 px-4">Produto com caixa e garantia máxima</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* O Laudo de 30 Pontos */}
      <div className="p-6 sm:p-8 bg-slate-900/50 border border-slate-800 rounded-2xl space-y-6">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Checklist dos 30 Pontos de Diagnóstico Automatizado
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Cada aparelho recebe laudo via cabo USB-C/Lightning conectado a software de diagnóstico credenciado
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs text-slate-300">
          <div className="p-3 bg-slate-950 rounded-xl flex items-center gap-2 border border-slate-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Face ID / Sensores TrueDepth 100%</span>
          </div>
          <div className="p-3 bg-slate-950 rounded-xl flex items-center gap-2 border border-slate-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Câmeras Principal 48MP, Ultra-Wide e Telephoto</span>
          </div>
          <div className="p-3 bg-slate-950 rounded-xl flex items-center gap-2 border border-slate-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>True Tone e Sensor de Luminosidade</span>
          </div>
          <div className="p-3 bg-slate-950 rounded-xl flex items-center gap-2 border border-slate-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Microfones (Frontal, Traseiro e Inferior)</span>
          </div>
          <div className="p-3 bg-slate-950 rounded-xl flex items-center gap-2 border border-slate-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Alto-Falantes Estéreo (Superior e Inferior)</span>
          </div>
          <div className="p-3 bg-slate-950 rounded-xl flex items-center gap-2 border border-slate-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Motor Taptic Engine (Vibração Háptica)</span>
          </div>
          <div className="p-3 bg-slate-950 rounded-xl flex items-center gap-2 border border-slate-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Conexão 5G / 4G LTE e Wi-Fi 7 / 6E</span>
          </div>
          <div className="p-3 bg-slate-950 rounded-xl flex items-center gap-2 border border-slate-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Carregamento Rápido USB-C e MagSafe</span>
          </div>
          <div className="p-3 bg-slate-950 rounded-xl flex items-center gap-2 border border-slate-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Ausência de Perfis Corporativos (MDM Free)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
