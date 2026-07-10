import { api } from './client';
import type {
  DashboardData,
  Paginated,
  Transaction,
  TransactionType,
  FeeStrategy,
  User,
} from '../types';

interface AuthResponse {
  token: string;
  user: User;
}

export interface RegisterPayload {
  first_name: string;
  last_name: string;
  phone: string;
  country: string;
  password: string;
  password_confirmation: string;
}

export interface CreateTransactionPayload {
  type: TransactionType;
  fee_strategy: FeeStrategy;
  amount: number;
  client_phone: string;
}

export const authApi = {
  async login(phone: string, password: string): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/login', { phone, password });
    return data;
  },
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/register', payload);
    return data;
  },
  async sendOtp(phone: string): Promise<{ message: string; expires_in: number; dev_code?: string }> {
    const { data } = await api.post('/otp/send', { phone });
    return data;
  },
  async verifyOtp(phone: string, code: string): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/otp/verify', { phone, code });
    return data;
  },
  async me(): Promise<{ data: User }> {
    const { data } = await api.get<{ data: User }>('/me');
    return data;
  },
  async logout(): Promise<void> {
    await api.post('/logout');
  },
};

export const dashboardApi = {
  async get(): Promise<DashboardData> {
    const { data } = await api.get<DashboardData>('/dashboard');
    return data;
  },
};

export const transactionsApi = {
  async list(page = 1): Promise<Paginated<Transaction>> {
    const { data } = await api.get<Paginated<Transaction>>('/transactions', {
      params: { page },
    });
    return data;
  },
  async create(payload: CreateTransactionPayload): Promise<Transaction> {
    const { data } = await api.post<{ data: Transaction }>('/transactions', payload);
    return data.data;
  },
  async show(id: number): Promise<Transaction> {
    const { data } = await api.get<{ data: Transaction }>(`/transactions/${id}`);
    return data.data;
  },
};
