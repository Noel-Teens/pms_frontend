import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { toast } from 'sonner';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup } from 'firebase/auth';
import { authAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login, googleLoginSuccess } = useAuth();
  const navigate = useNavigate();

  // 🔑 Handle normal login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(username, password);
      // AuthProvider handles navigation
    } catch (error) {
      toast.error('Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  // 🔑 Handle Google login
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken(true);

      const response = await authAPI.googleLogin(idToken);

      localStorage.setItem('access', response.data.access);
      localStorage.setItem('refresh', response.data.refresh);

      await googleLoginSuccess();
      toast.success('Logged in with Google!');
    } catch (error) {
      console.error('Google login error:', error);
      toast.error('Google login failed.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* 🔹 Top Bar */}
      <header className="w-full bg-[#0A2647] text-white shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-center mr-280">
          <h1 className="text-2xl text-[#FF6B00] font-bold tracking-wide">
            Paper Management System
          </h1>
        </div>
      </header>

      {/* 🔹 Login Card */}
      <main className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              Sign in to your Account
            </CardTitle>
            <CardDescription className="text-center">
              Enter your credentials or use Google login
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium">
                  Username
                </label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  placeholder="Enter your username"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-[#0A2647] hover:bg-[#FF6B00] text-white"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>

            {/* Google login button */}
            <div className="mt-4">
              <Button
                onClick={handleGoogleLogin}
                variant="outline"
                className="w-full border-[#0A2647] text-[#0A2647] hover:bg-[#FF6B00] hover:text-white"
              >
                Continue with Google
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-gray-600">
              Don&apos;t have an account?{' '}
              <Link
                to="/register"
                className="font-medium text-[#FF6B00] hover:underline"
              >
                Register here
              </Link>
            </p>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
};

export default Login;
