import React, { useEffect, useRef } from 'react';
import { jwtDecode } from 'jwt-decode';
import { HomeModernIcon } from '@heroicons/react/24/outline';
import { GOOGLE_CLIENT_ID } from '../config';
import { User } from '../types';

interface LoginPageProps {
  onLoginSuccess: (user: User, token: string) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const signInButtonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window.google === 'undefined') {
      console.error("Google Identity Services script not loaded.");
      return;
    }

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (response: any) => {
        try {
            const userObject: any = jwtDecode(response.credential);
            const user: User = {
              name: userObject.name,
              email: userObject.email,
              picture: userObject.picture,
            };
            onLoginSuccess(user, response.credential);
        } catch (error) {
            console.error("Error decoding JWT or handling login:", error);
        }
      },
    });

    if (signInButtonRef.current) {
        window.google.accounts.id.renderButton(
            signInButtonRef.current,
            { theme: 'outline', size: 'large', type: 'standard', text: 'signin_with' }
        );
    }

  }, [onLoginSuccess]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-slate-900">
      <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-slate-800 rounded-2xl shadow-lg text-center">
        <div className="flex justify-center">
            <HomeModernIcon className="h-16 w-16 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            AI Interior Designer
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Sign in to transform your space with the power of AI.
          </p>
        </div>
        <div className="flex justify-center">
          <div id="signInDiv" ref={signInButtonRef}></div>
        </div>
        {GOOGLE_CLIENT_ID.startsWith('YOUR_') && (
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 text-left" role="alert">
                <p className="font-bold">Configuration Needed</p>
                <p className="text-sm">Google Sign-In is not configured. Please add your Google Client ID to the <code>config.ts</code> file to enable login.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;