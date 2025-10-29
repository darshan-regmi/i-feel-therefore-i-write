/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  linkWithPopup,
} from "firebase/auth";
import { EmailAuthProvider, linkWithCredential } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { migrateLikes } from "@/utils/firebaseUtils";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const currentUser = auth.currentUser;
      let newUser = null;

      if (!isLogin) {
        if (currentUser && currentUser.isAnonymous) {
          const credential = EmailAuthProvider.credential(email, password);
          const result = await linkWithCredential(currentUser, credential);

          await migrateLikes(currentUser.uid, result.user.uid);
          newUser = result.user;
        } else {
          const result = await createUserWithEmailAndPassword(
            auth,
            email,
            password
          );
          newUser = result.user;

          if (currentUser?.isAnonymous) {
            await migrateLikes(currentUser.uid, newUser.uid);
          }
        }
      } else {
        const result = await signInWithEmailAndPassword(auth, email, password);
        newUser = result.user;

        if (currentUser?.isAnonymous && currentUser.uid !== newUser.uid) {
          await migrateLikes(currentUser.uid, newUser.uid);
        }
      }

      router.push("/liked-poem");
    } catch (error: any) {
      setError(getErrorMessage(error.code));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError("");

    try {
      const provider = new GoogleAuthProvider();
      const currentUser = auth.currentUser;

      if (currentUser?.isAnonymous) {
        try {
          const result = await linkWithPopup(currentUser, provider);
          await migrateLikes(currentUser.uid, result.user.uid);
          router.push("/liked-poem");
        } catch (linkError: any) {
          if (linkError.code === "auth/credential-already-in-use") {
            const result = await signInWithPopup(auth, provider);
            await migrateLikes(currentUser.uid, result.user.uid);
            router.push("/liked-poem");
          } else {
            throw linkError;
          }
        }
      } else {
        const result = await signInWithPopup(auth, provider);

        if (currentUser?.isAnonymous && currentUser.uid !== result.user.uid) {
          await migrateLikes(currentUser.uid, result.user.uid);
        }

        router.push("/liked-poem");
      }
    } catch (error: any) {
      console.error(error);
      setError(getErrorMessage(error.code));
    } finally {
      setLoading(false);
    }
  };

  const getErrorMessage = (errorCode: string) => {
    switch (errorCode) {
      case "auth/user-not-found":
        return "no home found at this address";
      case "auth/wrong-password":
        return "the key doesn't fit this lock";
      case "auth/email-already-in-use":
        return "this address already has a home here";
      case "auth/weak-password":
        return "your key needs more strength";
      case "auth/invalid-email":
        return "this doesn't look like an address";
      default:
        return "try again — the key and the address don't match";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-6 bg-gradient-to-br from-gray-50 via-white to-slate-50 relative overflow-hidden">
      {/* Subtle background decorations */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-gray-100/20 via-transparent to-transparent pointer-events-none"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-slate-100/20 via-transparent to-transparent pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Decorative elements above card */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="h-px w-12 bg-gradient-to-r from-transparent to-gray-300"></div>
          <div className="w-1 h-1 rounded-full bg-gray-400"></div>
          <div className="h-px w-12 bg-gradient-to-l from-transparent to-gray-300"></div>
        </div>

        <div className="bg-white border border-gray-200 shadow-xl rounded-3xl p-8 sm:p-10 space-y-6 animate-fade-in">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-serif text-gray-900 tracking-tight">
              i feel, therefore i write
            </h1>
            <p className="text-sm font-light italic text-gray-500">
              {isLogin ? "welcome back home" : "let's make you a home here"}
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-50 text-red-600 border border-red-200 rounded-xl p-4 text-center text-sm italic animate-shake">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleEmailAuth} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                disabled={loading}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent focus:bg-white transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent focus:bg-white transition-all duration-200 pr-12 disabled:opacity-60 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  tabIndex={-1}
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-gray-900 text-white font-medium rounded-xl shadow-md hover:shadow-lg hover:bg-gray-800 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              disabled={loading}
            >
              {loading
                ? "Opening doors..."
                : isLogin
                ? "Enter Your Home"
                : "Create Your Home"}
            </button>
          </form>

          {/* Divider */}
          <div className="relative text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <span className="relative bg-white px-4 text-sm italic text-gray-400">
              or
            </span>
          </div>

          {/* Google Sign In */}
          <button
            onClick={handleGoogleSignIn}
            className="w-full py-3.5 bg-white text-gray-700 border border-gray-300 rounded-xl shadow-sm hover:shadow-md hover:bg-gray-50 hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-3 font-medium disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            disabled={loading}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>

          {/* Toggle login/signup */}
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
              }}
              className="text-gray-500 hover:text-gray-900 italic text-sm transition-colors duration-200 disabled:opacity-60"
              disabled={loading}
            >
              {isLogin ? "need an account?" : "already have an account?"}
            </button>
          </div>

          {/* Footer quote */}
          <div className="text-center text-xs italic text-gray-400 border-t border-gray-100 pt-6 mt-6">
            {isLogin
              ? '"words have no single fixed meaning"'
              : '"every poet was first a reader"'}
          </div>
        </div>

        {/* Decorative elements below card */}
        <div className="flex items-center justify-center gap-3 mt-8">
          <div className="h-px w-12 bg-gradient-to-r from-transparent to-gray-300"></div>
          <div className="w-1 h-1 rounded-full bg-gray-400"></div>
          <div className="h-px w-12 bg-gradient-to-l from-transparent to-gray-300"></div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
        .animate-shake {
          animation: shake 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}