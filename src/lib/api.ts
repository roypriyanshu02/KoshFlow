const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Types for better type safety
export interface ApiError {
  error: string;
  message: string;
  code?: string;
  details?: Array<{
    field: string;
    message: string;
    value?: any;
  }>;
}

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
  code?: string;
}

class ApiClient {
  private baseURL: string;
  private token: string | null = null;
  private refreshToken: string | null = null;
  private isRefreshing = false;
  private refreshPromise: Promise<string> | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('token');
    this.refreshToken = localStorage.getItem('refreshToken');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  setRefreshToken(refreshToken: string | null) {
    this.refreshToken = refreshToken;
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    } else {
      localStorage.removeItem('refreshToken');
    }
  }

  private async refreshAccessToken(): Promise<string> {
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = this.performTokenRefresh();

    try {
      const newToken = await this.refreshPromise;
      return newToken;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  private async performTokenRefresh(): Promise<string> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      this.setToken(data.accessToken);
      this.setRefreshToken(data.refreshToken);
      
      return data.accessToken;
    } catch (error) {
      // Clear tokens on refresh failure
      this.setToken(null);
      this.setRefreshToken(null);
      throw error;
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retryCount = 0
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    console.log(`🌐 API Request: ${options.method || 'GET'} ${url}`);
    console.log('Request config:', config);

    try {
      const response = await fetch(url, config);
      console.log(`📡 API Response: ${response.status} ${response.statusText}`);
      
      // Handle token expiration
      if (response.status === 401 && this.refreshToken && retryCount === 0) {
        try {
          const newToken = await this.refreshAccessToken();
          // Retry the request with new token
          return this.request(endpoint, {
            ...options,
            headers: {
              ...config.headers,
              Authorization: `Bearer ${newToken}`,
            },
          }, 1);
        } catch (refreshError) {
          // Refresh failed, redirect to login
          this.setToken(null);
          this.setRefreshToken(null);
          window.location.href = '/login';
          throw new Error('Session expired. Please login again.');
        }
      }
      
      if (!response.ok) {
        const errorData: ApiError = await response.json().catch(() => ({
          error: 'Request failed',
          message: `HTTP ${response.status}: ${response.statusText}`
        }));
        
        // Create a more detailed error object
        const error = new Error(errorData.message || errorData.error || 'Request failed');
        (error as any).code = errorData.code;
        (error as any).details = errorData.details;
        (error as any).status = response.status;
        
        throw error;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      
      // Handle network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error. Please check your connection and ensure the backend server is running.');
      }
      
      // Handle connection refused errors
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new Error('Cannot connect to server. Please ensure the backend server is running on http://localhost:3001');
      }
      
      throw error;
    }
  }

  // Enhanced request method with retry logic
  private async requestWithRetry<T>(
    endpoint: string,
    options: RequestInit = {},
    maxRetries = 3
  ): Promise<T> {
    let lastError: Error;
    
    for (let i = 0; i <= maxRetries; i++) {
      try {
        return await this.request<T>(endpoint, options);
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on client errors (4xx) except 429 (rate limit)
        if (error instanceof Error && 'status' in error) {
          const status = (error as any).status;
          if (status >= 400 && status < 500 && status !== 429) {
            throw error;
          }
        }
        
        // Don't retry on the last attempt
        if (i === maxRetries) {
          break;
        }
        
        // Wait before retrying (exponential backoff)
        const delay = Math.pow(2, i) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError!;
  }

  // Auth endpoints
  async login(email: string, password: string, twoFactorCode?: string) {
    try {
      const response = await this.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password, twoFactorCode }),
      });
      
      // Store tokens if login is successful
      if (response.accessToken) {
        this.setToken(response.accessToken);
        this.setRefreshToken(response.refreshToken);
      }
      
      return response;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  async register(data: {
    companyName: string;
    companyEmail: string;
    adminName: string;
    adminEmail: string;
    password: string;
    phone?: string;
    gstin?: string;
    pan?: string;
  }) {
    try {
      const response = await this.request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      
      // Store tokens if registration is successful
      if (response.accessToken) {
        this.setToken(response.accessToken);
        this.setRefreshToken(response.refreshToken);
      }
      
      return response;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  }

  async getProfile() {
    return this.request('/auth/me');
  }

  async logout() {
    try {
      await this.request('/auth/logout', {
        method: 'POST',
      });
    } finally {
      // Clear tokens regardless of API response
      this.setToken(null);
      this.setRefreshToken(null);
    }
  }

  // 2FA endpoints
  async setup2FA(password: string) {
    return this.request('/auth/2fa/setup', {
      method: 'POST',
      body: JSON.stringify({ password }),
    });
  }

  async verify2FA(token: string) {
    return this.request('/auth/2fa/verify', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  async disable2FA(token: string) {
    return this.request('/auth/2fa/disable', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  async changePassword(currentPassword: string, newPassword: string) {
    return this.request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  // Contacts endpoints
  async getContacts(params?: {
    search?: string;
    type?: string;
    page?: number;
    limit?: number;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.append('search', params.search);
    if (params?.type) searchParams.append('type', params.type);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    
    const queryString = searchParams.toString();
    return this.requestWithRetry(`/contacts${queryString ? `?${queryString}` : ''}`);
  }

  async getContact(id: string) {
    return this.requestWithRetry(`/contacts/${id}`);
  }

  async createContact(data: any) {
    return this.requestWithRetry('/contacts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateContact(id: string, data: any) {
    return this.requestWithRetry(`/contacts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteContact(id: string) {
    return this.requestWithRetry(`/contacts/${id}`, {
      method: 'DELETE',
    });
  }

  async getContactSummary(id: string) {
    return this.requestWithRetry(`/contacts/${id}/summary`);
  }

  // Products endpoints
  async getProducts(params?: {
    search?: string;
    type?: string;
    page?: number;
    limit?: number;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.append('search', params.search);
    if (params?.type) searchParams.append('type', params.type);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    
    const queryString = searchParams.toString();
    return this.requestWithRetry(`/products${queryString ? `?${queryString}` : ''}`);
  }

  async getProduct(id: string) {
    return this.requestWithRetry(`/products/${id}`);
  }

  async createProduct(data: any) {
    return this.requestWithRetry('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProduct(id: string, data: any) {
    return this.requestWithRetry(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteProduct(id: string) {
    return this.requestWithRetry(`/products/${id}`, {
      method: 'DELETE',
    });
  }

  async adjustStock(id: string, data: {
    quantity: number;
    type: 'IN' | 'OUT' | 'ADJUSTMENT';
    notes?: string;
    costPrice?: number;
  }) {
    return this.requestWithRetry(`/products/${id}/adjust-stock`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getLowStockProducts() {
    return this.requestWithRetry('/products/inventory/low-stock');
  }

  // Transactions endpoints
  async getTransactions(params?: {
    type?: string;
    status?: string;
    contactId?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: string;
  }) {
    const searchParams = new URLSearchParams();
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });
    
    const queryString = searchParams.toString();
    return this.requestWithRetry(`/transactions${queryString ? `?${queryString}` : ''}`);
  }

  async getTransaction(id: string) {
    return this.requestWithRetry(`/transactions/${id}`);
  }

  async createTransaction(data: any) {
    return this.requestWithRetry('/transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTransaction(id: string, data: any) {
    return this.requestWithRetry(`/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteTransaction(id: string) {
    return this.requestWithRetry(`/transactions/${id}`, {
      method: 'DELETE',
    });
  }

  async updateTransactionStatus(id: string, status: string, comments?: string) {
    return this.requestWithRetry(`/transactions/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, comments }),
    });
  }

  async getTransactionSummary(params?: {
    startDate?: string;
    endDate?: string;
    type?: string;
  }) {
    const searchParams = new URLSearchParams();
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });
    
    const queryString = searchParams.toString();
    return this.requestWithRetry(`/transactions/summary/overview${queryString ? `?${queryString}` : ''}`);
  }

  // Taxes endpoints
  async getTaxes(params?: {
    search?: string;
    type?: string;
    page?: number;
    limit?: number;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.append('search', params.search);
    if (params?.type) searchParams.append('type', params.type);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    
    const queryString = searchParams.toString();
    return this.requestWithRetry(`/taxes${queryString ? `?${queryString}` : ''}`);
  }

  async getTax(id: string) {
    return this.requestWithRetry(`/taxes/${id}`);
  }

  async createTax(data: any) {
    return this.requestWithRetry('/taxes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTax(id: string, data: any) {
    return this.requestWithRetry(`/taxes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteTax(id: string) {
    return this.requestWithRetry(`/taxes/${id}`, {
      method: 'DELETE',
    });
  }

  // Accounts endpoints
  async getAccounts(params?: {
    type?: string;
    parentId?: string;
    page?: number;
    limit?: number;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.type) searchParams.append('type', params.type);
    if (params?.parentId) searchParams.append('parentId', params.parentId);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    
    const queryString = searchParams.toString();
    return this.requestWithRetry(`/accounts${queryString ? `?${queryString}` : ''}`);
  }

  async getAccount(id: string) {
    return this.requestWithRetry(`/accounts/${id}`);
  }

  async createAccount(data: any) {
    return this.requestWithRetry('/accounts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAccount(id: string, data: any) {
    return this.requestWithRetry(`/accounts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteAccount(id: string) {
    return this.requestWithRetry(`/accounts/${id}`, {
      method: 'DELETE',
    });
  }

  async getAccountHierarchy() {
    return this.requestWithRetry('/accounts/hierarchy/tree');
  }

  async getAccountBalance(id: string, params?: {
    startDate?: string;
    endDate?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.startDate) searchParams.append('startDate', params.startDate);
    if (params?.endDate) searchParams.append('endDate', params.endDate);
    
    const queryString = searchParams.toString();
    return this.requestWithRetry(`/accounts/${id}/balance${queryString ? `?${queryString}` : ''}`);
  }

  // Reports endpoints
  async getDashboardSummary(params?: {
    startDate?: string;
    endDate?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.startDate) searchParams.append('startDate', params.startDate);
    if (params?.endDate) searchParams.append('endDate', params.endDate);
    
    const queryString = searchParams.toString();
    return this.requestWithRetry(`/reports/dashboard${queryString ? `?${queryString}` : ''}`);
  }

  async getProfitLossReport(startDate: string, endDate: string) {
    return this.requestWithRetry(`/reports/profit-loss?startDate=${startDate}&endDate=${endDate}`);
  }

  async getBalanceSheet(asOfDate?: string) {
    const queryString = asOfDate ? `?asOfDate=${asOfDate}` : '';
    return this.requestWithRetry(`/reports/balance-sheet${queryString}`);
  }

  async getCashFlowReport(startDate: string, endDate: string) {
    return this.requestWithRetry(`/reports/cash-flow?startDate=${startDate}&endDate=${endDate}`);
  }

  async getAgingReport(asOfDate?: string) {
    const queryString = asOfDate ? `?asOfDate=${asOfDate}` : '';
    return this.requestWithRetry(`/reports/aging${queryString}`);
  }

  async getSalesReport(params: {
    startDate: string;
    endDate: string;
    groupBy?: 'day' | 'week' | 'month';
  }) {
    const searchParams = new URLSearchParams();
    searchParams.append('startDate', params.startDate);
    searchParams.append('endDate', params.endDate);
    if (params.groupBy) searchParams.append('groupBy', params.groupBy);
    
    return this.requestWithRetry(`/reports/sales?${searchParams.toString()}`);
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export default apiClient;