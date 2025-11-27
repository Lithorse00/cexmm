


import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Select, Badge, Modal, Pagination } from './UIComponents';
import { Exchange, AccountRole, Language, LoginAccount, MMAccount, UserSession, Role, TransactionType } from '../types';
import { Trash2, Edit, Plus, Lock, CheckSquare, Square, Search, RefreshCw, AlertTriangle, Shield, UserCog, Check, Eye, EyeOff } from 'lucide-react';
import { t } from '../utils/i18n';

// --- Mock Data ---
const MOCK_LOGIN_ACCOUNTS: LoginAccount[] = [
  { id: 'u1', account: 'admin', password: '***', googleSecret: 'JBSWY3DPEHPK3PXP', role: 'Admin', status: 'normal', createTime: '2023-01-01 10:00:00', loginTime: '2023-10-27 10:42:00' },
  { id: 'u2', account: 'trader01', password: '***', googleSecret: 'KRSXG5CTMVRXEZLU', role: 'Operator', status: 'normal', createTime: '2023-02-15 14:20:00', loginTime: '2023-10-26 15:30:00' },
  { id: 'u3', account: 'risk_manager', password: '***', googleSecret: 'MNQW23DZEJRW4ZLE', role: 'Risk', status: 'forbidden', createTime: '2023-03-10 09:00:00', loginTime: '2023-10-25 09:12:00' },
  { id: 'u4', account: 'finance01', password: '***', googleSecret: 'ABXD23DPEHPK3PXP', role: 'Finance', status: 'normal', createTime: '2023-05-01 11:00:00', loginTime: '2023-10-20 10:42:00' },
  { id: 'u5', account: 'bot_monitor', password: '***', googleSecret: 'ZZZZY3DPEHPK3PXP', role: 'Operator', status: 'normal', createTime: '2023-06-01 12:00:00', loginTime: '2023-10-27 08:42:00' },
];

const MOCK_MM_ACCOUNTS: MMAccount[] = [
  { id: 'm1', uid: '8839201', name: 'Binance Spot Main', exchange: Exchange.Binance, apiKey: 'vm...8s9d', secretKey: '***', ipWhitelist: '192.168.1.1', transactionTypes: ['Spot'], tradingPairs: ['BTC/USDT', 'ETH/USDT'], partition: 'Zone A', modificationTime: '2023-10-25 14:00' },
  { id: 'm2', uid: '1239944', name: 'OKX Hedge Futures', exchange: Exchange.OKX, apiKey: 'ak...90s2', secretKey: '***', ipWhitelist: '192.168.1.2', transactionTypes: ['Contract'], tradingPairs: ['BTC-USDT-SWAP'], partition: 'Zone B', leverage: 20, modificationTime: '2023-10-26 09:30' },
  { id: 'm3', uid: '5540021', name: 'Bybit Market Maker', exchange: Exchange.Bybit, apiKey: 'bb...77d1', secretKey: '***', ipWhitelist: '10.0.0.5', transactionTypes: ['Spot', 'Contract'], tradingPairs: ['SOL/USDT'], partition: 'Zone A', leverage: 10, modificationTime: '2023-10-27 10:15' },
];

const MOCK_ROLES: Role[] = [
    { 
        id: 'r1', name: 'Admin', description: 'Super User', 
        allowedPartitions: ['Zone A', 'Zone B', 'Zone C'], 
        allowedModules: ['trade-kline', 'trade-depth', 'trade-wash', 'market', 'alerts'],
        allowedExchanges: Object.values(Exchange),
        allowedTransactionTypes: Object.values(TransactionType)
    },
    { 
        id: 'r2', name: 'Operator', description: 'Standard Trader', 
        allowedPartitions: ['Zone A'], 
        allowedModules: ['trade-kline', 'trade-depth', 'market'],
        allowedExchanges: [Exchange.Binance, Exchange.Bybit],
        allowedTransactionTypes: [TransactionType.Spot]
    },
    { 
        id: 'r3', name: 'Risk', description: 'Risk Control', 
        allowedPartitions: ['Zone A', 'Zone B'], 
        allowedModules: ['market', 'alerts'],
        allowedExchanges: Object.values(Exchange),
        allowedTransactionTypes: []
    }
];

// Helper for clickable hidden fields
const SecretCell: React.FC<{ value: string; placeholder?: string }> = ({ value, placeholder = "******" }) => {
    const [revealed, setRevealed] = useState(false);
    return (
        <div 
            className="flex items-center gap-2 cursor-pointer group" 
            onClick={() => setRevealed(!revealed)}
        >
            <span className={`font-mono text-xs ${revealed ? 'text-white' : 'text-slate-500'}`}>
                {revealed ? value : placeholder}
            </span>
            <div className="text-slate-600 group-hover:text-slate-400">
                {revealed ? <EyeOff size={14} /> : <Eye size={14} />}
            </div>
        </div>
    );
};

interface AccountManagerProps {
    lang: Language;
    activeTab?: string;
    currentUser: UserSession;
}

