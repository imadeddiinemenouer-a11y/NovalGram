import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Copy, CheckCircle, ArrowUpRight, Wallet, AlertTriangle, RefreshCw, History, ArrowDownRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { processDeposit, requestWithdrawal, getUserBalance, supabase } from '../utils/api';
import { formatNumber } from '../utils/helpers';
import toast from 'react-hot-toast';

const DEPOSIT_ADDRESS = '0xF4b991bD77ABeF8964a1451B127316d2a66330cb';
const MIN_AMOUNT = 0.1;

export default function WalletPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw' | 'history'>('deposit');
  const [balance, setBalance] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [txHash, setTxHash] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);

  useEffect(() => { if (user) { loadBalance(); loadTransactions(); loadWithdrawals(); } }, [user]);

  async function loadBalance() { if (!user) return; const data = await getUserBalance(user.id); setBalance(data); }
  async function loadTransactions() { if (!user) return; const { data } = await supabase.from('payment_transactions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20); setTransactions(data || []); }
  async function loadWithdrawals() { if (!user) return; const { data } = await supabase.from('withdrawal_requests').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20); setWithdrawals(data || []); }

  const copyAddress = () => { navigator.clipboard.writeText(DEPOSIT_ADDRESS); setCopied(true); toast.success('Address copied!'); setTimeout(() => setCopied(false), 2000); };

  async function handleVerifyDeposit() {
    if (!user || !txHash.trim() || !depositAmount.trim()) { toast.error('Please enter amount and transaction hash'); return; }
    const amountNum = parseFloat(depositAmount);
    if (isNaN(amountNum) || amountNum < MIN_AMOUNT) { toast.error(`Minimum deposit is ${MIN_AMOUNT} USDT`); return; }
    if (!txHash.match(/^0x[a-fA-F0-9]{64}$/)) { toast.error('Invalid transaction hash format'); return; }
    setIsVerifying(true);
    try {
      const result = await processDeposit(user.id, txHash.trim());
      if (result.success) { toast.success('Deposit verified successfully!'); setDepositAmount(''); setTxHash(''); loadBalance(); loadTransactions(); setActiveTab('history'); }
      else { toast.error(result.error || 'Verification failed'); }
    } catch (error) { toast.error('Verification error'); } finally { setIsVerifying(false); }
  }

  async function handleWithdraw() {
    if (!user) return;
    const amountNum = parseFloat(withdrawAmount);
    if (isNaN(amountNum) || amountNum < MIN_AMOUNT) { toast.error(`Minimum withdrawal is ${MIN_AMOUNT} USDT`); return; }
    if (!withdrawAddress.match(/^0x[a-fA-F0-9]{40}$/)) { toast.error('Invalid BSC address'); return; }
    setIsWithdrawing(true);
    try {
      const result = await requestWithdrawal(user.id, amountNum, withdrawAddress);
      if (result.success) { toast.success('Withdrawal request submitted!'); setWithdrawAmount(''); setWithdrawAddress(''); loadBalance(); loadWithdrawals(); setActiveTab('history'); }
      else { toast.error(result.error || 'Withdrawal failed'); }
    } catch (error) { toast.error('Withdrawal error'); } finally { setIsWithdrawing(false); }
  }

  if (!user) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-[var(--void)]' : 'bg-gray-50'}`}>
        <div className="text-center">
          <Wallet className="w-16 h-16 mx-auto mb-4 text-[var(--txt3)]" />
          <h2 className={`text-xl font-semibold mb-2 ${isDark ? 'text-[var(--txt)]' : 'text-gray-900'}`}>Sign in to access wallet</h2>
          <button onClick={() => navigate('/login')} className="px-6 py-3 bg-gradient-to-r from-[var(--v)] to-[var(--mg)] text-white rounded-full font-semibold">Sign In</button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors ${isDark ? 'bg-[var(--void)] text-[var(--txt)]' : 'bg-gray-50 text-gray-900'}`}>
      <div className={`bg-gradient-to-br from-[var(--v)] to-[var(--mg)] text-white`}>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-2">Wallet</h1>
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4"><p className="text-white/70 text-sm mb-1">NGC Balance</p><p className="text-3xl font-bold">{formatNumber(balance?.ngc_balance || 0)}</p></div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4"><p className="text-white/70 text-sm mb-1">USDT Balance</p><p className="text-3xl font-bold">{balance?.usdt_balance || 0}</p></div>
          </div>
        </div>
      </div>
      <div className={`sticky top-14 z-30 border-b ${isDark ? 'bg-[var(--void)]/95 backdrop-blur-2xl border-[var(--b2)]' : 'bg-white border-gray-200'}`}>
        <div className="max-w-4xl mx-auto px-4 flex gap-4 overflow-x-auto scrollbar-hide">
          {['deposit', 'withdraw', 'history'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab as any)} className={`py-3 px-4 font-medium text-sm border-b-2 transition-colors capitalize whitespace-nowrap ${activeTab === tab ? 'border-[var(--vb)] text-[var(--vb)]' : 'border-transparent text-[var(--txt3)] hover:text-[var(--txt)]'}`}>{tab}</button>
          ))}
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 py-6">
        {activeTab === 'deposit' && (
          <div className="space-y-6">
            <div className={`rounded-2xl shadow-sm p-6 ${isDark ? 'bg-[var(--surface)]' : 'bg-white'}`}>
              <h2 className={`font-semibold text-lg mb-4 ${isDark ? 'text-[var(--txt)]' : 'text-gray-900'}`}>Deposit USDT</h2>
              <div className="bg-[var(--amber)]/10 border border-[var(--amber)]/20 rounded-xl p-4 mb-4"><AlertTriangle className="w-5 h-5 text-[var(--amber)] inline mr-2" /><span className="text-sm text-[var(--amber)]">Only send USDT (BEP-20) on BSC. Minimum {MIN_AMOUNT} USDT.</span></div>
              <div className="bg-gray-900 rounded-xl p-4 mb-4"><div className="flex items-center justify-between mb-2"><span className="text-gray-400 text-sm">Deposit Address (BSC)</span><button onClick={copyAddress} className="text-[var(--vb)] hover:text-[var(--vl)] text-sm">{copied ? <CheckCircle className="w-4 h-4 inline" /> : <Copy className="w-4 h-4 inline" />} {copied ? 'Copied' : 'Copy'}</button></div><p className="text-white font-mono text-sm break-all">{DEPOSIT_ADDRESS}</p></div>
              <div className="space-y-3">
                <input type="number" placeholder={`Amount (min ${MIN_AMOUNT} USDT)`} value={depositAmount} onChange={e => setDepositAmount(e.target.value)} className={`w-full px-4 py-3 rounded-xl border ${isDark ? 'bg-[var(--surface2)] border-[var(--b2)] text-[var(--txt)]' : 'bg-gray-100 border-gray-200'} focus:outline-none focus:ring-2 focus:ring-[var(--v)]`} step="0.01" />
                <input type="text" placeholder="Transaction Hash (0x...)" value={txHash} onChange={e => setTxHash(e.target.value)} className={`w-full px-4 py-3 rounded-xl border font-mono text-sm ${isDark ? 'bg-[var(--surface2)] border-[var(--b2)] text-[var(--txt)]' : 'bg-gray-100 border-gray-200'} focus:outline-none focus:ring-2 focus:ring-[var(--v)]`} />
                <button onClick={handleVerifyDeposit} disabled={isVerifying} className="w-full py-3 bg-gradient-to-r from-[var(--v)] to-[var(--mg)] text-white rounded-xl font-semibold hover:opacity-90 disabled:opacity-50">{isVerifying ? <RefreshCw className="w-5 h-5 animate-spin mx-auto" /> : 'Verify Deposit'}</button>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'withdraw' && (
          <div className="space-y-6">
            <div className={`rounded-2xl shadow-sm p-6 ${isDark ? 'bg-[var(--surface)]' : 'bg-white'}`}>
              <h2 className={`font-semibold text-lg mb-4 ${isDark ? 'text-[var(--txt)]' : 'text-gray-900'}`}>Withdraw USDT</h2>
              <div className="bg-[var(--amber)]/10 border border-[var(--amber)]/20 rounded-xl p-4 mb-4"><AlertTriangle className="w-5 h-5 text-[var(--amber)] inline mr-2" /><span className="text-sm text-[var(--amber)]">Minimum withdrawal: {MIN_AMOUNT} USDT. BSC network only.</span></div>
              <div className="space-y-3">
                <input type="number" placeholder={`Amount (min ${MIN_AMOUNT} USDT)`} value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} className={`w-full px-4 py-3 rounded-xl border ${isDark ? 'bg-[var(--surface2)] border-[var(--b2)] text-[var(--txt)]' : 'bg-gray-100 border-gray-200'} focus:outline-none focus:ring-2 focus:ring-[var(--v)]`} step="0.01" />
                <input type="text" placeholder="BSC Address (0x...)" value={withdrawAddress} onChange={e => setWithdrawAddress(e.target.value)} className={`w-full px-4 py-3 rounded-xl border font-mono text-sm ${isDark ? 'bg-[var(--surface2)] border-[var(--b2)] text-[var(--txt)]' : 'bg-gray-100 border-gray-200'} focus:outline-none focus:ring-2 focus:ring-[var(--v)]`} />
                <button onClick={handleWithdraw} disabled={isWithdrawing} className="w-full py-3 bg-gradient-to-r from-[var(--v)] to-[var(--mg)] text-white rounded-xl font-semibold hover:opacity-90 disabled:opacity-50">{isWithdrawing ? 'Processing...' : 'Request Withdrawal'}</button>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'history' && (
          <div className="space-y-6">
            <div className={`rounded-2xl shadow-sm p-4 ${isDark ? 'bg-[var(--surface)]' : 'bg-white'}`}>
              <h3 className={`font-semibold mb-3 ${isDark ? 'text-[var(--txt)]' : 'text-gray-900'}`}>Deposit History</h3>
              {transactions.length === 0 ? <p className="text-sm text-[var(--txt3)]">No deposits yet.</p> : transactions.map(tx => (
                <div key={tx.id} className="flex justify-between items-center text-sm py-2 border-b border-[var(--b2)] last:border-0"><div><span className="font-medium">{tx.amount} USDT</span><span className="ml-2 text-[var(--txt3)]">{tx.status}</span></div><span className="text-xs text-[var(--txt3)]">{new Date(tx.created_at).toLocaleDateString()}</span></div>
              ))}
            </div>
            <div className={`rounded-2xl shadow-sm p-4 ${isDark ? 'bg-[var(--surface)]' : 'bg-white'}`}>
              <h3 className={`font-semibold mb-3 ${isDark ? 'text-[var(--txt)]' : 'text-gray-900'}`}>Withdrawal History</h3>
              {withdrawals.length === 0 ? <p className="text-sm text-[var(--txt3)]">No withdrawals yet.</p> : withdrawals.map(w => (
                <div key={w.id} className="flex justify-between items-center text-sm py-2 border-b border-[var(--b2)] last:border-0"><div><span className="font-medium">{w.amount} USDT</span><span className="ml-2 text-[var(--txt3)]">{w.status}</span></div><span className="text-xs text-[var(--txt3)]">{new Date(w.created_at).toLocaleDateString()}</span></div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}