import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { supabase } from "../../../lib/supabase";
import { Sparkles } from "lucide-react";
import { motion } from "motion/react";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F6FA] p-5">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 max-w-sm w-full"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#1d4ed8] flex items-center justify-center mb-4 shadow-lg shadow-blue-500/20">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">JastipFlow</h1>
          <p className="text-gray-400 text-sm mt-1">Masuk ke akun Anda</p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 p-3.5 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">Email</label>
            <input
              type="email"
              required
              className="w-full px-4 py-3 bg-[#F4F6FA] border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-800 transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">Password</label>
            <input
              type="password"
              required
              className="w-full px-4 py-3 bg-[#F4F6FA] border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-800 transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#2563EB] to-[#1d4ed8] text-white font-semibold py-3 px-4 rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-70 flex justify-center items-center h-12 mt-2"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
            ) : (
              "Masuk"
            )}
          </button>
        </form>
        <p className="mt-7 text-center text-sm text-gray-400">
          Belum punya akun?{" "}
          <Link to="/register" className="text-[#2563EB] font-semibold hover:underline">
            Daftar di sini
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