export const AccountManager: React.FC<AccountManagerProps> = ({ lang, activeTab = 'login', currentUser }) => {
  const isAdmin = currentUser.role === 'Admin' || currentUser.username === 'admin';

  // --- STATE: Login Accounts ---
  const [loginAccounts, setLoginAccounts] = useState<LoginAccount[]>(MOCK_LOGIN_ACCOUNTS);
  const [loginSelectedIds, setLoginSelectedIds] = useState<Set<string>>(new Set());
  const [isLoginEditModalOpen, setIsLoginEditModalOpen] = useState(false);
  const [isLoginAddModalOpen, setIsLoginAddModalOpen] = useState(false);
  const [currentLoginAccount, setCurrentLoginAccount] = useState<Partial<LoginAccount>>({});
  
  // Login Search State
  const [loginSearch, setLoginSearch] = useState({ name: '', role: '', status: '', startDate: '', endDate: '' });
  const [loginPage, setLoginPage] = useState(1);
  const [loginItemsPerPage, setLoginItemsPerPage] = useState(5);

  // --- STATE: MM Accounts ---
  const [mmAccounts, setMmAccounts] = useState<MMAccount[]>(MOCK_MM_ACCOUNTS);
  const [mmSelectedIds, setMmSelectedIds] = useState<Set<string>>(new Set());
  const [isMmEditModalOpen, setIsMmEditModalOpen] = useState(false);
  const [isMmAddModalOpen, setIsMmAddModalOpen] = useState(false);
  const [currentMmAccount, setCurrentMmAccount] = useState<Partial<MMAccount>>({});

  // MM Search State
  const [mmSearch, setMmSearch] = useState({ uid: '', exchange: '', pair: '', type: '', name: '', partition: '' });
  const [mmPage, setMmPage] = useState(1);

  // --- STATE: Roles/Permissions ---
  const [roles, setRoles] = useState<Role[]>(MOCK_ROLES);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(MOCK_ROLES[0].id);
  const [isRoleAddModalOpen, setIsRoleAddModalOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');

  // Derived Partitions from MM Accounts
  const allPartitions = Array.from(new Set(mmAccounts.map(a => a.partition))).filter(Boolean).sort();

  // --- HANDLERS: Login Accounts ---
  
  const filteredLoginAccounts = loginAccounts.filter(acc => {
      // Date Logic: Filter by Login Time
      const accLoginDate = acc.loginTime.split(' ')[0];
      const isAfterStart = loginSearch.startDate ? accLoginDate >= loginSearch.startDate : true;
      const isBeforeEnd = loginSearch.endDate ? accLoginDate <= loginSearch.endDate : true;

      return (
          (loginSearch.name === '' || acc.account.toLowerCase().includes(loginSearch.name.toLowerCase())) &&
          (loginSearch.role === '' || acc.role === loginSearch.role) &&
          (loginSearch.status === '' || acc.status === loginSearch.status) &&
          isAfterStart && isBeforeEnd
      );
  });

  const paginatedLoginAccounts = filteredLoginAccounts.slice((loginPage - 1) * loginItemsPerPage, loginPage * loginItemsPerPage);

  const handleLoginSelectAll = () => {
    if (loginSelectedIds.size === paginatedLoginAccounts.length) {
        setLoginSelectedIds(new Set());
    } else {
        setLoginSelectedIds(new Set(paginatedLoginAccounts.map(a => a.id)));
    }
  };

  const handleLoginSelectOne = (id: string) => {
    const newSet = new Set(loginSelectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setLoginSelectedIds(newSet);
  };

  const handleLoginStatusToggle = (id: string) => {
    setLoginAccounts(prev => prev.map(acc => 
      acc.id === id ? { ...acc, status: acc.status === 'normal' ? 'forbidden' : 'normal' } : acc
    ));
    // Simulate instant refresh update
  };

  const handleLoginBatchDelete = () => {
    if (loginSelectedIds.size === 0) {
        window.alert(t('selectAccountTip', lang));
        return;
    }

    const selectedAccounts = loginAccounts.filter(acc => loginSelectedIds.has(acc.id));
    const hasNormal = selectedAccounts.some(acc => acc.status === 'normal');

    if (hasNormal) {
        window.alert(t('deleteNormalError', lang));
        return;
    }

    if (confirm(t('confirmDeleteMsg', lang))) {
      setLoginAccounts(prev => prev.filter(acc => !loginSelectedIds.has(acc.id)));
      setLoginSelectedIds(new Set());
      window.alert(t('deleteSuccess', lang));
    }
  };

  const handleLoginSingleDelete = (id: string) => {
      const acc = loginAccounts.find(a => a.id === id);
      if (acc && acc.status === 'normal') {
          window.alert(t('deleteNormalError', lang));
          return;
      }

      if(confirm(t('confirmDeleteMsg', lang))) {
          setLoginAccounts(prev => prev.filter(a => a.id !== id));
          if(loginSelectedIds.has(id)) {
              const newSet = new Set(loginSelectedIds);
              newSet.delete(id);
              setLoginSelectedIds(newSet);
          }
          window.alert(t('deleteSuccess', lang));
      }
  };

  const saveNewLoginAccount = () => {
    if (!currentLoginAccount.account || !currentLoginAccount.password || !currentLoginAccount.role) {
        window.alert(t('fillRequired', lang));
        return;
    }
    const newId = `u${Date.now()}`;
    const generatedSecret = 'GEN' + Math.random().toString(36).substring(2, 10).toUpperCase() + 'KEY';
    
    const newAcc: LoginAccount = {
      id: newId,
      account: currentLoginAccount.account,
      password: currentLoginAccount.password, 
      googleSecret: generatedSecret, // Auto generate
      role: currentLoginAccount.role || 'Operator',
      status: 'normal',
      createTime: new Date().toLocaleString('sv').replace('T', ' '),
      loginTime: '-'
    };
    setLoginAccounts([...loginAccounts, newAcc]);
    setIsLoginAddModalOpen(false);
    window.alert(t('createSuccess', lang));
  };

  const saveEditLoginAccount = () => {
    if (!currentLoginAccount.account || !currentLoginAccount.role) {
        window.alert(t('fillRequired', lang));
        return;
    }
    setLoginAccounts(prev => prev.map(acc => {
      if (acc.id === currentLoginAccount.id) {
        let secret = currentLoginAccount.googleSecret;
        if (!secret || secret.trim() === '') {
            secret = 'RESET' + Math.floor(Math.random() * 100000);
        }
        return { 
            ...acc, 
            account: currentLoginAccount.account || acc.account,
            password: currentLoginAccount.password || acc.password,
            googleSecret: secret,
            role: currentLoginAccount.role || acc.role
        };
      }
      return acc;
    }));
    setIsLoginEditModalOpen(false);
    window.alert(t('opSuccess', lang));
  };


  // --- HANDLERS: MM Accounts ---

  const filteredMmAccounts = mmAccounts.filter(acc => {
      return (
          (mmSearch.uid === '' || acc.uid.includes(mmSearch.uid)) &&
          (mmSearch.exchange === '' || acc.exchange === mmSearch.exchange) &&
          (mmSearch.pair === '' || acc.tradingPairs.some(p => p.toLowerCase().includes(mmSearch.pair.toLowerCase()))) &&
          (mmSearch.type === '' || acc.transactionTypes.includes(mmSearch.type)) &&
          (mmSearch.name === '' || acc.name.toLowerCase().includes(mmSearch.name.toLowerCase())) &&
          (mmSearch.partition === '' || acc.partition.includes(mmSearch.partition))
      );
  });

  const paginatedMmAccounts = filteredMmAccounts.slice((mmPage - 1) * 5, mmPage * 5); // Fixed 5 for MM for now

  const handleMmSelectAll = () => {
      if (mmSelectedIds.size === paginatedMmAccounts.length) {
          setMmSelectedIds(new Set());
      } else {
          setMmSelectedIds(new Set(paginatedMmAccounts.map(a => a.id)));
      }
  };

  const handleMmSelectOne = (id: string) => {
      const newSet = new Set(mmSelectedIds);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      setMmSelectedIds(newSet);
  };

  const handleMmDelete = () => {
      if (!isAdmin) return;
      if (confirm(t('confirmDeleteMsg', lang))) {
          setMmAccounts(prev => prev.filter(acc => !mmSelectedIds.has(acc.id)));
          setMmSelectedIds(new Set());
          window.alert(t('opSuccess', lang));
      }
  };

  const saveNewMmAccount = () => {
      if (!currentMmAccount.name || !currentMmAccount.apiKey) return;
      const newAcc: MMAccount = {
          id: `m${Date.now()}`,
          uid: Math.floor(Math.random()*1000000).toString(),
          name: currentMmAccount.name,
          apiKey: currentMmAccount.apiKey, 
          secretKey: currentMmAccount.secretKey || '***',
          passphrase: currentMmAccount.passphrase,
          exchange: currentMmAccount.exchange || Exchange.Binance,
          ipWhitelist: currentMmAccount.ipWhitelist || '',
          transactionTypes: currentMmAccount.transactionTypes || [],
          tradingPairs: currentMmAccount.tradingPairs || [],
          partition: currentMmAccount.partition || 'Default',
          leverage: currentMmAccount.transactionTypes?.includes('Contract') ? currentMmAccount.leverage : undefined,
          modificationTime: new Date().toLocaleString()
      };
      setMmAccounts([...mmAccounts, newAcc]);
      setIsMmAddModalOpen(false);
      window.alert(t('opSuccess', lang));
  };

  const saveEditMmAccount = () => {
      setMmAccounts(prev => prev.map(acc => {
          if (acc.id === currentMmAccount.id) {
              return {
                  ...acc,
                  name: currentMmAccount.name || acc.name,
                  exchange: currentMmAccount.exchange || acc.exchange,
                  transactionTypes: currentMmAccount.transactionTypes || acc.transactionTypes,
                  tradingPairs: currentMmAccount.tradingPairs || acc.tradingPairs,
                  partition: currentMmAccount.partition || acc.partition,
                  leverage: currentMmAccount.transactionTypes?.includes('Contract') ? currentMmAccount.leverage : undefined,
                  ipWhitelist: currentMmAccount.ipWhitelist || acc.ipWhitelist,
                  modificationTime: new Date().toLocaleString()
              };
          }
          return acc;
      }));
      setIsMmEditModalOpen(false);
      window.alert(t('opSuccess', lang));
  };

  const openMmAddModal = () => {
      if(!isAdmin) return;
      setCurrentMmAccount({ transactionTypes: [], tradingPairs: [] });
      setIsMmAddModalOpen(true);
  };

  const openMmEditModal = (acc: MMAccount) => {
      if(!isAdmin) return;
      setCurrentMmAccount({ ...acc });
      setIsMmEditModalOpen(true);
  };

  const toggleMmTransactionType = (type: string) => {
      const types = currentMmAccount.transactionTypes || [];
      if (types.includes(type)) {
          setCurrentMmAccount({ ...currentMmAccount, transactionTypes: types.filter(t => t !== type) });
      } else {
          setCurrentMmAccount({ ...currentMmAccount, transactionTypes: [...types, type] });
      }
  };

  // --- HANDLERS: Role Management ---
  const handleRoleSelect = (roleId: string) => {
      setSelectedRoleId(roleId);
  };

  const createRole = () => {
      if (!newRoleName) return;
      const newRole: Role = {
          id: `r${Date.now()}`,
          name: newRoleName,
          description: 'Custom Role',
          allowedPartitions: [],
          allowedModules: [],
          allowedExchanges: [],
          allowedTransactionTypes: []
      };
      setRoles([...roles, newRole]);
      setSelectedRoleId(newRole.id);
      setIsRoleAddModalOpen(false);
      setNewRoleName('');
      window.alert(t('opSuccess', lang));
  };

  const deleteRole = () => {
      if (!selectedRoleId) return;
      if (confirm(t('confirmDeleteMsg', lang))) {
          setRoles(prev => prev.filter(r => r.id !== selectedRoleId));
          setSelectedRoleId(null);
          window.alert(t('opSuccess', lang));
      }
  };

  const updateRolePartition = (partition: string) => {
      setRoles(prev => prev.map(role => {
          if (role.id === selectedRoleId) {
              const current = role.allowedPartitions || [];
              const updated = current.includes(partition) 
                ? current.filter(p => p !== partition) 
                : [...current, partition];
              return { ...role, allowedPartitions: updated };
          }
          return role;
      }));
  };

  const updateRoleModule = (moduleKey: string) => {
       setRoles(prev => prev.map(role => {
          if (role.id === selectedRoleId) {
              const current = role.allowedModules || [];
              const updated = current.includes(moduleKey) 
                ? current.filter(m => m !== moduleKey) 
                : [...current, moduleKey];
              return { ...role, allowedModules: updated };
          }
          return role;
      }));
  };

  const updateRoleExchange = (exchange: string) => {
    setRoles(prev => prev.map(role => {
       if (role.id === selectedRoleId) {
           const current = role.allowedExchanges || [];
           const updated = current.includes(exchange) 
             ? current.filter(m => m !== exchange) 
             : [...current, exchange];
           return { ...role, allowedExchanges: updated };
       }
       return role;
   }));
};

const updateRoleTransType = (type: string) => {
    setRoles(prev => prev.map(role => {
       if (role.id === selectedRoleId) {
           const current = role.allowedTransactionTypes || [];
           const updated = current.includes(type) 
             ? current.filter(m => m !== type) 
             : [...current, type];
           return { ...role, allowedTransactionTypes: updated };
       }
       return role;
   }));
};


  // --- RENDERERS ---

  const renderLoginAccounts = () => (
    <div className="space-y-4">
        {/* Search Bar */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg flex flex-wrap gap-4 items-end">
            <Input 
                label={t('accountName', lang)} 
                placeholder={t('search', lang)} 
                value={loginSearch.name}
                onChange={e => setLoginSearch({...loginSearch, name: e.target.value})}
                containerClassName="w-32"
            />
            <Select 
                label={t('role', lang)}
                options={[{label: 'All', value: ''}, {label: 'Admin', value: 'Admin'}, {label: 'Operator', value: 'Operator'}]}
                value={loginSearch.role}
                onChange={e => setLoginSearch({...loginSearch, role: e.target.value})}
                containerClassName="w-28"
            />
            <Select 
                label={t('status', lang)}
                options={[{label: 'All', value: ''}, {label: t('normal', lang), value: 'normal'}, {label: t('forbidden', lang), value: 'forbidden'}]}
                value={loginSearch.status}
                onChange={e => setLoginSearch({...loginSearch, status: e.target.value})}
                containerClassName="w-28"
            />
             {/* Time Range Search (Filter Login Time) */}
            <Input 
                label={t('startDate', lang)} 
                type="date"
                value={loginSearch.startDate}
                onChange={e => setLoginSearch({...loginSearch, startDate: e.target.value})}
                containerClassName="w-32"
            />
             <Input 
                label={t('endDate', lang)} 
                type="date"
                value={loginSearch.endDate}
                onChange={e => setLoginSearch({...loginSearch, endDate: e.target.value})}
                containerClassName="w-32"
            />

            <div className="flex gap-2 ml-auto">
                <Button variant="secondary" onClick={() => setLoginSearch({name:'', role:'', status:'', startDate:'', endDate:''})}>
                    <RefreshCw size={16} />
                </Button>
            </div>
        </div>

        {/* Toolbar */}
        <div className="flex gap-2">
             <Button onClick={() => { setCurrentLoginAccount({}); setIsLoginAddModalOpen(true); }} className="flex items-center gap-2">
                 <Plus size={16} /> {t('addAccount', lang)}
             </Button>
             <Button 
                variant="danger" 
                onClick={handleLoginBatchDelete} 
                className="flex items-center gap-2"
             >
                 <Trash2 size={16} /> {t('batchDelete', lang)}
             </Button>
        </div>

        {/* Table */}
        <Card className="p-0 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-900 border-b border-slate-800 text-xs uppercase text-slate-400 font-semibold">
                        <tr>
                            <th className="px-4 py-3 w-10 text-left">
                                <button onClick={handleLoginSelectAll} className="text-slate-400 hover:text-white">
                                    {loginSelectedIds.size === paginatedLoginAccounts.length && paginatedLoginAccounts.length > 0 ? <CheckSquare size={18} /> : <Square size={18} />}
                                </button>
                            </th>
                            <th className="px-4 py-3 text-left">{t('account', lang)}</th>
                            <th className="px-4 py-3 text-left">{t('password', lang)}</th>
                            <th className="px-4 py-3 text-left">{t('googleSecret', lang)}</th>
                            <th className="px-4 py-3 text-left">{t('role', lang)}</th>
                            <th className="px-4 py-3 text-left">{t('status', lang)}</th>
                            <th className="px-4 py-3 text-left">{t('createTime', lang)}</th>
                            <th className="px-4 py-3 text-left">{t('loginTime', lang)}</th>
                            <th className="px-4 py-3 text-center">{t('actions', lang)}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {paginatedLoginAccounts.map(u => (
                            <tr key={u.id} className="hover:bg-slate-800/50 transition-colors">
                                <td className="px-4 py-3 text-left">
                                    <button onClick={() => handleLoginSelectOne(u.id)} className={`${loginSelectedIds.has(u.id) ? 'text-indigo-500' : 'text-slate-600'} hover:text-indigo-400`}>
                                        {loginSelectedIds.has(u.id) ? <CheckSquare size={18} /> : <Square size={18} />}
                                    </button>
                                </td>
                                <td className="px-4 py-3 font-medium text-white text-left">{u.account}</td>
                                <td className="px-4 py-3 text-left">
                                    <SecretCell value={u.password || '******'} />
                                </td>
                                <td className="px-4 py-3 text-left">
                                    <SecretCell value={u.googleSecret} />
                                </td>
                                <td className="px-4 py-3 text-slate-300 text-left">{u.role}</td>
                                <td className="px-4 py-3 text-left">
                                    <button onClick={() => handleLoginStatusToggle(u.id)} className="focus:outline-none">
                                        <Badge color={u.status === 'normal' ? 'green' : 'red'}>
                                            {u.status === 'normal' ? t('normal', lang) : t('forbidden', lang)}
                                        </Badge>
                                    </button>
                                </td>
                                <td className="px-4 py-3 text-slate-400 text-xs text-left">{u.createTime}</td>
                                <td className="px-4 py-3 text-slate-400 text-xs text-left">{u.loginTime}</td>
                                <td className="px-4 py-3 text-center">
                                    <div className="flex justify-center gap-2">
                                        <Button variant="ghost" size="sm" onClick={() => { setCurrentLoginAccount({...u}); setIsLoginEditModalOpen(true); }} className="text-indigo-400 hover:text-indigo-300">
                                            <Edit size={16} />
                                        </Button>
                                        <Button variant="ghost" size="sm" onClick={() => handleLoginSingleDelete(u.id)} className="text-red-400 hover:text-red-300">
                                            <Trash2 size={16} />
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Pagination 
                currentPage={loginPage}
                totalPages={Math.ceil(filteredLoginAccounts.length / loginItemsPerPage)}
                totalItems={filteredLoginAccounts.length}
                itemsPerPage={loginItemsPerPage}
                onPageChange={setLoginPage}
                onItemsPerPageChange={setLoginItemsPerPage}
            />
        </Card>
    </div>
  );

  const renderMMAccounts = () => (
    <div className="space-y-4">
        {/* MM Search Bar */}
         <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Input label={t('uid', lang)} value={mmSearch.uid} onChange={e => setMmSearch({...mmSearch, uid: e.target.value})} />
            <Input label={t('accountName', lang)} value={mmSearch.name} onChange={e => setMmSearch({...mmSearch, name: e.target.value})} />
            <Select 
                label={t('exchange', lang)}
                options={[{label: 'All', value: ''}, ...Object.values(Exchange).map(e => ({label: e, value: e}))]}
                value={mmSearch.exchange}
                onChange={e => setMmSearch({...mmSearch, exchange: e.target.value})}
            />
             <Input label={t('tradingPairs', lang)} value={mmSearch.pair} onChange={e => setMmSearch({...mmSearch, pair: e.target.value})} />
             <Input label={t('partition', lang)} value={mmSearch.partition} onChange={e => setMmSearch({...mmSearch, partition: e.target.value})} />
             <div className="flex items-end">
                <Button variant="secondary" onClick={() => setMmSearch({uid:'', exchange:'', pair:'', type:'', name:'', partition:''})} className="w-full">
                    {t('reset', lang)}
                </Button>
             </div>
        </div>

        {/* MM Toolbar */}
        {isAdmin && (
            <div className="flex gap-2">
                <Button onClick={openMmAddModal} className="flex items-center gap-2">
                    <Plus size={16} /> {t('addAccount', lang)}
                </Button>
                <Button 
                    variant="danger" 
                    onClick={handleMmDelete} 
                    disabled={mmSelectedIds.size === 0}
                    className="flex items-center gap-2"
                >
                    <Trash2 size={16} /> {t('batchDelete', lang)}
                </Button>
            </div>
        )}

        {/* MM Table */}
        <Card className="p-0 overflow-hidden">
             <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-900 border-b border-slate-800 text-xs uppercase text-slate-400 font-semibold">
                        <tr>
                            <th className="px-4 py-3 w-10">
                                <button onClick={handleMmSelectAll} className="text-slate-400 hover:text-white">
                                    {mmSelectedIds.size === paginatedMmAccounts.length && paginatedMmAccounts.length > 0 ? <CheckSquare size={18} /> : <Square size={18} />}
                                </button>
                            </th>
                            <th className="px-4 py-3">{t('uid', lang)}</th>
                            <th className="px-4 py-3">{t('accountName', lang)}</th>
                            <th className="px-4 py-3">{t('transactionType', lang)}</th>
                            <th className="px-4 py-3">{t('tradingPairs', lang)}</th>
                            <th className="px-4 py-3">{t('exchange', lang)}</th>
                            <th className="px-4 py-3">{t('partition', lang)}</th>
                            <th className="px-4 py-3">{t('leverage', lang)}</th>
                            <th className="px-4 py-3">{t('modificationTime', lang)}</th>
                            {isAdmin && <th className="px-4 py-3 text-right">{t('actions', lang)}</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {paginatedMmAccounts.map(m => (
                            <tr key={m.id} className="hover:bg-slate-800/50 transition-colors">
                                <td className="px-4 py-3">
                                    <button onClick={() => handleMmSelectOne(m.id)} className={`${mmSelectedIds.has(m.id) ? 'text-indigo-500' : 'text-slate-600'} hover:text-indigo-400`}>
                                        {mmSelectedIds.has(m.id) ? <CheckSquare size={18} /> : <Square size={18} />}
                                    </button>
                                </td>
                                <td className="px-4 py-3 text-slate-400 font-mono">{m.uid}</td>
                                <td className="px-4 py-3 font-medium text-white">{m.name}</td>
                                <td className="px-4 py-3">
                                    <div className="flex gap-1">
                                        {m.transactionTypes.map(tt => <Badge key={tt} color="blue">{tt}</Badge>)}
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-xs text-slate-300 max-w-[150px] truncate" title={m.tradingPairs.join(', ')}>
                                    {m.tradingPairs.join(', ')}
                                </td>
                                <td className="px-4 py-3 text-white">{m.exchange}</td>
                                <td className="px-4 py-3 text-slate-300">{m.partition}</td>
                                <td className="px-4 py-3 text-slate-400">{m.leverage ? `${m.leverage}x` : '-'}</td>
                                <td className="px-4 py-3 text-xs text-slate-500">{m.modificationTime}</td>
                                {isAdmin && (
                                    <td className="px-4 py-3 text-right">
                                        <Button variant="ghost" size="sm" onClick={() => openMmEditModal(m)} className="text-indigo-400 hover:text-indigo-300">
                                            <Edit size={16} />
                                        </Button>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
             </div>
             <Pagination 
                currentPage={mmPage}
                totalPages={Math.ceil(filteredMmAccounts.length / 5)}
                totalItems={filteredMmAccounts.length}
                itemsPerPage={5}
                onPageChange={setMmPage}
            />
        </Card>
    </div>
  );

  const renderPermissions = () => {
    const selectedRole = roles.find(r => r.id === selectedRoleId);
    
    // Modules from Sidebar for Permission Mapping
    const moduleGroups = [
        {
            title: t('tradeMgmt', lang),
            modules: [
                { key: 'trade-kline', label: t('klineMgmt', lang) },
                { key: 'trade-depth', label: t('depthMgmt', lang) },
                { key: 'trade-wash', label: t('washMgmt', lang) }
            ]
        },
        {
            title: t('dataMon', lang),
            modules: [
                { key: 'market', label: t('market', lang) },
                { key: 'alerts', label: t('alerts', lang) }
            ]
        }
    ];

    return (
     <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-200px)]">
        {/* LEFT: Role List */}
        <div className="w-full lg:w-1/4 flex flex-col gap-4">
             <div className="flex justify-between items-center">
                 <h3 className="text-lg font-bold text-white">{t('roleList', lang)}</h3>
                 <Button size="sm" onClick={() => setIsRoleAddModalOpen(true)}><Plus size={16}/></Button>
             </div>
             <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-y-auto flex-1 custom-scrollbar">
                 {roles.map(role => (
                     <div 
                        key={role.id} 
                        onClick={() => handleRoleSelect(role.id)}
                        className={`p-4 border-b border-slate-800 cursor-pointer transition-colors ${selectedRoleId === role.id ? 'bg-indigo-600/10 border-l-4 border-l-indigo-500' : 'hover:bg-slate-800 border-l-4 border-l-transparent'}`}
                     >
                         <div className="font-bold text-slate-200">{role.name}</div>
                         <div className="text-xs text-slate-500 mt-1">{role.description}</div>
                     </div>
                 ))}
             </div>
        </div>

        {/* RIGHT: Permission Config */}
        <div className="w-full lg:w-3/4 flex flex-col gap-6">
            {selectedRole ? (
                <>
                    {/* Header */}
                    <Card className="flex justify-between items-center py-4">
                        <div>
                            <h2 className="text-xl font-bold text-white">{selectedRole.name}</h2>
                            <p className="text-sm text-slate-400">{t('roleDesc', lang)}: {selectedRole.description}</p>
                        </div>
                        <div className="flex gap-2">
                             <Button variant="danger" onClick={deleteRole}>{t('deleteRole', lang)}</Button>
                             <Button variant="primary">{t('saveRole', lang)}</Button>
                        </div>
                    </Card>

                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-hidden overflow-y-auto pr-2 custom-scrollbar">
                        
                        {/* Partitions */}
                        <Card title={t('partitionAccess', lang)} className="flex flex-col">
                            <p className="text-xs text-slate-500 mb-4">{t('selectPartitions', lang)}</p>
                            <div className="flex-1 space-y-2">
                                {allPartitions.length === 0 && <div className="text-sm text-slate-500 italic">No partitions defined in MM Accounts.</div>}
                                {allPartitions.map(p => (
                                    <label key={p} className="flex items-center gap-3 p-3 rounded hover:bg-slate-800 cursor-pointer border border-slate-800/50">
                                        <div className={`w-5 h-5 rounded flex items-center justify-center border ${selectedRole.allowedPartitions.includes(p) ? 'bg-indigo-600 border-indigo-600' : 'border-slate-600'}`}>
                                            {selectedRole.allowedPartitions.includes(p) && <Check size={14} className="text-white" />}
                                        </div>
                                        <input 
                                            type="checkbox" 
                                            className="hidden" 
                                            checked={selectedRole.allowedPartitions.includes(p)} 
                                            onChange={() => updateRolePartition(p)}
                                        />
                                        <span className="text-sm text-slate-200">{p}</span>
                                    </label>
                                ))}
                            </div>
                        </Card>

                        {/* Modules */}
                        <Card title={t('moduleAccess', lang)} className="flex flex-col">
                             <p className="text-xs text-slate-500 mb-4">{t('selectModules', lang)}</p>
                             <div className="flex-1 space-y-6">
                                {moduleGroups.map(group => (
                                    <div key={group.title}>
                                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{group.title}</h4>
                                        <div className="space-y-2">
                                            {group.modules.map(mod => (
                                                 <label key={mod.key} className="flex items-center gap-3 p-3 rounded hover:bg-slate-800 cursor-pointer border border-slate-800/50">
                                                     <div className={`w-5 h-5 rounded flex items-center justify-center border ${selectedRole.allowedModules.includes(mod.key) ? 'bg-emerald-600 border-emerald-600' : 'border-slate-600'}`}>
                                                        {selectedRole.allowedModules.includes(mod.key) && <Check size={14} className="text-white" />}
                                                    </div>
                                                    <input 
                                                        type="checkbox" 
                                                        className="hidden" 
                                                        checked={selectedRole.allowedModules.includes(mod.key)} 
                                                        onChange={() => updateRoleModule(mod.key)}
                                                    />
                                                    <span className="text-sm text-slate-200">{mod.label}</span>
                                                 </label>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                             </div>
                        </Card>

                        {/* Allowed Exchanges */}
                        <Card title={t('exchangeAccess', lang)} className="flex flex-col">
                            <p className="text-xs text-slate-500 mb-4">{t('selectExchanges', lang)}</p>
                            <div className="flex-1 space-y-2">
                                {Object.values(Exchange).map(e => (
                                    <label key={e} className="flex items-center gap-3 p-3 rounded hover:bg-slate-800 cursor-pointer border border-slate-800/50">
                                        <div className={`w-5 h-5 rounded flex items-center justify-center border ${selectedRole.allowedExchanges?.includes(e) ? 'bg-indigo-600 border-indigo-600' : 'border-slate-600'}`}>
                                            {selectedRole.allowedExchanges?.includes(e) && <Check size={14} className="text-white" />}
                                        </div>
                                        <input 
                                            type="checkbox" 
                                            className="hidden" 
                                            checked={selectedRole.allowedExchanges?.includes(e)} 
                                            onChange={() => updateRoleExchange(e)}
                                        />
                                        <span className="text-sm text-slate-200">{e}</span>
                                    </label>
                                ))}
                            </div>
                        </Card>

                         {/* Allowed Transaction Types */}
                         <Card title={t('transTypeAccess', lang)} className="flex flex-col">
                            <p className="text-xs text-slate-500 mb-4">{t('selectTransTypes', lang)}</p>
                            <div className="flex-1 space-y-2">
                                {Object.values(TransactionType).map(e => (
                                    <label key={e} className="flex items-center gap-3 p-3 rounded hover:bg-slate-800 cursor-pointer border border-slate-800/50">
                                        <div className={`w-5 h-5 rounded flex items-center justify-center border ${selectedRole.allowedTransactionTypes?.includes(e) ? 'bg-indigo-600 border-indigo-600' : 'border-slate-600'}`}>
                                            {selectedRole.allowedTransactionTypes?.includes(e) && <Check size={14} className="text-white" />}
                                        </div>
                                        <input 
                                            type="checkbox" 
                                            className="hidden" 
                                            checked={selectedRole.allowedTransactionTypes?.includes(e)} 
                                            onChange={() => updateRoleTransType(e)}
                                        />
                                        <span className="text-sm text-slate-200">{e}</span>
                                    </label>
                                ))}
                            </div>
                        </Card>
                    </div>
                </>
            ) : (
                <div className="flex h-full items-center justify-center text-slate-500">
                    Select a role to configure permissions.
                </div>
            )}
        </div>

        {/* Create Role Modal */}
        <Modal 
            isOpen={isRoleAddModalOpen} 
            onClose={() => setIsRoleAddModalOpen(false)} 
            title={t('createRole', lang)}
            footer={
                <>
                    <Button variant="ghost" onClick={() => setIsRoleAddModalOpen(false)}>{t('cancel', lang)}</Button>
                    <Button onClick={createRole}>{t('saveConfig', lang)}</Button>
                </>
            }
        >
            <div className="space-y-4">
                <Input label={t('roleName', lang)} value={newRoleName} onChange={e => setNewRoleName(e.target.value)} />
            </div>
        </Modal>
     </div>
    );
  };

  return (
    <div className="space-y-6 h-full">
      {activeTab === 'login' && renderLoginAccounts()}
      {activeTab === 'mm' && renderMMAccounts()}
      {activeTab === 'perms' && renderPermissions()}

      {/* --- Login Account Modals --- */}
      <Modal
        isOpen={isLoginAddModalOpen}
        onClose={() => setIsLoginAddModalOpen(false)}
        title={t('addNewAccount', lang)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsLoginAddModalOpen(false)}>{t('cancel', lang)}</Button>
            <Button onClick={saveNewLoginAccount}>{t('saveConfig', lang)}</Button>
          </>
        }
      >
        <div className="space-y-4">
             {/* Mandatory fields marked with red star */}
            <Input 
                label={<span>{t('account', lang)} <span className="text-red-500">*</span></span>} 
                value={currentLoginAccount.account || ''} 
                onChange={e => setCurrentLoginAccount({...currentLoginAccount, account: e.target.value})}
            />
            <Input 
                label={<span>{t('password', lang)} <span className="text-red-500">*</span></span>} 
                type="password" 
                value={currentLoginAccount.password || ''} 
                onChange={e => setCurrentLoginAccount({...currentLoginAccount, password: e.target.value})}
            />
            <Select 
                label={<span>{t('role', lang)} <span className="text-red-500">*</span></span>} 
                options={['Admin', 'Operator', 'Finance', 'Risk'].map(r => ({ label: r, value: r }))} 
                value={currentLoginAccount.role} 
                onChange={e => setCurrentLoginAccount({...currentLoginAccount, role: e.target.value})}
            />
            <div className="text-xs text-slate-500">
                 {t('googleSecret', lang)}: <span className="text-slate-400 font-mono">Auto-generated</span>
            </div>
        </div>
      </Modal>

      <Modal
        isOpen={isLoginEditModalOpen}
        onClose={() => setIsLoginEditModalOpen(false)}
        title={t('editAccount', lang)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsLoginEditModalOpen(false)}>{t('cancel', lang)}</Button>
            <Button onClick={saveEditLoginAccount}>{t('saveConfig', lang)}</Button>
          </>
        }
      >
        <div className="space-y-4">
            <Input 
                label={<span>{t('account', lang)} <span className="text-red-500">*</span></span>} 
                value={currentLoginAccount.account || ''} 
                onChange={e => setCurrentLoginAccount({...currentLoginAccount, account: e.target.value})}
            />
            <Input 
                label={t('password', lang)} 
                type="password" 
                placeholder="******" 
                onChange={e => setCurrentLoginAccount({...currentLoginAccount, password: e.target.value})}
            />
            <Input 
                label={<span>{t('googleSecret', lang)} <span className="text-red-500">*</span></span>} 
                value={currentLoginAccount.googleSecret || ''} 
                onChange={e => setCurrentLoginAccount({...currentLoginAccount, googleSecret: e.target.value})} 
                placeholder={t('resetSecretTip', lang)}
            />
            <Select 
                label={<span>{t('role', lang)} <span className="text-red-500">*</span></span>} 
                options={['Admin', 'Operator', 'Finance', 'Risk'].map(r => ({ label: r, value: r }))} 
                value={currentLoginAccount.role} 
                onChange={e => setCurrentLoginAccount({...currentLoginAccount, role: e.target.value})}
            />
            <p className="text-xs text-orange-400 mt-1">{t('resetSecretTip', lang)}</p>
        </div>
      </Modal>

      {/* --- MM Account Modals --- */}
      <Modal
        isOpen={isMmAddModalOpen || isMmEditModalOpen}
        onClose={() => {setIsMmAddModalOpen(false); setIsMmEditModalOpen(false);}}
        title={isMmAddModalOpen ? t('addNewAccount', lang) : t('editAccount', lang)}
        footer={
           <>
            <Button variant="ghost" onClick={() => {setIsMmAddModalOpen(false); setIsMmEditModalOpen(false);}}>{t('cancel', lang)}</Button>
            <Button onClick={isMmAddModalOpen ? saveNewMmAccount : saveEditMmAccount}>{t('saveConfig', lang)}</Button>
           </>
        }
      >
          <div className="space-y-4">
             {/* Security Note */}
             {isMmAddModalOpen && (
                 <div className="bg-orange-500/10 border border-orange-500/20 p-3 rounded flex gap-3 text-orange-200 text-xs">
                     <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                     <p>{t('securityDesc', lang)}</p>
                 </div>
             )}

             <div className="grid grid-cols-2 gap-4">
                 <Input label={t('accountName', lang)} value={currentMmAccount.name || ''} onChange={e => setCurrentMmAccount({...currentMmAccount, name: e.target.value})} containerClassName="col-span-2" />
                 
                 {isMmAddModalOpen && (
                     <>
                        <Input label={t('apiKey', lang)} value={currentMmAccount.apiKey || ''} onChange={e => setCurrentMmAccount({...currentMmAccount, apiKey: e.target.value})} containerClassName="col-span-2" />
                        <Input label={t('apiSecret', lang)} type="password" value={currentMmAccount.secretKey || ''} onChange={e => setCurrentMmAccount({...currentMmAccount, secretKey: e.target.value})} />
                        <Input label={t('passphrase', lang)} type="password" value={currentMmAccount.passphrase || ''} onChange={e => setCurrentMmAccount({...currentMmAccount, passphrase: e.target.value})} />
                     </>
                 )}

                 <Select 
                    label={t('exchange', lang)} 
                    options={Object.values(Exchange).map(e => ({label: e, value: e}))}
                    value={currentMmAccount.exchange}
                    onChange={e => setCurrentMmAccount({...currentMmAccount, exchange: e.target.value as Exchange})}
                    containerClassName="col-span-1"
                 />
                 <Input label={t('partition', lang)} value={currentMmAccount.partition || ''} onChange={e => setCurrentMmAccount({...currentMmAccount, partition: e.target.value})} containerClassName="col-span-1" />

                 <div className="col-span-2 space-y-2">
                     <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">{t('transactionType', lang)}</label>
                     <div className="flex gap-4">
                         {['Spot', 'Contract', 'Margin'].map(type => (
                             <label key={type} className="flex items-center gap-2 cursor-pointer">
                                 <button type="button" onClick={() => toggleMmTransactionType(type)} className={`${currentMmAccount.transactionTypes?.includes(type) ? 'text-indigo-500' : 'text-slate-600'}`}>
                                     {currentMmAccount.transactionTypes?.includes(type) ? <CheckSquare size={16} /> : <Square size={16} />}
                                 </button>
                                 <span className="text-sm text-slate-300">{t(type.toLowerCase() as any, lang) || type}</span>
                             </label>
                         ))}
                     </div>
                 </div>

                 {currentMmAccount.transactionTypes?.includes('Contract') && (
                     <Input label={t('leverage', lang)} type="number" value={currentMmAccount.leverage || ''} onChange={e => setCurrentMmAccount({...currentMmAccount, leverage: parseInt(e.target.value)})} containerClassName="col-span-2" />
                 )}

                 <Input label={t('tradingPairs', lang)} placeholder="e.g. BTC/USDT, ETH/USDT" value={currentMmAccount.tradingPairs?.join(',') || ''} onChange={e => setCurrentMmAccount({...currentMmAccount, tradingPairs: e.target.value.split(',')})} containerClassName="col-span-2" />
                 <Input label={t('ipWhitelist', lang)} value={currentMmAccount.ipWhitelist || ''} onChange={e => setCurrentMmAccount({...currentMmAccount, ipWhitelist: e.target.value})} containerClassName="col-span-2" />
             </div>
          </div>
      </Modal>

    </div>
  );
};