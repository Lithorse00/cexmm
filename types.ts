
export enum Exchange {
  Binance = 'Binance',
  OKX = 'OKX',
  Bybit = 'Bybit',
  KuCoin = 'KuCoin',
  Gate = 'Gate',
  MEXC = 'MEXC'
}

export enum AccountRole {
  Admin = 'Admin',
  Operator = 'Operator',
  Finance = 'Finance',
  Risk = 'Risk'
}

export interface Account {
  id: string;
  name: string;
  exchange: Exchange;
  role: AccountRole | string;
  apiKey: string; // Masked in UI
  status: 'active' | 'disabled';
  lastActive: string;
  balanceUSDT: number;
}

export interface LoginAccount {
  id: string;
  account: string;
  password?: string; // Mock only
  googleSecret: string;
  role: string;
  status: 'normal' | 'forbidden';
  createTime: string;
  loginTime: string;
}

export interface MMAccount {
  id: string;
  uid: string;
  name: string;
  apiKey: string;
  secretKey: string;
  passphrase?: string;
  ipWhitelist: string;
  transactionTypes: string[]; // e.g. 'Spot', 'Future'
  tradingPairs: string[]; // e.g. 'BTC/USDT'
  exchange: Exchange;
  partition: string;
  leverage?: number;
  modificationTime: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  allowedPartitions: string[]; // List of Partition Names
  allowedModules: string[]; // List of sidebar keys e.g. 'trade-kline', 'market'
  allowedExchanges?: string[];
  allowedTransactionTypes?: string[];
}

export enum StrategyType {
  Random = 'Random Mode',
  Follow = 'Follow Mode',
  OrderBookAuto = 'Auto Depth',
  OrderBookGrid = 'Grid Depth',
  OrderBookMode = 'Order Book Mode',
  SpreadControl = 'Spread Control',
  WashTrade = 'Wash Trading',
  PriceBoundary = 'Price Boundary',
  SpreadFunding = 'Funding Rate',
  CrossExchange = 'Cross Exchange'
}

export enum TransactionType {
  Spot = 'Spot',
  Perpetual = 'Perpetual',
  Margin = 'Margin',
  Delivery = 'Delivery',
  Option = 'Option',
  Contract = 'Contract'
}

export interface StrategyConfig {
  id: string;
  type: StrategyType;
  pair: string;
  exchange: Exchange;
  status: 'running' | 'stopped' | 'error';
  minPrice?: number;
  maxPrice?: number;
  volatility?: number;
  orderSizeRange?: [number, number];
  interval?: number;
}

export interface RandomStrategy {
  id: string;
  taskId: string;
  exchange: Exchange;
  pair: string;
  transactionType: TransactionType;
  account1Id: string;
  account2Id: string;
  minMakerPrice: number;
  maxMakerPrice: number;
  volatility: number;
  maxQtyList: string; // "2,3,4"
  minQtyList: string; // "1,2,3"
  qtyChangePeriod: number; // minutes
  maxOrderInterval: number; // seconds
  minOrderInterval: number; // seconds
  status: 'running' | 'stopped';
}

export interface FollowStrategy {
  id: string;
  taskId: string;
  exchange: Exchange;
  pair: string;
  transactionType: TransactionType;
  account1Id: string;
  account2Id: string;
  
  // Follow Specifics
  followExchanges: string; // CSV
  followPairs: string; // CSV
  followTransactionType: TransactionType;
  weights: string; // CSV, sum must be 1
  followChangePeriod: number; // K-line period
  
  maxQty: string;
  minQty: string;
  qtyChangePeriod: number;
  maxOrderInterval: number;
  minOrderInterval: number;
  
  status: 'running' | 'stopped';
}

export interface OrderBookStrategy {
  id: string;
  taskId: string;
  exchange: Exchange;
  pair: string;
  transactionType: TransactionType;
  account1Id: string;
  account2Id: string;
  volatility: number;
  maxQty: string;
  minQty: string;
  qtyChangePeriod: number;
  minOrderInterval: number;
  maxOrderInterval: number;
  status: 'running' | 'stopped';
}

export interface PriceBoundaryStrategy {
  id: string;
  taskId: string;
  exchange: Exchange;
  pair: string;
  transactionType: TransactionType;
  accountId: string; // Single account
  minMakerPrice: number;
  maxMakerPrice: number;
  floatingValue: number;
  maxQty: string;
  minQty: string;
  minOrderInterval: number;
  maxOrderInterval: number;
  status: 'running' | 'stopped';
}

export interface OrderBookEntry {
  price: number;
  amount: number;
  total: number;
}

export type Language = 'en' | 'zh';

export interface UserSession {
  username: string;
  role: string;
}
