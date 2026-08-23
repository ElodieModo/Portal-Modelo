// API client configuration
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
  [key: string]: any;
}

class ApiClient {
  private token: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('adminToken') || localStorage.getItem('studentToken');
    }
  }

  setToken(token: string, type: 'admin' | 'student' = 'admin') {
    this.token = token;
    localStorage.setItem(`${type}Token`, token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('adminToken');
    localStorage.removeItem('studentToken');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
// ...existing code...

    const headers = new Headers(options.headers);

    headers.set('Content-Type', 'application/json');

    if (this.token) {
      headers.set('Authorization', `Bearer ${this.token}`);
    }

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          error: data.error || 'An error occurred',
          ...data,
        };
      }

      return { data, ...data };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Admin Authentication
  async adminLogin(email: string, password: string) {
    const response = await this.request('/admin/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (!response.error && response.token) {
      this.setToken(response.token, 'admin');
    }
    return response;
  }

  async getAdminProfile() {
    return this.request('/admin/auth/me');
  }

  async changeAdminPassword(currentPassword: string, newPassword: string) {
    return this.request('/admin/auth/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  // Dashboard
  async getDashboardStats() {
    return this.request('/dashboard/stats');
  }

  async getAllEnrollments() {
    return this.request('/dashboard/enrollments');
  }

  async getFinanceEnrollments() {
    return this.request('/dashboard/finance');
  }

  async updatePaymentStatus(enrollmentId: string, received: boolean) {
    return this.request(`/dashboard/finance/${enrollmentId}/payment`, {
      method: 'PUT',
      body: JSON.stringify({ received }),
    });
  }

  async updateFreeStatus(enrollmentId: string, free: boolean) {
    return this.request(`/dashboard/finance/${enrollmentId}/free`, {
      method: 'PUT',
      body: JSON.stringify({ free }),
    });
  }

  async getCourseEnrollments(courseId: string) {
    return this.request(`/dashboard/enrollments/course/${courseId}`);
  }

async cancelAdminEnrollment(enrollmentId: string) {
  return this.request(`/dashboard/enrollments/${enrollmentId}`, {
    method: 'DELETE',
  });
}

  async getAllStudents() {
    return this.request('/dashboard/students');
  }

  // Courses
  async getAllCourses() {
    return this.request('/courses');
  }

  async getRegularCourses() {
    return this.request('/courses/regular');
  }

  async getSpecialCourses() {
    return this.request('/courses/special/upcoming');
  }

  async getCourseById(id: string) {
    return this.request(`/courses/${id}`);
  }

  async createCourse(courseData: any) {
    return this.request('/courses', {
      method: 'POST',
      body: JSON.stringify(courseData),
    });
  }

  async updateCourse(id: string, courseData: any) {
    return this.request(`/courses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(courseData),
    });
  }

  async deleteCourse(id: string) {
    return this.request(`/courses/${id}`, {
      method: 'DELETE',
    });
  }

  // Student Authentication
  async studentRegister(data: any) {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!response.error && response.token) {
      this.setToken(response.token, 'student');
    }
    return response;
  }

  async studentLogin(email: string, password: string) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (!response.error && response.token) {
      this.setToken(response.token, 'student');
    }
    return response;
  }

  async getStudentProfile() {
    return this.request('/auth/me');
  }

  // Enrollments
  async enrollInCourse(
    courseId: string,
    enrollmentDate: string,
    participants: { firstName: string; lastName: string; age: number }[]
  ) {
    return this.request('/enrollments', {
      method: 'POST',
      body: JSON.stringify({ courseId, enrollmentDate, numberOfPeople: participants.length, participants }),
    });
  }

  async cancelEnrollment(enrollmentId: string) {
    return this.request(`/enrollments/${enrollmentId}/cancel`, {
      method: 'PUT',
    });
  }
}

export const apiClient = new ApiClient();
