import React from 'react';
import { Card, Badge } from './UIComponents';
import { Wallet, Activity, TrendingUp, AlertTriangle, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line } from 'recharts';
import { Language } from '../types';
import { t } from '../utils/i18n';

const DATA = [
  { name: '00:00', vol: 4000, price: 64000 },
  { name: '04:00', vol: 3000, price: 64200 },
  { name: '08:00', vol: 2000, price: 63800 },
  { name: '12:00', vol: 2780, price: 63900 },
  { name: '16:00', vol: 1890, price: 64500 },
  { name: '20:00', vol: 2390, price: 64700 },
  { name: '24:00', vol: 3490, price: 64230 },
];

const StatCard: React.FC<{ title: string; value: string; subValue?: string; icon: React.ReactNode; trend?: 'up' | 'down' }> = ({ title, value, subValue, icon, trend }) => (
  <div className="bg-slate-900 border border-slate-800 p-6 rounded-lg shadow-lg flex justify-between items-start">
    <div>
      <p className="text-slate-400 text-sm font-medium mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-white">{value}</h3>
      {subValue && (
        <div className={`flex items-center text-xs mt-2 font-medium ${trend === 'up' ? 'text-emerald-400' : 'text-rose-400'}`}>
            {trend === 'up' ? <ArrowUpRight size={14} className="mr-1" /> : <ArrowDownRight size={14} className="mr-1" />}
            {subValue}
        </div>
      )}
    </div>
    <div className="p-3 bg-slate-800 rounded-lg text-indigo-400">
      {icon}
    </div>
  </div>
);

export const Dashboard: React.FC<{lang: Language}> = ({ lang }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title={t('totalAssets', lang)}
          value="$1,245,092.45" 
          subValue={`+2.4% ${t('vsYesterday', lang)}`}
          trend="up"
          icon={<Wallet size={24} />} 
        />
        <StatCard 
          title={t('activeStrategies', lang)}
          value="8 / 12" 
          subValue={`2 ${t('paused', lang)}`}
          trend="down"
          icon={<Activity size={24} />} 
        />
        <StatCard 
          title={t('vol24h', lang)}
          value="$12.4M" 
          subValue={t('highActivity', lang)}
          trend="up"
          icon={<TrendingUp size={24} />} 
        />
        <StatCard 
          title={t('systemAlerts', lang)}
          value="3 Warnings" 
          subValue={t('checkLogs', lang)}
          trend="down"
          icon={<AlertTriangle size={24} className="text-amber-500" />} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title={t('volumePnl', lang)} className="lg:col-span-2 min-h-[400px]">
          <div className="h-[320px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={DATA}>
                 <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                 <XAxis dataKey="name" stroke="#94a3b8" />
                 <YAxis stroke="#94a3b8" />
                 <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }} 
                    itemStyle={{ color: '#e2e8f0' }}
                 />
                 <Line type="monotone" dataKey="price" stroke="#818cf8" strokeWidth={3} dot={{r: 4, fill:'#818cf8'}} />
                 <Line type="monotone" dataKey="vol" stroke="#34d399" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title={t('systemLogs', lang)}>
          <div className="space-y-4 max-h-[340px] overflow-y-auto pr-2 custom-scrollbar">
            {[...Array(6)].map((_, i) => (
                <div key={i} className="flex gap-3 items-start border-b border-slate-800 pb-3 last:border-0">
                    <span className="text-xs text-slate-500 font-mono mt-1">10:4{i}:{12+i}</span>
                    <div>
                        <div className="text-sm text-slate-200">Order filled completely on Binance</div>
                        <div className="text-xs text-slate-400">Strategy #124 • BTC/USDT</div>
                    </div>
                </div>
            ))}
             <div className="flex gap-3 items-start border-b border-slate-800 pb-3">
                <span className="text-xs text-slate-500 font-mono mt-1">10:38:00</span>
                <div>
                    <div className="text-sm text-rose-400">API Rate Limit Approaching</div>
                    <div className="text-xs text-slate-400">OKX Connection</div>
                </div>
            </div>
          </div>
        </Card>
      </div>

      <Card title={t('activeStrategyPerf', lang)}>
         <div className="overflow-x-auto">
             <table className="w-full text-left">
                 <thead>
                     <tr className="text-slate-400 border-b border-slate-800">
                         <th className="pb-3 font-medium">{t('strategy', lang)}</th>
                         <th className="pb-3 font-medium">{t('pair', lang)}</th>
                         <th className="pb-3 font-medium">{t('uptime', lang)}</th>
                         <th className="pb-3 font-medium">{t('trades24h', lang)}</th>
                         <th className="pb-3 font-medium">{t('status', lang)}</th>
                     </tr>
                 </thead>
                 <tbody className="text-slate-300">
                     <tr className="border-b border-slate-800/50">
                         <td className="py-3">Follow Mode Alpha</td>
                         <td>BTC/USDT</td>
                         <td>14d 2h</td>
                         <td>1,204</td>
                         <td><Badge color="green">{t('running', lang)}</Badge></td>
                     </tr>
                     <tr className="border-b border-slate-800/50">
                         <td className="py-3">Arbitrage Spread</td>
                         <td>ETH/USDT</td>
                         <td>2d 5h</td>
                         <td>45</td>
                         <td><Badge color="green">{t('running', lang)}</Badge></td>
                     </tr>
                     <tr className="border-b border-slate-800/50">
                         <td className="py-3">Depth Maintenance</td>
                         <td>SOL/USDT</td>
                         <td>-</td>
                         <td>0</td>
                         <td><Badge color="red">{t('stopped', lang)}</Badge></td>
                     </tr>
                 </tbody>
             </table>
         </div>
      </Card>
    </div>
  );
};
