import { AuctionLot, BidHistoryItem, SystemUser } from '../types/auction';

export interface PhpApiConfig {
  baseUrl: string;
  enabled: boolean;
  apiKey?: string;
  pollingIntervalSeconds: number;
  autoPollBids?: boolean;
}

const DEFAULT_CONFIG_KEY = 'us_auction_php_config';

export function getPhpApiConfig(): PhpApiConfig {
  try {
    const saved = localStorage.getItem(DEFAULT_CONFIG_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {}

  return {
    baseUrl: '/backend_php',
    enabled: false, // Default to simulated mode until configured
    apiKey: '',
    pollingIntervalSeconds: 4,
    autoPollBids: true
  };
}

export function savePhpApiConfig(config: PhpApiConfig) {
  try {
    localStorage.setItem(DEFAULT_CONFIG_KEY, JSON.stringify(config));
  } catch (e) {}
}

/**
 * Real PHP API Bridge with automatic simulated fallback
 */
export class AuctionApiService {
  private config: PhpApiConfig;

  constructor() {
    this.config = getPhpApiConfig();
  }

  public updateConfig(newConfig: Partial<PhpApiConfig>) {
    this.config = { ...this.config, ...newConfig };
    savePhpApiConfig(this.config);
  }

  public getConfig(): PhpApiConfig {
    return this.config;
  }

  /**
   * Test connection to the PHP backend
   */
  public async testConnection(customUrl?: string): Promise<{ success: boolean; latencyMs: number; message: string }> {
    const url = (customUrl || this.config.baseUrl).replace(/\/+$/, '');
    const startTime = performance.now();

    try {
      console.log(`[PHP API Bridge] 🔍 Testando conexão com ${url}/health.php ...`);
      const response = await fetch(`${url}/health.php?ping=${Date.now()}`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(4000)
      });

      const latencyMs = Math.round(performance.now() - startTime);

      if (response.ok) {
        const data = await response.json().catch(() => ({}));
        return {
          success: true,
          latencyMs,
          message: data.message || `Servidor PHP conectado com sucesso (${latencyMs}ms)`
        };
      } else {
        return {
          success: false,
          latencyMs,
          message: `Servidor retornou HTTP ${response.status}: ${response.statusText}`
        };
      }
    } catch (err: any) {
      const latencyMs = Math.round(performance.now() - startTime);
      return {
        success: false,
        latencyMs,
        message: `Não foi possível conectar em ${url} (${err?.message || 'Host inacessível'}). O sistema continuará operando no Modo Simulado local.`
      };
    }
  }

  /**
   * Fetch auctions from PHP backend (or fallback to localStorage)
   */
  public async getAuctions(fallbackLots: AuctionLot[]): Promise<AuctionLot[]> {
    if (!this.config.enabled) {
      console.log('[PHP API Bridge] ℹ️ Modo Simulado ativo. Carregando dados locais.');
      return fallbackLots;
    }

    const url = `${this.config.baseUrl.replace(/\/+$/, '')}/auctions.php`;
    console.log(`[PHP API Bridge] 📡 GET ${url}`);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          ...(this.config.apiKey ? { 'Authorization': `Bearer ${this.config.apiKey}` } : {})
        },
        signal: AbortSignal.timeout(5000)
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const json = await response.json();
      if (Array.isArray(json.data) && json.data.length > 0) {
        console.log(`[PHP API Bridge] ✅ ${json.data.length} leilões recebidos do PHP!`);
        return json.data;
      }
    } catch (err: any) {
      console.warn(`[PHP API Bridge] ⚠️ Falha na API PHP (${err?.message}). Usando leilões locais.`);
    }

    return fallbackLots;
  }

  /**
   * Send new bid to PHP backend (or simulate locally)
   */
  /**
   * Send new bid to PHP backend (or simulate locally)
   */
  public async submitBid(
    lotOrPayload: {
      lotId: string;
      lotNumber?: string;
      lotTitle?: string;
      amountUsd: number;
      bidderName: string;
      bidderEmail?: string;
      isAutoSniper?: boolean;
    } | string,
    amountUsdParam?: number,
    bidderNameParam?: string
  ): Promise<{ success: boolean; currentBidUsd: number; message: string; bidItem: BidHistoryItem }> {
    const payload = typeof lotOrPayload === 'string'
      ? {
          lotId: lotOrPayload,
          lotNumber: lotOrPayload,
          lotTitle: `Lote ${lotOrPayload}`,
          amountUsd: amountUsdParam || 0,
          bidderName: bidderNameParam || 'Arrematante Autorizado',
          bidderEmail: 'comprador@leilao.com'
        }
      : {
          lotId: lotOrPayload.lotId,
          lotNumber: lotOrPayload.lotNumber || lotOrPayload.lotId,
          lotTitle: lotOrPayload.lotTitle || `Lote ${lotOrPayload.lotId}`,
          amountUsd: lotOrPayload.amountUsd,
          bidderName: lotOrPayload.bidderName,
          bidderEmail: lotOrPayload.bidderEmail || 'comprador@leilao.com',
          isAutoSniper: lotOrPayload.isAutoSniper
        };

    const timestamp = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const bidItem: BidHistoryItem = {
      id: `bid-${Date.now()}`,
      bidderName: payload.bidderName,
      amountUsd: payload.amountUsd,
      timestamp: `Hoje, ${timestamp}`,
      isAutomatic: payload.isAutoSniper
    };

    console.log('[PHP API Bridge] 📡 POST /api/bids.php payload:', payload);

    if (this.config.enabled) {
      const url = `${this.config.baseUrl.replace(/\/+$/, '')}/bids.php`;
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(this.config.apiKey ? { 'Authorization': `Bearer ${this.config.apiKey}` } : {})
          },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(5000)
        });

        if (response.ok) {
          const resJson = await response.json();
          console.log('[PHP API Bridge] ✅ Lance homologado pelo PHP:', resJson);
          return {
            success: true,
            currentBidUsd: payload.amountUsd,
            message: resJson.message || 'Lance registrado no servidor PHP com sucesso!',
            bidItem
          };
        }
      } catch (err: any) {
        console.warn('[PHP API Bridge] ⚠️ Falha no envio para o PHP. Registrando localmente:', err?.message);
      }
    }

    // Local simulation fallback
    return {
      success: true,
      currentBidUsd: payload.amountUsd,
      message: `Lance de $${payload.amountUsd.toLocaleString()} USD computado com sucesso! (Modo Simulado)`,
      bidItem
    };
  }

  /**
   * Import batch of lots via PHP backend (or simulate)
   */
  public async importLots(lots: AuctionLot[], filename: string): Promise<{ success: boolean; count: number; message: string }> {
    console.log(`[PHP API Bridge] 📡 POST /api/import.php (${lots.length} lotes da planilha "${filename}")`);

    if (this.config.enabled) {
      const url = `${this.config.baseUrl.replace(/\/+$/, '')}/import.php`;
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(this.config.apiKey ? { 'Authorization': `Bearer ${this.config.apiKey}` } : {})
          },
          body: JSON.stringify({
            filename,
            lotsCount: lots.length,
            totalUnits: lots.reduce((acc, l) => acc + l.quantity, 0),
            lots
          }),
          signal: AbortSignal.timeout(8000)
        });

        if (response.ok) {
          const data = await response.json();
          return {
            success: true,
            count: lots.length,
            message: data.message || `${lots.length} lotes importados com sucesso no banco de dados PHP!`
          };
        }
      } catch (err: any) {
        console.warn('[PHP API Bridge] ⚠️ Falha no import PHP. Gravando localmente:', err?.message);
      }
    }

    return {
      success: true,
      count: lots.length,
      message: `${lots.length} lotes importados e publicados com sucesso!`
    };
  }

  /**
   * Poll latest bids in real time (for live updates across clients)
   */
  public async pollLatestBids(activeLots: AuctionLot[] = []): Promise<{ lotId: string; newBidAmount: number; bidderName: string } | null> {
    if (this.config.enabled) {
      const url = `${this.config.baseUrl.replace(/\/+$/, '')}/bids.php?poll=1&t=${Date.now()}`;
      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          signal: AbortSignal.timeout(3000)
        });
        if (response.ok) {
          const data = await response.json();
          if (data && data.latestBid) {
            return data.latestBid;
          }
        }
      } catch (e) {
        // Fallback to simulation
      }
    }

    // Realistic simulation: occasionally generate a competing buyer bid on a random lot
    if (activeLots.length === 0) return null;

    const randomChance = Math.random();
    if (randomChance > 0.65) { // 35% chance per tick
      const randomLot = activeLots[Math.floor(Math.random() * activeLots.length)];
      const increments = [25, 50, 75, 100];
      const inc = increments[Math.floor(Math.random() * increments.length)];
      const simulatedBidders = [
        'Eduardo Lima (SP Imports)',
        'Reseller Apple Rio',
        'Miami Phone Wholesale',
        'TechCell Distribuidora',
        'Lucas Martins Arrematante',
        'Lojista Minas Apple'
      ];
      const bidderName = simulatedBidders[Math.floor(Math.random() * simulatedBidders.length)];

      return {
        lotId: randomLot.id,
        newBidAmount: randomLot.currentBidUsd + inc,
        bidderName
      };
    }

    return null;
  }
}

export const apiService = new AuctionApiService();
