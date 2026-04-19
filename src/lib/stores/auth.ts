import { writable } from 'svelte/store';
import { goto } from '$app/navigation';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthStore {
  user: User | null;
  token: string | null;
}

function createAuthStore() {
  const { subscribe, set, update } = writable<AuthStore>({
    user: null,
    token: null,
  });
  
  return {
    subscribe,
    
    login: async (email: string, password: string, rememberMe: boolean = false) => {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, rememberMe }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Signin failed');
      }
      
      // Store token and user data
      if (rememberMe) {
        localStorage.setItem('auth_token', data.token);
      } else {
        sessionStorage.setItem('auth_token', data.token);
      }
      
      set({ user: data.user, token: data.token });
      
      return data;
    },
    
    logout: async () => {
      localStorage.removeItem('auth_token');
      sessionStorage.removeItem('auth_token');
      set({ user: null, token: null });
      goto('/signin');
    },
  };
}

export const authStore = createAuthStore();