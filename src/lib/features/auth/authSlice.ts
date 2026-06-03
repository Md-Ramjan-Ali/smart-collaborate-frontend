import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  token: string | null;
  user: {
    id: string;
    name: string;
    email: string;
    role: 'ADMIN' | 'PROJECT_MANAGER' | 'TEAM_MEMBER';
  } | null;
}

const getInitialState = (): AuthState => {
  if (typeof window === 'undefined') {
    return { token: null, user: null };
  }
  
  try {
    const token = localStorage.getItem('token');
    const userJson = localStorage.getItem('user');
    const user = userJson ? JSON.parse(userJson) : null;
    return { token, user };
  } catch (error) {
    return { token: null, user: null };
  }
};

const authSlice = createSlice({
  name: 'auth',
  initialState: getInitialState(),
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{
        token: string;
        user: { id: string; name: string; email: string; role: 'ADMIN' | 'PROJECT_MANAGER' | 'TEAM_MEMBER' };
      }>
    ) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', action.payload.token);
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      }
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
