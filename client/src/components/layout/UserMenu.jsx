import { ChevronDown, FolderKanban, LayoutDashboard, LogOut, Tags, UserRound } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router';
import toast from 'react-hot-toast';
import { logoutUser } from '../../features/auth/authSlice.js';
import Avatar from '../ui/Avatar.jsx';

const itemStyles = 'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-700 transition-colors hover:bg-brand-50 hover:text-brand-800 focus-visible:bg-brand-50 focus-visible:text-brand-800 focus-visible:outline-none';

export default function UserMenu({ user }) {
  const [open, setOpen] = useState(false);
  const [menuMounted, setMenuMounted] = useState(false);
  const ref = useRef(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      setMenuMounted(true);
      return undefined;
    }
    if (!menuMounted) return undefined;

    const timeout = window.setTimeout(() => setMenuMounted(false), 130);
    return () => window.clearTimeout(timeout);
  }, [open, menuMounted]);

  // Move focus into the menu when it opens, as the ARIA menu pattern expects.
  useEffect(() => {
    if (open && menuMounted) menuRef.current?.querySelector('[role="menuitem"]')?.focus();
  }, [open, menuMounted]);

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event) => {
      if (!ref.current?.contains(event.target)) setOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const onMenuKeyDown = (event) => {
    const items = [...(menuRef.current?.querySelectorAll('[role="menuitem"]') ?? [])];
    const index = items.indexOf(document.activeElement);
    const move = (next) => { event.preventDefault(); items[(next + items.length) % items.length]?.focus(); };
    if (event.key === 'ArrowDown') move(index + 1);
    else if (event.key === 'ArrowUp') move(index - 1);
    else if (event.key === 'Home') move(0);
    else if (event.key === 'End') move(items.length - 1);
    else if (event.key === 'Tab') setOpen(false);
  };

  const handleLogout = async () => {
    setOpen(false);
    await dispatch(logoutUser());
    toast.success('Signed out');
    navigate('/', { replace: true });
  };

  return (
    <div ref={ref} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' && !open) { event.preventDefault(); setOpen(true); }
        }}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Account menu for ${user.name}`}
        className="user-menu-trigger flex items-center gap-2 rounded-full p-0.5 pr-2.5 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/20"
      >
        <Avatar name={user.name} src={user.avatarUrl} size="sm" />
        <span className="hidden max-w-32 truncate text-sm font-medium sm:block" aria-hidden="true">{user.name}</span>
        <ChevronDown className={`hidden h-4 w-4 text-slate-400 transition-transform duration-300 sm:block ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>

      {menuMounted && (
        <div
          ref={menuRef}
          role="menu"
          aria-label="Account"
          aria-hidden={!open}
          inert={!open}
          onKeyDown={onMenuKeyDown}
          className={`user-dropdown absolute right-0 z-30 mt-2 w-64 rounded-2xl border border-line bg-white p-1.5 ${open ? 'is-open' : 'is-closing'}`}
        >
          <div className="mb-1 flex items-center gap-3 rounded-xl bg-gradient-to-br from-brand-50 to-white px-3 py-2.5">
            <Avatar name={user.name} src={user.avatarUrl} size="md" />
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">{user.name}</p>
              <p className="truncate text-xs text-slate-500">@{user.username}</p>
            </div>
          </div>
          <Link role="menuitem" to="/dashboard" onClick={() => setOpen(false)} className={itemStyles}>
            <LayoutDashboard className="h-4 w-4" aria-hidden="true" /> Dashboard
          </Link>
          <Link role="menuitem" to="/my-projects" onClick={() => setOpen(false)} className={itemStyles}>
            <FolderKanban className="h-4 w-4" aria-hidden="true" /> My projects
          </Link>
          <Link role="menuitem" to="/profile/edit" onClick={() => setOpen(false)} className={itemStyles}>
            <UserRound className="h-4 w-4" aria-hidden="true" /> Edit profile
          </Link>
          {user.role === 'admin' && (
            <Link role="menuitem" to="/admin/skills" onClick={() => setOpen(false)} className={itemStyles}>
              <Tags className="h-4 w-4" aria-hidden="true" /> Manage skills
            </Link>
          )}
          <div className="my-1 border-t border-line" />
          <button role="menuitem" type="button" onClick={handleLogout} className={`${itemStyles} hover:bg-rose-50 hover:text-rose-700 focus-visible:bg-rose-50 focus-visible:text-rose-700`}>
            <LogOut className="h-4 w-4" aria-hidden="true" /> Sign out
          </button>
        </div>
      )}
    </div>
  );
}
