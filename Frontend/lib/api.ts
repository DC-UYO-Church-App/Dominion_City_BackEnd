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
