export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:8000') {
    this.baseUrl = baseUrl;
  }

  async getOptions() {
    return {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    };
  }

  async get(path: string) {
    try {
      const options = await this.getOptions();
      const response = await fetch(`${this.baseUrl}${path}`, options);
      if (!response.ok) {
        throw new Error(`API GET request failed: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`[ApiClient GET Error] ${path}:`, error);
      throw error;
    }
  }

  async post(path: string, body: any) {
    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        throw new Error(`API POST request failed: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`[ApiClient POST Error] ${path}:`, error);
      throw error;
    }
  }
}

export const api = new ApiClient();
