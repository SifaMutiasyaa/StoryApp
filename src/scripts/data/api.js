import { CONFIG } from '../config';

const API_ENDPOINT = CONFIG.BASE_URL;

const StoryApi = {
  async login({ email, password }) {
    const response = await fetch(`${API_ENDPOINT}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  },

  async register({ name, email, password }) {
    const response = await fetch(`${API_ENDPOINT}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    return response.json();
  },

  async getStories({ token, page = 1, size = 100 }) {
    const response = await fetch(`${API_ENDPOINT}/stories?page=${page}&size=${size}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch stories');
    }

    return response.json();
  },

  async getStoryDetail({ id, token }) {
    try {
      if (!id || typeof id !== 'string' || id.trim() === '') {
        throw new Error('Invalid story ID format');
      }
  
      const response = await fetch(`${API_ENDPOINT}/stories/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 404) {
          throw new Error(`Story not found`);
        }
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
  
      const responseJson = await response.json();
  
      if (!responseJson.story) {
        throw new Error('Invalid story data received from server');
      }
  
      return responseJson;
    } catch (error) {
      console.error('API Error in getStoryDetail:', error);
      throw new Error(`Failed to load story: ${error.message}`);
    }
  },


  async addStory({ token, data }) {
    const response = await fetch(`${API_ENDPOINT}/stories`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: data,
    });
    return response.json();
  },

  async addStoryGuest(data) {
    const response = await fetch(`${API_ENDPOINT}/stories/guest`, {
      method: 'POST',
      body: data,
    });
    return response.json();
  },
};

export default StoryApi;
