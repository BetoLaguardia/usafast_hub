export type GradeType = 'Grade A+' | 'Grade A' | 'Grade B' | 'Grade C' | 'CPO Refurbished' | 'A(T) DNA' | 'B(T) DNB' | 'C(T) DNC' | 'D(T) DND' | string;

export interface DeviceItem {
  id: string;
  model: string;
  storage: string;
  color: string;
  grade: GradeType;
  batteryHealth: number;
  imeiMasked: string;
  carrierStatus: string;
  icloudStatus: string;
  screenCondition: string;
  housingCondition: string;
  partNumber?: string;
  inventorySource?: string;
  itemDescription?: string;
}

export interface BidHistoryItem {
  id: string;
  bidderName: string;
  amountUsd: number;
  timestamp: string;
  isAutomatic?: boolean;
}

export interface AuctionLot {
  id: string;
  lotNumber: string;
  title: string;
  modelFamily: string;
  oemBrand?: string;
  quantity: number;
  grade: GradeType;
  primaryStorage: string;
  colorHighlights: string[];
  batteryHealthRange: string;
  carrierStatus: string;
  imeiStatus: string;
  auctionHouse: string;
  location: string;
  startingBidUsd: number;
  currentBidUsd: number;
  reservePriceMet: boolean;
  estimatedBrazilRetailBrl: number;
  totalBidsCount: number;
  endTime: string;
  imageUrl: string;
  galleryImages: string[];
  description: string;
  diagnosticReport: {
    faceId: boolean;
    trueTone: boolean;
    camerasPassed: boolean;
    batteryTested: boolean;
    cleanEsn: boolean;
    mdmFree: boolean;
  };
  manifest: DeviceItem[];
  bidsHistory: BidHistoryItem[];
  originalListingUrl?: string;
  listingUrl?: string;
  sourceType?: 'VERIZON' | 'CARRIER' | 'CUSTOM' | 'DEFAULT';
}

export interface SystemUser {
  name: string;
  email: string;
  cpfCnpj: string;
  phone: string;
  biddingLimitUsd: number;
  verifiedStatus: boolean;
  registeredDate: string;
  password?: string;
  role?: 'client' | 'admin';
}

export interface AdminOffer {
  id: string;
  lotId: string;
  lotNumber: string;
  lotTitle: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  amountUsd: number;
  amountBrl: number;
  timestamp: string;
  status: 'Vencendo' | 'Homologada / Arrematada' | 'Superada' | 'Em Análise';
  isAutoSniper?: boolean;
}
