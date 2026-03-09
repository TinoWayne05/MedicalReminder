import { Link, useLocation } from 'react-router-dom';
import { MdSpaceDashboard, MdAddCircle, MdHistory, MdLocalPharmacy } from 'react-icons/md';

export default function Navbar() {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <MdSpaceDashboard size={22} /> },
    { name: 'Add Med', path: '/add', icon: <MdAddCircle size={22} /> },
    { name: 'History', path: '/history', icon: <MdHistory size={22} /> },
  ];

  return (
    <nav className="glass-nav sticky top-0 z-50 transition-all duration-300 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-400 to-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-500/30 transform transition hover:scale-105">
              <MdLocalPharmacy size={26} />
            </div>
            <span className="font-extrabold text-2xl bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 tracking-tight">
              MedReminder
            </span>
          </div>

          <div className="hidden md:flex items-center space-x-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 ${isActive
                      ? 'bg-blue-50 text-blue-600 shadow-sm'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-blue-600'
                    }`}
                >
                  <span className={`${isActive ? 'scale-110' : ''} transition-transform duration-200`}>
                    {item.icon}
                  </span>
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile nav (bottom bar) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 glass-nav border-t border-white/50 z-50 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="flex justify-around items-center h-16 px-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center w-full h-full space-y-1 relative ${isActive ? 'text-blue-600' : 'text-slate-400 hover:text-blue-500'
                  }`}
              >
                {isActive && (
                  <div className="absolute top-0 w-8 h-1 bg-blue-600 rounded-b-full scale-in-center"></div>
                )}
                <span className={`transition-transform duration-300 ${isActive ? '-translate-y-1 scale-110' : ''}`}>
                  {item.icon}
                </span>
                <span className={`text-[10px] font-semibold transition-all duration-300 ${isActive ? '-translate-y-0.5 opacity-100' : 'opacity-80'}`}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
