import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, clearAuthError } from "../features/auth/authSlice";
import type { RootState, AppDispatch } from "../app/store";

interface LoginFormData {
  email: string;
  password: string;
}

function Login() {
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { isAuthenticated, loading, error } = useSelector(
    (state: RootState) => state.auth
  );

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    return () => {
      dispatch(clearAuthError());
    };
  }, [dispatch]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch(loginUser(formData));
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-100 px-4">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-lg">
        <h2 className="mb-6 text-3xl font-bold text-zinc-900">Login</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div style={{ marginBottom: "10px" }}>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              style={{ width: "100%", padding: "10px" }}
              className="mb-2 w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm outline-none transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-200"
            />
          </div>

          <div style={{ marginBottom: "10px" }}>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              style={{ width: "100%", padding: "10px" }}
              className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm outline-none transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-200"
            />
          </div>

          <button
            type="submit"
            style={{ padding: "10px 16px" }}
            className="mt-6 w-full rounded-xl bg-zinc-900 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <p className="mt-6 text-center text-sm text-zinc-600">
          Don&apos;t have an account?{" "}
          <Link
            to="/register"
            className="font-medium text-zinc-900 hover:underline"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;