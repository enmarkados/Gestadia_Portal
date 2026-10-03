import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User as UserIcon, Settings, ChevronDown } from 'lucide-react';
import { useAuth } from './AuthContext';
import { ActiveRoleSwitcher } from './app/ActiveRoleSwitcher';
import { BottomSheet } from './ui';

interface UserMenuProps {
  isCollapsed?: boolean;
}

export default function UserMenu({ isCollapsed = false }: UserMenuProps) {
  const { profile, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const navigate = useNavigate();

  const getInitials = (name: string) => {
    if (!name) return '';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  async function handleLogout() {
    if (isSigningOut) return;
    setIsSigningOut(true);
    setIsOpen(false);
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out from LIA', error);
    } finally {
      navigate('/login', { replace: true });
      setIsSigningOut(false);
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-label="Abrir menu de cuenta"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full bg-white hover:bg-brand-light transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-navy shadow-sm border border-brand-blue-light"
      >
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-navy text-white shrink-0">
          {profile?.name ? (
            <span className="text-xs font-bold tracking-wider">{getInitials(profile.name)}</span>
          ) : (
            <UserIcon className="w-4 h-4" />
          )}
        </div>
        {!isCollapsed && (
          <>
            <span className="text-sm font-medium text-brand-navy hidden sm:block truncate max-w-[120px]">
              {profile?.name?.split(' ')[0] || 'Usuario'}
            </span>
            <ChevronDown className={`w-4 h-4 text-brand-gray transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </>
        )}
      </button>

      {isOpen && (
        <BottomSheet
          title="Cuenta"
          description={profile?.email}
          onClose={() => setIsOpen(false)}
          className="md:max-w-md"
        >
          <div className="rounded-lg border border-brand-blue-light bg-brand-light/60 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-navy text-white">
                {profile?.name ? (
                  <span className="text-sm font-bold tracking-wider">{getInitials(profile.name)}</span>
                ) : (
                  <UserIcon className="h-5 w-5" />
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-brand-navy">{profile?.name || 'Usuario LIA'}</p>
                <p className="mt-0.5 truncate text-xs text-brand-gray">{profile?.email}</p>
              </div>
            </div>
          </div>

          <ActiveRoleSwitcher className="mt-4" onRoleChange={() => setIsOpen(false)} />

          <div className="mt-4 overflow-hidden rounded-lg border border-brand-blue-light bg-white">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                navigate('/profile');
              }}
              className="flex min-h-12 w-full items-center px-4 text-left text-sm font-medium text-brand-gray transition-colors hover:bg-brand-light hover:text-brand-navy"
            >
              <Settings className="w-4 h-4 mr-3" />
              Mi Perfil
            </button>

            <button
              type="button"
              onClick={handleLogout}
              disabled={isSigningOut}
              className="flex min-h-12 w-full items-center border-t border-brand-blue-light px-4 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
            >
              <LogOut className="w-4 h-4 mr-3" />
              Cerrar Sesión
            </button>
          </div>
        </BottomSheet>
      )}
    </div>
  );
}
