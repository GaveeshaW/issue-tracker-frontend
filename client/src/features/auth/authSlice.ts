import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "../../api/axios";

export interface User {
  firstname?: string;
  lastname?: string;
  email: string;
  _id?: string;
}

interface AuthResponse {
  token: string;
  user: User;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

interface LoginFormData {
  email: string;
  password: string;
}

interface RegisterFormData {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
}

const token = localStorage.getItem("token");
const user = localStorage.getItem("user");

const initialState: AuthState = {
  user: user ? JSON.parse(user) : null,
  token: token || null,
  isAuthenticated: !!token,
  loading: false,
  error: null,
};

export const registerUser = createAsyncThunk<
  AuthResponse,
  RegisterFormData,
  { rejectValue: string }
>("auth/registerUser", async (formData, thunkAPI) => {
  try {
    const res = await api.post<AuthResponse>("/auth/register", formData);

    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user", JSON.stringify(res.data.user));

    return res.data;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(
      error.response?.data?.message || "Registration failed"
    );
  }
});

export const loginUser = createAsyncThunk<
  AuthResponse,
  LoginFormData,
  { rejectValue: string }
>("auth/loginUser", async (formData, thunkAPI) => {
  try {
    const res = await api.post<AuthResponse>("/auth/login", formData);

    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user", JSON.stringify(res.data.user));

    return res.data;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(
      error.response?.data?.message || "Login failed"
    );
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
    },
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        registerUser.fulfilled,
        (state, action: PayloadAction<AuthResponse>) => {
          state.loading = false;
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.isAuthenticated = true;
        }
      )
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Registration failed";
      })
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        loginUser.fulfilled,
        (state, action: PayloadAction<AuthResponse>) => {
          state.loading = false;
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.isAuthenticated = true;
        }
      )
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Login failed";
      });
  },
});

export const { logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;