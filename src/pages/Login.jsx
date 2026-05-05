import { useState } from "react";
import axios from "axios";
import logo from "../assets/logo.jpg";

export default function Login() {
  const API_BASE = "/api";
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/login`, null, {
        params: {
          username,
          password
        }
      });

      localStorage.setItem("token", res.data.access_token);
      if (res.data.user_id) {
        localStorage.setItem("user_id", res.data.user_id);
      }
      window.location.href = "/";
    } catch (err) {
      alert("Login failed: " + (err.response?.data?.detail || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f2e8cf] p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-black/5">
        <div className="bg-[#1a1a1a] p-12 text-center flex flex-col items-center">
          <img src={logo} alt="The Bottle Club Logo" className="w-24 h-24 object-contain mb-6 rounded-full bg-white p-2" />
          <h2 className="text-4xl font-serif italic text-white">The Bottle Club</h2>
          <p className="text-gray-400 mt-2 uppercase tracking-[0.2em] text-[10px] font-bold">Exclusive POS Access</p>
        </div>
        
        <form onSubmit={handleLogin} className="p-10 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Username</label>
            <input 
              type="text"
              placeholder="Username" 
              className="w-full px-5 py-4 bg-gray-50 border-b border-gray-200 focus:border-black transition-all outline-none font-serif"
              onChange={e => setUsername(e.target.value)} 
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Password</label>
            <input 
              type="password"
              placeholder="Password" 
              className="w-full px-5 py-4 bg-gray-50 border-b border-gray-200 focus:border-black transition-all outline-none font-serif"
              onChange={e => setPassword(e.target.value)} 
              required
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className={`w-full py-5 text-sm uppercase tracking-[0.4em] font-black transition-all shadow-xl active:scale-95 ${
              loading ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#1a1a1a] text-white hover:bg-black'
            }`}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="p-6 bg-gray-50 text-center text-gray-400 text-[9px] uppercase tracking-[0.2em]">
          &copy; {new Date().getFullYear()} The Bottle Club &bull; Premium POS
        </div>
      </div>
    </div>
  );
}