import { Bell, Search, Menu } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function Topbar({ onMenuToggle }) {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-surface-200 flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-4">
        <button onClick={onMenuToggle} className="p-2 rounded-lg hover:bg-surface-100 lg:hidden">
          <Menu size={20} />
        </button>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-700" />
          <input
            type="text"
            placeholder="Search modules..."
            className="input-field pl-9 w-64 text-sm"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 rounded-lg hover:bg-surface-100 relative" aria-label="Notifications">
          <Bell size={20} className="text-surface-700" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-danger-500 rounded-full"></span>
        </button>

        {user && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-bold">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-surface-900">{user.name}</p>
              <p className="text-xs text-surface-700 capitalize">{user.role}</p>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
