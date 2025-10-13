import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type UserType = 'user' | 'serviceProvider' | 'admin';
export type ApplicationStatus = 'not-applied' | 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected';

export interface User {
  _id: string;
  fullName: string;
  phone: string;
  email: string;
  role: UserType;
  applicationStatus?: ApplicationStatus;
  isVerified?: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoggedIn: boolean;
  loading: boolean;
  error: string | null;
  applicationStatus: ApplicationStatus;
}

// Helper function to get initial state from localStorage
const getInitialState = (): AuthState => {
  try {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');
    
    if (savedUser && savedToken) {
      const parsedUser: User = JSON.parse(savedUser);
      return {
        user: parsedUser,
        token: savedToken,
        isLoggedIn: true,
        loading: false,
        error: null,
        applicationStatus: parsedUser.applicationStatus || 'not-applied',
      };
    }
  } catch (error) {
    console.error('Error reading auth data from localStorage:', error);
  }
  
  return {
    user: null,
    token: null,
    isLoggedIn: false,
    loading: false,
    error: null,
    applicationStatus: 'not-applied',
  };
};

const authSlice = createSlice({
  name: 'auth',
  initialState: getInitialState(),
  reducers: {
    // Login actions
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.loading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isLoggedIn = true;
      state.error = null;
      state.applicationStatus = action.payload.user.applicationStatus || 'not-applied';
      
      // Save to localStorage
      localStorage.setItem('user', JSON.stringify(action.payload.user));
      localStorage.setItem('token', action.payload.token);
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
      state.isLoggedIn = false;
    },

    // Logout action
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isLoggedIn = false;
      state.applicationStatus = 'not-applied';
      state.error = null;
      
      // Clear localStorage
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    },

    // Update user data
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        state.applicationStatus = action.payload.applicationStatus || state.applicationStatus;
        localStorage.setItem('user', JSON.stringify(state.user));
      }
    },

    // Update application status
    updateApplicationStatus: (state, action: PayloadAction<ApplicationStatus>) => {
      state.applicationStatus = action.payload;
      if (state.user) {
        state.user.applicationStatus = action.payload;
        localStorage.setItem('user', JSON.stringify(state.user));
      }
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },

    // Set loading
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

// Export actions
export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  updateUser,
  updateApplicationStatus,
  clearError,
  setLoading,
} = authSlice.actions;

// Export selectors
export const selectAuth = (state: { auth: AuthState }) => state.auth;
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectToken = (state: { auth: AuthState }) => state.auth.token;
export const selectIsLoggedIn = (state: { auth: AuthState }) => state.auth.isLoggedIn;
export const selectAuthLoading = (state: { auth: AuthState }) => state.auth.loading;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;
export const selectApplicationStatus = (state: { auth: AuthState }) => state.auth.applicationStatus;

export default authSlice.reducer;