import { useAuthStore } from '../../store/authStore';

export default function Header({ title }) {
  const user = useAuthStore(s => s.user);
  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
      <h1 className="text-xl font-semibold text-slate-800">{title}</h1>
      <div className="flex items-center gap-3">
        <span className="text-sm text-slate-500">Welcome, {user?.first_name}</span>
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
          {user?.first_name?.[0]}
        </div>
      </div>
    </header>
  );
}
