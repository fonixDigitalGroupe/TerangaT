export type FeeStrategy = 'client_pays' | 'deducted' | 'agent_receives';
export type TransactionType = 'dépôt' | 'retrait';

export interface Wallet {
  id: number;
  balance: number;
  currency: string;
  updated_at: string;
}

export interface Agent {
  id: number;
  shop_name: string;
  ninea: string | null;
  address: string | null;
  wave_number: string | null;
  om_number: string | null;
  wallet?: Wallet;
}

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  name: string;
  phone: string;
  email: string | null;
  country: string | null;
  address: string | null;
  role: string;
  agent?: Agent;
}

export interface Transaction {
  id: number;
  reference: string;
  type: TransactionType;
  fee_strategy: FeeStrategy;
  amount: number;
  commission: number;
  total: number;
  client_phone: string;
  status: string;
  created_at: string;
  commission_breakdown?: {
    agent_amount: number;
    platform_amount: number;
  };
}

export interface DashboardData {
  wallet: Wallet;
  stats: {
    total_transactions: number;
    total_depot: number;
    total_retrait: number;
    total_commission: number;
  };
  recent_transactions: Transaction[];
}

export interface Paginated<T> {
  data: T[];
  meta: { current_page: number; last_page: number; total: number };
  links: { next: string | null; prev: string | null };
}
