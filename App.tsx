
import React, { useState } from 'react';
import { 
  LayoutDashboard, Users, Activity, BarChart2, Settings, LogOut, 
  CandlestickChart, Languages, Shield, RefreshCw, Layers, Bell 
} from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { AccountManager } from './components/AccountManager';
import { StrategyManager } from './components/StrategyManager';
import { MarketData } from './components/MarketData';
import { Login } from './components/Login';
import { Language, UserSession } from './types';
import { t } from './utils/i18n';
import { Card } from './components/UIComponents';

// --- Sidebar Component ---
const SidebarItem: React.FC<{ 
  icon: React.ReactNode; 
  label: string; 
  active: boolean; 
  onClick: () => void;
  collapsed?: boolean;
  indent?: boolean;
}> = ({ icon, label, active, onClick, collapsed, indent }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-2.5 transition-colors rounded-lg mb-1 group relative text-sm
      ${active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
      ${indent && !collapsed ? 'pl-11' : ''}
    `}
  >
    {!indent && icon}
    {!collapsed && <span className="font-medium truncate">{label}</span>}
    {collapsed && !indent && (
        <div className="absolute left-14 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-50 pointer-events-none shadow-xl border border-slate-700">
            {label}
        </div>
    )}
  </button>
);

const SidebarGroup: React.FC<{ title: string, collapsed: boolean }> = ({ title, collapsed }) => (
    !collapsed ? (
        <div className="mt-6 mb-2 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
            {title}
        </div>
    ) : <div className="mt-6 border-t border-slate-800 mx-4" />
);

// Logs Component (Simple Placeholder for the "Alerts" page)
const AlertsPage: React.FC<{lang: Language}> = ({ lang }) => (
  <div className="space-y-4">
    <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">{t('logMonitor', lang)}</h2>
        <button className="px-3 py-1 bg-slate-800 text-slate-300 rounded hover:bg-slate-700">{t('clearLogs', lang)}</button>
    </div>
    <Card className="h-[600px] overflow-hidden flex flex-col p-0">
        <div className="bg-slate-900 border-b border-slate-800 p-3 grid grid-cols-12 text-xs font-bold text-slate-500 uppercase">
            <div className="col-span-2">{t('time', lang)}</div>
            <div className="col-span-1">{t('level', lang)}</div>
            <div className="col-span-9">{t('message', lang)}</div>
        </div>
        <div className="flex-1 overflow-y-auto p-3 font-mono text-sm space-y-2 custom-scrollbar">
            <div className="grid grid-cols-12 text-slate-300 border-b border-slate-800/50 pb-2">
                <div className="col-span-2 text-slate-500">10:42:05</div>
                <div className="col-span-1 text-emerald-400">INFO</div>
                <div className="col-span-9">Successfully placed limit order BUY 0.5 BTC @ 64,200</div>
            </div>
            <div className="grid grid-cols-12 text-slate-300 border-b border-slate-800/50 pb-2">
                <div className="col-span-2 text-slate-500">10:41:58</div>
                <div className="col-span-1 text-yellow-400">WARN</div>
                <div className="col-span-9">High latency detected on OKX API (450ms)</div>
            </div>
            <div className="grid grid-cols-12 text-slate-300 border-b border-slate-800/50 pb-2">
                <div className="col-span-2 text-slate-500">10:40:12</div>
                <div className="col-span-1 text-emerald-400">INFO</div>
                <div className="col-span-9">Strategy [Grid-BTC] rebalanced successfully</div>
            </div>
        </div>
    </Card>
  </div>
);

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [lang, setLang] = useState<Language>('zh'); 
  
  // Navigation State
  const [activeTab, setActiveTab] = useState('dashboard');
  const [collapsed, setCollapsed] = useState(false);

  const toggleLanguage = () => {
    setLang(prev => prev === 'en' ? 'zh' : 'en');
  };

  const getPageTitle = () => {
      if (activeTab === 'acc-login') return t('loginAccounts', lang);
      if (activeTab === 'acc-mm') return t('mmAccounts', lang);
      if (activeTab === 'acc-perm') return t('permissions', lang);
      if (activeTab === 'trade-kline') return t('klineMgmt', lang);
      if (activeTab === 'trade-depth') return t('depthMgmt', lang);
      if (activeTab === 'trade-wash') return t('washMgmt', lang);
      return t(activeTab as any, lang) || 'System';
  };

  const renderContent = () => {
    if (!currentUser) return null;

    switch (activeTab) {
      case 'dashboard': return <Dashboard lang={lang} />;
      
      // Account Management
      case 'acc-login': return <AccountManager lang={lang} activeTab="login" currentUser={currentUser} />;
      case 'acc-mm': return <AccountManager lang={lang} activeTab="mm" currentUser={currentUser} />;
      case 'acc-perm': return <AccountManager lang={lang} activeTab="perms" currentUser={currentUser} />;
      
      // Trading
      case 'trade-kline': return <StrategyManager lang={lang} activeTab="kline" />;
      case 'trade-depth': return <StrategyManager lang={lang} activeTab="depth" />;
      case 'trade-wash': return <StrategyManager lang={lang} activeTab="wash" />;
      
      // Data & Monitor
      case 'market': return <MarketData lang={lang} />;
      case 'alerts': return <AlertsPage lang={lang} />;
      
      default: return <Dashboard lang={lang} />;
    }
  };

  if (!currentUser) {
    return <Login onLogin={(user) => setCurrentUser(user)} />;
  }

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200">
      
      {/* Sidebar */}
      <aside className={`${collapsed ? 'w-20' : 'w-64'} bg-slate-900 border-r border-slate-800 flex flex-col transition-all duration-300 ease-in-out`}>
        <div className="p-6 flex items-center gap-3 border-b border-slate-800 h-16">
            <div className="w-8 h-8 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center font-bold text-white shrink-0">
                M
            </div>
            {!collapsed && (
                <div>
                    <h1 className="font-bold text-white tracking-tight">MarketMaker</h1>
                    <div className="text-xs text-indigo-400">Pro Terminal</div>
                </div>
            )}
        </div>

        <nav className="flex-1 p-3 overflow-y-auto custom-scrollbar">
            
            <SidebarGroup title={t('main', lang)} collapsed={collapsed} />
            <SidebarItem icon={<LayoutDashboard size={20} />} label={t('dashboard', lang)} active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} collapsed={collapsed} />
            
            <SidebarGroup title={t('acctMgmt', lang)} collapsed={collapsed} />
            <SidebarItem icon={<Users size={20} />} label={t('loginAccounts', lang)} active={activeTab === 'acc-login'} onClick={() => setActiveTab('acc-login')} collapsed={collapsed} />
            <SidebarItem icon={<Activity size={20} />} label={t('mmAccounts', lang)} active={activeTab === 'acc-mm'} onClick={() => setActiveTab('acc-mm')} collapsed={collapsed} />
            <SidebarItem icon={<Shield size={20} />} label={t('permissions', lang)} active={activeTab === 'acc-perm'} onClick={() => setActiveTab('acc-perm')} collapsed={collapsed} />

            <SidebarGroup title={t('tradeMgmt', lang)} collapsed={collapsed} />
            <SidebarItem icon={<CandlestickChart size={20} />} label={t('klineMgmt', lang)} active={activeTab === 'trade-kline'} onClick={() => setActiveTab('trade-kline')} collapsed={collapsed} />
            <SidebarItem icon={<Layers size={20} />} label={t('depthMgmt', lang)} active={activeTab === 'trade-depth'} onClick={() => setActiveTab('trade-depth')} collapsed={collapsed} />
            <SidebarItem icon={<RefreshCw size={20} />} label={t('washMgmt', lang)} active={activeTab === 'trade-wash'} onClick={() => setActiveTab('trade-wash')} collapsed={collapsed} />

            <SidebarGroup title={t('dataMon', lang)} collapsed={collapsed} />
            <SidebarItem icon={<BarChart2 size={20} />} label={t('market', lang)} active={activeTab === 'market'} onClick={() => setActiveTab('market')} collapsed={collapsed} />
            <SidebarItem icon={<Bell size={20} />} label={t('alerts', lang)} active={activeTab === 'alerts'} onClick={() => setActiveTab('alerts')} collapsed={collapsed} />
            
        </nav>

        <div className="p-4 border-t border-slate-800">
             <SidebarItem icon={<LogOut size={20} />} label={t('logout', lang)} active={false} onClick={() => setCurrentUser(null)} collapsed={collapsed} />
             <button 
                onClick={() => setCollapsed(!collapsed)} 
                className="w-full mt-2 text-xs text-slate-500 hover:text-white text-center py-2"
             >
                {collapsed ? '→' : `← ${t('collapse', lang)}`}
             </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-950">
        {/* Topbar */}
        <header className="h-16 bg-slate-900/50 backdrop-blur border-b border-slate-800 flex items-center justify-between px-6">
            <h2 className="text-lg font-semibold text-white capitalize">
               {getPageTitle()}
            </h2>
            <div className="flex items-center gap-4">
                
                {/* Language Switcher */}
                <button 
                  onClick={toggleLanguage}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700 text-sm text-slate-300"
                >
                  <Languages size={14} />
                  <span>{lang === 'en' ? 'English' : '中文'}</span>
                </button>

                <div className="hidden md:flex flex-col items-end mr-2">
                    <span className="text-xs text-slate-400">{t('serverTime', lang)}</span>
                    <span className="text-sm font-mono text-emerald-400">
                        {new Date().toISOString().split('T')[0]} <span className="text-white">{new Date().toLocaleTimeString()}</span>
                    </span>
                </div>
                <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-sm font-medium border-2 border-slate-800 ring-2 ring-slate-800 uppercase">
                    {currentUser.username.substring(0,2)}
                </div>
            </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar relative">
            {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
