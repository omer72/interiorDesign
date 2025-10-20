import React from 'react';
import { HomeModernIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { User } from '../types';

interface HeaderProps {
    user: User | null;
    onSignOut: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onSignOut }) => {
  return (
    <header className="bg-white/80 dark:bg-slate-800/80 shadow-md backdrop-blur-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <HomeModernIcon className="h-10 w-10 text-indigo-600" />
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              AI Interior Designer
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Instantly visualize your room in any style.
            </p>
          </div>
        </div>
        {user && (
            <div className="flex items-center space-x-4">
                <img src={user.picture} alt={user.name} className="h-10 w-10 rounded-full" referrerPolicy="no-referrer" />
                <div className="hidden sm:block">
                    <p className="font-semibold text-gray-800 dark:text-gray-100">{user.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                </div>
                <button
                    onClick={onSignOut}
                    className="flex items-center space-x-2 p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-white transition-colors"
                    aria-label="Sign out"
                >
                    <ArrowRightOnRectangleIcon className="h-6 w-6" />
                </button>
            </div>
        )}
      </div>
    </header>
  );
};

export default Header;