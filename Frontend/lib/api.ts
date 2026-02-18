const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

class ApiClient {
  private token: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  }

  private async request(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<any> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Auth
  async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    dateOfBirth?: string;
    address?: string;
  }) {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (response.token) {
      this.setToken(response.token);
    }
    return response;
  }

  async login(identifier: string, password: string) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password }),
    });
    if (response.token) {
      this.setToken(response.token);
    }
    return response;
  }

  async getProfile() {
    return this.request('/auth/profile');
  }

  async updateProfile(data: any) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async uploadProfileImage(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const headers: HeadersInit = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE_URL}/auth/profile/image`, {
      method: 'POST',
      body: formData,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Attendance
  async recordAttendance(data: {
    userId: string;
    eventId?: string;
    serviceDate: string;
    checkInTime?: string;
    status?: string;
    isFirstTimer?: boolean;
    notes?: string;
  }) {
    return this.request('/attendance', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getUserAttendance(userId: string, startDate?: string, endDate?: string) {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return this.request(`/attendance/user/${userId}?${params}`);
  }

  async getAttendanceStats(userId: string) {
    return this.request(`/attendance/user/${userId}/stats`);
  }

  async getAdminDashboardStats() {
    return this.request('/admin/stats');
  }

  async createBookshopManager(data: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    address: string;
    password: string;
    confirmPassword: string;
    profileImage?: File | null;
  }) {
    if (data.profileImage) {
      const formData = new FormData();
      formData.append('firstName', data.firstName);
      formData.append('lastName', data.lastName);
      formData.append('email', data.email);
      formData.append('phoneNumber', data.phoneNumber);
      formData.append('address', data.address);
      formData.append('password', data.password);
      formData.append('confirmPassword', data.confirmPassword);
      formData.append('profileImage', data.profileImage);

      const headers: HeadersInit = {};
      if (this.token) {
        headers['Authorization'] = `Bearer ${this.token}`;
      }

      const response = await fetch(`${API_BASE_URL}/admin/bookshop-managers`, {
        method: 'POST',
        body: formData,
        headers,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(error.error || `HTTP ${response.status}`);
      }

      return response.json();
    }

    return this.request('/admin/bookshop-managers', {
      method: 'POST',
      body: JSON.stringify({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        address: data.address,
        password: data.password,
        confirmPassword: data.confirmPassword,
      }),
    });
  }

  async getBookshopManagers() {
    return this.request('/admin/bookshop-managers');
  }

  async deleteBookshopManager(id: string) {
    return this.request(`/admin/bookshop-managers/${id}`, {
      method: 'DELETE',
    });
  }

  async createBook(data: {
    title: string;
    author: string;
    category: string;
    price: number;
    quantity: number;
    summary?: string;
    coverFile?: File | null;
  }) {
    if (data.coverFile) {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('author', data.author);
      formData.append('category', data.category);
      formData.append('price', data.price.toString());
      formData.append('quantity', data.quantity.toString());
      if (data.summary) formData.append('summary', data.summary);
      formData.append('cover', data.coverFile);

      const headers: HeadersInit = {};
      if (this.token) {
        headers['Authorization'] = `Bearer ${this.token}`;
      }

      const response = await fetch(`${API_BASE_URL}/books`, {
        method: 'POST',
        body: formData,
        headers,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(error.error || `HTTP ${response.status}`);
      }

      return response.json();
    }

    return this.request('/books', {
      method: 'POST',
      body: JSON.stringify({
        title: data.title,
        author: data.author,
        category: data.category,
        price: data.price,
        quantity: data.quantity,
        summary: data.summary,
      }),
    });
  }

  async getBooks() {
    return this.request('/books');
  }

  async getBookStats() {
    return this.request('/books/stats');
  }

  async getBookSales() {
    return this.request('/books/sales');
  }

  async updateBook(
    id: string,
    data: {
      title?: string;
      author?: string;
      category?: string;
      price?: number;
      quantity?: number;
      summary?: string;
      coverFile?: File | null;
    }
  ) {
    if (data.coverFile) {
      const formData = new FormData();
      if (data.title) formData.append('title', data.title);
      if (data.author) formData.append('author', data.author);
      if (data.category) formData.append('category', data.category);
      if (data.price !== undefined) formData.append('price', data.price.toString());
      if (data.quantity !== undefined) formData.append('quantity', data.quantity.toString());
      if (data.summary) formData.append('summary', data.summary);
      formData.append('cover', data.coverFile);

      const headers: HeadersInit = {};
      if (this.token) {
        headers['Authorization'] = `Bearer ${this.token}`;
      }

      const response = await fetch(`${API_BASE_URL}/books/${id}`, {
        method: 'PUT',
        body: formData,
        headers,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(error.error || `HTTP ${response.status}`);
      }

      return response.json();
    }

    return this.request(`/books/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        title: data.title,
        author: data.author,
        category: data.category,
        price: data.price,
        quantity: data.quantity,
        summary: data.summary,
      }),
    });
  }

  async deleteBook(id: string) {
    return this.request(`/books/${id}`, {
      method: 'DELETE',
    });
  }

  async createSermon(data: {
    title: string;
    preacher: string;
    duration?: string;
    description?: string;
    videoUrl?: string;
    thumbnailFile?: File | null;
    category?: string;
  }) {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('preacher', data.preacher);
    if (data.duration) formData.append('duration', data.duration);
    if (data.description) formData.append('description', data.description);
    if (data.videoUrl) formData.append('videoUrl', data.videoUrl);
    if (data.category) formData.append('category', data.category);
    if (data.thumbnailFile) formData.append('thumbnail', data.thumbnailFile);

    const headers: HeadersInit = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE_URL}/sermons`, {
      method: 'POST',
      body: formData,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async updateSermon(
    id: string,
    data: { title?: string; preacher?: string; description?: string; videoUrl?: string; duration?: string }
  ) {
    return this.request(`/sermons/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteSermon(id: string) {
    return this.request(`/sermons/${id}`, {
      method: 'DELETE',
    });
  }

  // Events
  async createEvent(data: {
    title: string;
    description?: string;
    eventDate: string;
    address?: string;
    status?: 'scheduled' | 'cancelled';
    coverFile?: File | null;
  }) {
    if (data.coverFile) {
      const formData = new FormData();
      formData.append('title', data.title);
      if (data.description) formData.append('description', data.description);
      formData.append('eventDate', data.eventDate);
      if (data.address) formData.append('address', data.address);
      if (data.status) formData.append('status', data.status);
      formData.append('cover', data.coverFile);

      const headers: HeadersInit = {};
      if (this.token) {
        headers['Authorization'] = `Bearer ${this.token}`;
      }

      const response = await fetch(`${API_BASE_URL}/events`, {
        method: 'POST',
        body: formData,
        headers,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(error.error || `HTTP ${response.status}`);
      }

      return response.json();
    }

    return this.request('/events', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getEvents(filters?: { startDate?: string; endDate?: string; limit?: number; offset?: number }) {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, value.toString());
      });
    }
    return this.request(`/events?${params}`);
  }

  async updateEvent(
    id: string,
    data: {
      title?: string;
      description?: string;
      eventDate?: string;
      address?: string;
      status?: 'scheduled' | 'cancelled';
      coverFile?: File | null;
    }
  ) {
    if (data.coverFile) {
      const formData = new FormData();
      if (data.title) formData.append('title', data.title);
      if (data.description) formData.append('description', data.description);
      if (data.eventDate) formData.append('eventDate', data.eventDate);
      if (data.address) formData.append('address', data.address);
      if (data.status) formData.append('status', data.status);
      formData.append('cover', data.coverFile);

      const headers: HeadersInit = {};
      if (this.token) {
        headers['Authorization'] = `Bearer ${this.token}`;
      }

      const response = await fetch(`${API_BASE_URL}/events/${id}`, {
        method: 'PUT',
        body: formData,
        headers,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(error.error || `HTTP ${response.status}`);
      }

      return response.json();
    }

    return this.request(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteEvent(id: string) {
    return this.request(`/events/${id}`, {
      method: 'DELETE',
    });
  }

  // Tithes
  async recordTithe(data: {
    userId: string;
    amount: number;
    frequency: string;
    paymentDate?: string;
    paymentMethod: string;
    notes?: string;
  }) {
    return this.request('/tithes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getUserTithes(userId: string, startDate?: string, endDate?: string) {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return this.request(`/tithes/user/${userId}?${params}`);
  }

  async getTitheStats(userId: string) {
    return this.request(`/tithes/user/${userId}/stats`);
  }

  async getTitheByReceipt(receiptNumber: string) {
    return this.request(`/tithes/receipt/${receiptNumber}`);
  }

  // Sermons
  async getSermons(filters?: {
    preacher?: string;
    category?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }) {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, value.toString());
      });
    }
    return this.request(`/sermons?${params}`);
  }

  async getSermon(id: string) {
    return this.request(`/sermons/${id}`);
  }

  async searchSermons(query: string) {
    return this.request(`/sermons/search?q=${encodeURIComponent(query)}`);
  }

  // Cell Groups
  async getCellGroups() {
    return this.request('/cell-groups');
  }

  async getCellGroup(id: string) {
    return this.request(`/cell-groups/${id}`);
  }

  async getNearestCellGroups(latitude: number, longitude: number, limit?: number) {
    const params = new URLSearchParams({
      latitude: latitude.toString(),
      longitude: longitude.toString(),
    });
    if (limit) params.append('limit', limit.toString());
    return this.request(`/cell-groups/nearest?${params}`);
  }

  async getCellGroupMembers(id: string) {
    return this.request(`/cell-groups/${id}/members`);
  }

  logout() {
    this.clearToken();
  }
}

export const apiClient = new ApiClient();
