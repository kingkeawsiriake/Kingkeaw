import { useState } from 'react';
import { 
  Wallet, 
  LogOut, 
  LogIn, 
  CloudCheck, 
  Sparkles,
  User as UserIcon,
  ShieldCheck
} from 'lucide-react';
import { auth, googleProvider, signInWithPopup, signOut, type User } from '../firebase.ts';

interface NavbarProps {
  user: User | null;
  loadingAuth: boolean;
}

export function Navbar({ user, loadingAuth }: NavbarProps) {
  const [signingIn, setSigningIn] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSignIn = async () => {
    try {
      setSigningIn(true);
      setErrorMsg(null);
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error('Sign in failed:', err);
      if (err.code !== 'auth/popup-closed-by-user') {
        setErrorMsg(err.message || 'ไม่สามารถเข้าสู่ระบบด้วย Google ได้');
      }
    } finally {
      setSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-sm shadow-indigo-200">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg text-slate-900 tracking-tight">kingkeaw project</span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                  <ShieldCheck className="w-3 h-3 mr-1 text-indigo-600" /> Firebase Cloud
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">ระบบจัดการรายรับ - รายจ่าย และสรุปผลประจำเดือน</p>
            </div>
          </div>

          {/* User Auth Section */}
          <div className="flex items-center space-x-3">
            {errorMsg && (
              <span className="text-xs text-rose-600 bg-rose-50 px-2 py-1 rounded hidden md:inline-block">
                {errorMsg}
              </span>
            )}

            {loadingAuth ? (
              <div className="h-9 w-28 bg-slate-100 animate-pulse rounded-lg" />
            ) : user ? (
              <div className="flex items-center space-x-2.5">
                <div className="flex items-center space-x-2 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-full py-1 pl-1 pr-3 transition">
                  {user.photoURL ? (
                    <img 
                      src={user.photoURL} 
                      alt={user.displayName || 'User'} 
                      className="w-7 h-7 rounded-full object-cover border border-indigo-200"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-semibold">
                      {user.displayName ? user.displayName.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
                    </div>
                  )}
                  <div className="text-left hidden sm:block">
                    <p className="text-xs font-medium text-slate-800 leading-tight truncate max-w-[130px]">
                      {user.displayName || 'สมาชิก'}
                    </p>
                    <p className="text-[10px] text-slate-500 leading-tight truncate max-w-[130px]">
                      {user.email}
                    </p>
                  </div>
                </div>

                <button
                  id="signout-btn"
                  onClick={handleSignOut}
                  title="ออกจากระบบ"
                  className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                id="signin-btn"
                onClick={handleSignIn}
                disabled={signingIn}
                className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 shadow-sm transition disabled:opacity-70 cursor-pointer"
              >
                {/* Google Icon */}
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12 5c1.54 0 2.93.53 4.02 1.57l3.01-3.01C17.21 1.76 14.81 1 12 1 7.54 1 3.73 3.53 1.84 7.23l3.65 2.83C6.38 7.42 8.94 5 12 5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58l3.71 2.88c2.16-1.99 3.41-4.93 3.41-8.7z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.49 14.94c-.24-.71-.38-1.48-.38-2.28 0-.8.14-1.57.38-2.28L1.84 7.55C1.04 9.15.58 10.95.58 12.84s.46 3.69 1.26 5.29l3.65-2.83z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23.68c3.24 0 5.95-1.08 7.93-2.91l-3.71-2.88c-1.07.72-2.45 1.16-4.22 1.16-3.06 0-5.62-2.42-6.51-5.69L1.84 16.2C3.73 19.9 7.54 22.44 12 22.44z"
                  />
                </svg>
                {signingIn ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบด้วย Gmail'}
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
