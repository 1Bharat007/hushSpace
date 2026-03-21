import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { LogIn, UserPlus, Mail, Lock, Eye, EyeOff, X, Chrome } from "lucide-react";

const AuthModal = () => {
  const { isAuthModalOpen, closeAuthModal, login, signup, signInWithGoogle } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password);
      }
      closeAuthModal();
    } catch (err) {
      setError(err.message.replace("Firebase: ", ""));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);
    try {
      await signInWithGoogle();
      closeAuthModal();
    } catch (err) {
      setError(err.message.replace("Firebase: ", ""));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeAuthModal}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-md glass-card p-8 md:p-10 rounded-3xl shadow-2xl overflow-hidden ring-1 ring-white/10"
        >
          {/* Close Button */}
          <button 
            onClick={closeAuthModal}
            className="absolute top-6 right-6 p-2 text-text-dim hover:text-white transition-colors"
          >
            <X size={20} />
          </button>

          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-white mb-2 tracking-tight">
              {isLogin ? "Welcome Back" : "Create Account"}
            </h2>
            <p className="text-text-dim text-sm font-medium">
              {isLogin 
                ? "Sign in to access your sanctuary" 
                : "Join to start your personal journey"}
            </p>
          </div>

          <div className="space-y-4 mb-8">
            <button
               onClick={handleGoogleSignIn}
               disabled={loading}
               className="w-full bg-white text-brand-primary font-bold py-3.5 rounded-xl flex items-center justify-center gap-3 hover:bg-slate-100 transition-all active:scale-[0.98] shadow-lg shadow-black/10"
            >
               <Chrome size={20} />
               <span>Continue with Google</span>
            </button>
            
            <div className="flex items-center gap-4 text-white/5 px-2">
               <div className="h-px bg-white/10 flex-1"></div>
               <span className="text-[10px] uppercase tracking-widest font-black text-white/20">or use email</span>
               <div className="h-px bg-white/10 flex-1"></div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-dim group-focus-within:text-brand-accent transition-colors" size={18} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/5 text-white rounded-xl py-3.5 pl-12 pr-4 outline-none focus:border-brand-accent/50 focus:ring-1 focus:ring-brand-accent/20 transition-all text-sm font-medium"
                  placeholder="Email"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-dim group-focus-within:text-brand-accent transition-colors" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/5 text-white rounded-xl py-3.5 pl-12 pr-12 outline-none focus:border-brand-accent/50 focus:ring-1 focus:ring-brand-accent/20 transition-all text-sm font-medium"
                  placeholder="Password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-dim hover:text-white"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-red-400 text-xs px-2 text-center bg-red-500/10 py-2.5 rounded-xl font-bold">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-accent hover:bg-brand-accent-hover text-white font-bold py-4 rounded-xl shadow-xl shadow-brand-accent/20 transition-all active:scale-[0.98] disabled:opacity-70 mt-2 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : isLogin ? (
                <>
                  <LogIn size={20} />
                  <span>Login</span>
                </>
              ) : (
                <>
                  <UserPlus size={20} />
                  <span>Create Sanctuary</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-white/5 pt-6">
            <p className="text-text-dim text-sm font-medium">
              {isLogin ? "New to Private Place?" : "Already have an account?"}{" "}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-brand-accent hover:text-brand-accent-hover font-bold transition-colors"
              >
                {isLogin ? "Join Now" : "Login"}
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AuthModal;
