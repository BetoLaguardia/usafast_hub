import React from 'react';
import { ShieldCheck, MapPin, Award, CheckCircle2, Building2, Globe2, Truck, ArrowRight, Gavel, Users, Clock } from 'lucide-react';

interface QuemSomosPageProps {
  onNavigateLeiloes: () => void;
  onOpenSystem: (tab?: 'terminal' | 'register') => void;
}

export const QuemSomosPage: React.FC<QuemSomosPageProps> = ({
  onNavigateLeiloes,
  onOpenSystem
}) => {
  return (
    <div className="space-y-16 py-8 sm:py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-slate-200">
      {/* Hero Quem Somos */}
      <div className="space-y-6 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-700/80 text-xs text-amber-400 font-semibold">
          <Building2 className="w-4 h-4" />
          <span>Assessoria & Plataforma de Importação de Leilões dos EUA</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
          Conectando o Lojista Brasileiro às <span className="text-amber-400">Maiores Liquidações da Apple nos EUA</span>
        </h1>
        <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
          Nascemos para desmistificar a importação de iPhones através de leilões atacadistas americanos. Eliminamos intermediários abusivos e oferecemos suporte integral com infraestrutura própria em Miami para conferência física, laudos de 30 pontos e despacho aéreo seguro até o Brasil.
        </p>
      </div>

      {/* Main Image & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-7 rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 shadow-2xl relative">
          <img
            src="/src/assets/images/hero_auction_warehouse_iphones_1793849010124.jpg"
            alt="Galpão de Logística em Miami"
            className="w-full aspect-[16/10] object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 p-4 bg-slate-950/80 backdrop-blur-md border border-slate-800 rounded-xl text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <span className="font-bold text-white block">Miami Logistics Hub & Quality Assurance</span>
              <span className="text-slate-400">8350 NW 53rd St, Suite 302, Doral, FL 33166</span>
            </div>
            <span className="px-3 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold font-mono">
              Licença Federal Ativa
            </span>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-4">
          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <Globe2 className="w-4 h-4" />
              <span>Acesso Direto sem Exigência de SSN</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              As grandes plataformas e leilões corporativos dos EUA exigem registros corporativos e identificação fiscal americana. Com nosso sistema, compradores e revendedores brasileiros participam através de credenciamento legal com CPF ou CNPJ nacional.
            </p>
          </div>

          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <ShieldCheck className="w-4 h-4" />
              <span>Conferência de 100% dos Manifestos</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Não arrematamos "lotes às cegas". Cada lote listado em nossa plataforma é acompanhado do manifesto com IMEI, laudo de bateria e confirmação de FMI OFF (iCloud desativado) e Clean ESN.
            </p>
          </div>

          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
              <Truck className="w-4 h-4" />
              <span>Logística Reversa & Consolidação em Miami</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Após o encerramento do leilão, os iPhones são entregues em nosso centro de distribuição na Flórida, onde são fotografados, reembalados com proteção antiestática e enviados via frete aéreo prioritário ao Brasil.
            </p>
          </div>
        </div>
      </div>

      {/* Números da Operação */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl text-center space-y-1">
          <span className="text-3xl sm:text-4xl font-black text-amber-400 font-mono">+18.400</span>
          <span className="text-xs text-slate-400 block font-medium">iPhones Arrematados</span>
        </div>
        <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl text-center space-y-1">
          <span className="text-3xl sm:text-4xl font-black text-emerald-400 font-mono">100%</span>
          <span className="text-xs text-slate-400 block font-medium">Aparelhos com Clean ESN</span>
        </div>
        <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl text-center space-y-1">
          <span className="text-3xl sm:text-4xl font-black text-cyan-400 font-mono">98.8%</span>
          <span className="text-xs text-slate-400 block font-medium">Aprovação dos Lojistas</span>
        </div>
        <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl text-center space-y-1">
          <span className="text-3xl sm:text-4xl font-black text-white font-mono">48h</span>
          <span className="text-xs text-slate-400 block font-medium">Tempo Médio de Inspeção</span>
        </div>
      </div>

      {/* Nossa Equipe e Infraestrutura */}
      <div className="p-6 sm:p-8 bg-slate-900/50 border border-slate-800 rounded-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Infraestrutura Bilíngue e Suporte Dedicado
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Equipe técnica de analistas de hardware em Miami e especialistas aduaneiros em São Paulo
            </p>
          </div>
          <button
            onClick={() => onOpenSystem('register')}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors shrink-0 shadow-md shadow-emerald-600/10"
          >
            Cadastrar-se como Arrematante
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-300">
          <div className="space-y-2">
            <span className="font-semibold text-white block text-sm">1. Equipe Técnica Apple Certified</span>
            <p className="text-slate-400 leading-relaxed">
              Técnicos treinados realizam a triagem física de telas, integridade de bateria, ausência de contas iCloud ativas e validação de peças 100% originais.
            </p>
          </div>
          <div className="space-y-2">
            <span className="font-semibold text-white block text-sm">2. Desembaraço e Tributação</span>
            <p className="text-slate-400 leading-relaxed">
              Orientamos nossos clientes quanto à melhor modalidade de importação formal ou simplificada junto à Receita Federal para maximizar a margem líquida.
            </p>
          </div>
          <div className="space-y-2">
            <span className="font-semibold text-white block text-sm">3. Garantia de Entrega e Seguro</span>
            <p className="text-slate-400 leading-relaxed">
              Todas as cargas aéreas saem dos EUA com seguro total contra extravio ou avaria até a conferência em solo nacional.
            </p>
          </div>
        </div>
      </div>

      {/* Call to action */}
      <div className="text-center p-8 bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/40 border border-amber-500/20 rounded-2xl space-y-4">
        <h3 className="text-xl font-bold text-white">Pronto para arrematar lotes com nossa assessoria?</h3>
        <p className="text-xs text-slate-400 max-w-lg mx-auto">
          Explore os leilões em andamento agora mesmo ou entre em contato com nosso time de atendimento pelo sistema.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={onNavigateLeiloes}
            className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl text-xs transition-colors flex items-center gap-2"
          >
            <span>Ver Todos os Leilões Ativos</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => onOpenSystem('terminal')}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2"
          >
            <Gavel className="w-4 h-4 text-amber-400" />
            <span>Acessar Sistema de Leilões</span>
          </button>
        </div>
      </div>
    </div>
  );
};
