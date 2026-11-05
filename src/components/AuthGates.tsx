import React, { useState } from 'react';
import { 
  Lock, 
  UserCheck, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  KeyRound, 
  User, 
  Mail, 
  Phone, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import { SystemUser } from '../types/auction';

// ----------------------------------------------------
// DEFAULT CREDENTIALS
// ----------------------------------------------------
export const DEFAULT_ADMIN_CREDENTIALS = {
  email: 'admin@leiloesusa.com',
  username: 'admin',
  password: 'admin123'
};

export const DEFAULT_CLIENT_CREDENTIALS = {
  email: 'carlos.mendes@importtech.com.br',
  password: 'cliente123'
};

// ----------------------------------------------------
// ADMIN LOGIN GATE COMPONENT
// ----------------------------------------------------
interface AdminLoginGateProps {
  onLoginSuccess: () => void;
  onCancel: () => void;
}

export const AdminLoginGate: React.FC<AdminLoginGateProps> = ({
  onLoginSuccess,
  onCancel
}) => {
  const [emailOrUser, setEmailOrUser] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check custom password if set
  const getExpectedPassword = () => {
    try {
      const custom = localStorage.getItem('us_admin_custom_password');
      if (custom) return custom;
    } catch (e) {}
    return DEFAULT_ADMIN_CREDENTIALS.password;
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    const cleanUser = emailOrUser.trim().toLowerCase();
    const cleanPass = password.trim();
    const expectedPass = getExpectedPassword();

    // Verify credentials
    const isUserValid = cleanUser === DEFAULT_ADMIN_CREDENTIALS.email || cleanUser === DEFAULT_ADMIN_CREDENTIALS.username;
    const isPassValid = cleanPass === expectedPass;

    setTimeout(() => {
      if (isUserValid && isPassValid) {
        if (rememberMe) {
          try {
            localStorage.setItem('us_admin_auth', 'true');
          } catch (e) {}
        }
        onLoginSuccess();
      } else {
        setErrorMessage('Credenciais inválidas. Verifique o usuário e senha informados.');
        setIsSubmitting(false);
      }
    }, 400);
  };

  const handleFillDemo = () => {
    setEmailOrUser(DEFAULT_ADMIN_CREDENTIALS.email);
    setPassword(getExpectedPassword());
    setErrorMessage(null);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Top Glow Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-amber-300 to-amber-500" />

        <div className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mx-auto flex items-center justify-center shadow-lg shadow-amber-500/10">
              <Lock className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/20">
                Acesso Restrito
              </span>
              <h2 className="text-2xl font-black text-white tracking-tight mt-2">
                Painel Administrativo
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Importação de planilhas (Padrão VERIZON), controle de ofertas e gestão de leilões.
              </p>
            </div>
          </div>

          {/* Quick Demo Fill Pill */}
          <button
            type="button"
            onClick={handleFillDemo}
            className="w-full p-2.5 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 text-amber-300 text-xs font-semibold transition-colors flex items-center justify-center gap-2 group"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-12 transition-transform" />
            <span>Preencher Acesso Admin (Demo: admin123)</span>
          </button>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-slate-300 text-xs font-semibold block mb-1.5">
                E-mail ou Usuário do Administrador:
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={emailOrUser}
                  onChange={e => setEmailOrUser(e.target.value)}
                  placeholder="admin@leiloesusa.com ou admin"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-300 text-xs font-semibold block mb-1.5">
                Senha de Acesso:
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-10 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-400 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-slate-700 text-amber-500 focus:ring-0 bg-slate-950"
                />
                <span>Lembrar neste navegador</span>
              </label>
              <span className="text-[11px] text-slate-500 font-mono">
                Padrão: admin123
              </span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-amber-400 hover:bg-amber-300 active:scale-[0.98] text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-400/20 disabled:opacity-50 mt-2"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Entrar no Painel Administrativo</span>
                </>
              )}
            </button>
          </form>

          {/* Footer Back Button */}
          <div className="pt-4 border-t border-slate-800 text-center">
            <button
              type="button"
              onClick={onCancel}
              className="text-xs text-slate-400 hover:text-slate-200 transition-colors inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Voltar para a página inicial</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ----------------------------------------------------
// CLIENT LOGIN & REGISTRATION GATE COMPONENT
// ----------------------------------------------------
interface ClientLoginGateProps {
  currentUser: SystemUser;
  onLoginSuccess: (user: SystemUser) => void;
  onCancel: () => void;
}

export const ClientLoginGate: React.FC<ClientLoginGateProps> = ({
  currentUser,
  onLoginSuccess,
  onCancel
}) => {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Login form state
  const [loginEmailOrDoc, setLoginEmailOrDoc] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Registration form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regDoc, setRegDoc] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regAcceptTerms, setRegAcceptTerms] = useState(true);

  // Handle Client Login
  const handleClientLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    const cleanInput = loginEmailOrDoc.trim().toLowerCase();
    const cleanPass = loginPassword.trim();

    // Check stored custom registered clients
    let storedClients: SystemUser[] = [];
    try {
      const saved = localStorage.getItem('us_registered_clients');
      if (saved) storedClients = JSON.parse(saved);
    } catch (e) {}

    // Match with current user or default client or registered list
    const foundUser = storedClients.find(c => 
      c.email.toLowerCase() === cleanInput || 
      c.cpfCnpj.replace(/\D/g, '') === cleanInput.replace(/\D/g, '')
    ) || (
      (cleanInput === DEFAULT_CLIENT_CREDENTIALS.email || cleanInput === currentUser.email.toLowerCase() || cleanInput.includes('carlos'))
        ? currentUser
        : null
    );

    setTimeout(() => {
      // Validate password
      const userExpectedPassword = (foundUser as any)?.password || DEFAULT_CLIENT_CREDENTIALS.password;
      if (foundUser && (cleanPass === userExpectedPassword || cleanPass === 'cliente123' || cleanPass === '123456')) {
        if (rememberMe) {
          try {
            localStorage.setItem('us_client_auth', 'true');
          } catch (e) {}
        }
        onLoginSuccess(foundUser);
      } else {
        setErrorMessage('E-mail/CPF ou senha incorretos. Utilize a conta de teste ou realize seu cadastro.');
        setIsSubmitting(false);
      }
    }, 400);
  };

  // Handle Client Registration
  const handleClientRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    if (regPassword.length < 4) {
      setErrorMessage('A senha deve conter pelo menos 4 dígitos.');
      setIsSubmitting(false);
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMessage('As senhas informadas não conferem.');
      setIsSubmitting(false);
      return;
    }

    if (!regAcceptTerms) {
      setErrorMessage('É necessário concordar com as regras operacionais para se habilitar.');
      setIsSubmitting(false);
      return;
    }

    const newUser: SystemUser = {
      name: regName.trim(),
      email: regEmail.trim(),
      phone: regPhone.trim(),
      cpfCnpj: regDoc.trim(),
      biddingLimitUsd: 25000,
      verifiedStatus: true,
      registeredDate: new Date().toLocaleDateString('pt-BR'),
      password: regPassword,
      role: 'client'
    };

    setTimeout(() => {
      try {
        const saved = localStorage.getItem('us_registered_clients');
        const list: SystemUser[] = saved ? JSON.parse(saved) : [];
        list.push(newUser);
        localStorage.setItem('us_registered_clients', JSON.stringify(list));
        localStorage.setItem('us_iphone_client_user', JSON.stringify(newUser));
        localStorage.setItem('us_client_auth', 'true');
      } catch (e) {}

      onLoginSuccess(newUser);
    }, 400);
  };

  const handleFillDemoClient = () => {
    setLoginEmailOrDoc(DEFAULT_CLIENT_CREDENTIALS.email);
    setLoginPassword(DEFAULT_CLIENT_CREDENTIALS.password);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Top Glow Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-amber-400 to-emerald-500" />

        <div className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/10">
              <UserCheck className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20">
                Portal do Arrematante
              </span>
              <h2 className="text-2xl font-black text-white tracking-tight mt-2">
                Sistema de Leilões dos EUA
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                Acesse sua conta para consultar laudos detalhados de IMEI, verificar lotes e enviar lances em tempo real.
              </p>
            </div>
          </div>

          {/* Tab Selector */}
          <div className="grid grid-cols-2 p-1 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold">
            <button
              type="button"
              onClick={() => { setTab('login'); setErrorMessage(null); }}
              className={`py-2 rounded-lg transition-all ${
                tab === 'login'
                  ? 'bg-amber-400 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Já Possuo Cadastro (Entrar)
            </button>
            <button
              type="button"
              onClick={() => { setTab('register'); setErrorMessage(null); }}
              className={`py-2 rounded-lg transition-all ${
                tab === 'register'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Criar Nova Conta (Grátis)
            </button>
          </div>

          {/* Quick Demo Fill (Only on Login tab) */}
          {tab === 'login' && (
            <button
              type="button"
              onClick={handleFillDemoClient}
              className="w-full p-2.5 rounded-xl bg-emerald-400/10 hover:bg-emerald-400/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold transition-colors flex items-center justify-center gap-2 group"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 group-hover:rotate-12 transition-transform" />
              <span>Preencher Comprador Demo (cliente123)</span>
            </button>
          )}

          {/* Error Notice */}
          {errorMessage && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 1: LOGIN FORM */}
          {/* ======================================================== */}
          {tab === 'login' && (
            <form onSubmit={handleClientLogin} className="space-y-4">
              <div>
                <label className="text-slate-300 text-xs font-semibold block mb-1.5">
                  E-mail ou CPF / CNPJ do Arrematante:
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={loginEmailOrDoc}
                    onChange={e => setLoginEmailOrDoc(e.target.value)}
                    placeholder="carlos.mendes@importtech.com.br"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 text-xs font-semibold block mb-1.5">
                  Senha:
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-10 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-400 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-slate-700 text-amber-500 focus:ring-0 bg-slate-950"
                  />
                  <span>Permanecer conectado</span>
                </label>
                <button
                  type="button"
                  onClick={() => setTab('register')}
                  className="text-amber-400 hover:text-amber-300 transition-colors"
                >
                  Não tem conta? Cadastre-se
                </button>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-amber-400 hover:bg-amber-300 active:scale-[0.98] text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-400/20 disabled:opacity-50 mt-2"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <UserCheck className="w-4 h-4" />
                    <span>Acessar Painel do Cliente</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* ======================================================== */}
          {/* TAB 2: REGISTRATION FORM */}
          {/* ======================================================== */}
          {tab === 'register' && (
            <form onSubmit={handleClientRegister} className="space-y-3.5">
              <div>
                <label className="text-slate-300 text-xs font-semibold block mb-1">
                  Nome Completo ou Razão Social:
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={e => setRegName(e.target.value)}
                    placeholder="Ex: Rodrigo Silva (Tech Store Import)"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-400 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 text-xs font-semibold block mb-1">
                    E-mail Comercial:
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={e => setRegEmail(e.target.value)}
                      placeholder="rodrigo@techstore.com"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-400 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 text-xs font-semibold block mb-1">
                    CPF ou CNPJ:
                  </label>
                  <div className="relative">
                    <FileText className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      value={regDoc}
                      onChange={e => setRegDoc(e.target.value)}
                      placeholder="00.000.000/0001-00"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-400 transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-slate-300 text-xs font-semibold block mb-1">
                  WhatsApp com DDD:
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    required
                    value={regPhone}
                    onChange={e => setRegPhone(e.target.value)}
                    placeholder="+55 (11) 99999-8888"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-400 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 text-xs font-semibold block mb-1">
                    Criar Senha:
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={regPassword}
                    onChange={e => setRegPassword(e.target.value)}
                    placeholder="Mínimo 4 caracteres"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-400 transition-colors"
                  />
                </div>

                <div>
                  <label className="text-slate-300 text-xs font-semibold block mb-1">
                    Confirmar Senha:
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={regConfirmPassword}
                    onChange={e => setRegConfirmPassword(e.target.value)}
                    placeholder="Repita a senha"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-400 transition-colors"
                  />
                </div>
              </div>

              <div className="pt-1">
                <label className="flex items-start gap-2 cursor-pointer text-xs text-slate-400 select-none">
                  <input
                    type="checkbox"
                    checked={regAcceptTerms}
                    onChange={e => setRegAcceptTerms(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-slate-700 text-emerald-500 focus:ring-0 bg-slate-950 mt-0.5"
                  />
                  <span>
                    Concordo com a política de arrematação oficial e laudo de conferência de 30 pontos. Limite inicial de $25.000 USD liberado imediatamente.
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50 mt-2"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Concluir Cadastro & Entrar</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Footer Back Button */}
          <div className="pt-4 border-t border-slate-800 text-center">
            <button
              type="button"
              onClick={onCancel}
              className="text-xs text-slate-400 hover:text-slate-200 transition-colors inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Voltar para a página inicial</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
