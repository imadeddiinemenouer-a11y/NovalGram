import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Copy, CheckCircle, ArrowUpRight, Wallet, AlertTriangle,
  RefreshCw, History, Clock, ArrowDownRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { processDeposit, requestWithdrawal, getUserBalance, supabase } from '../utils/api';
import { formatNumber } from '../utils/helpers';
import toast from 'react-hot-toast';

const DEPOSIT_ADDRESS = '0xF4b991bD77ABeF8964a1451B127316d2a66330cb';
const MIN_DEPOSIT = 0.1;
const MIN_WITHDRAWAL = 0.1;

export default function WalletPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw' | 'history'>('deposit');
  const [balance, setBalance] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  // Deposit state
  const [depositAmount, setDepositAmount] = useState('');
  const [txHash, setTxHash] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // Withdraw state
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  // History state
  const [transactions, setTransactions] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      loadBalance();
      loadTransactions();
      loadWithdrawals();
    }
  }, [user]);

  async function loadBalance() {
    if (!user) return;
    const data = await getUserBalance(user.id);
    setBalance(data);
  }

  async function loadTransactions() {
    if (!user) return;
    const { data, error } = await supabase
      .from('payment_transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);
    if (!error) setTransactions(data || []);
  }

  async function loadWithdrawals() {
    if (!user) return;
    const { data, error } = await supabase
      .from('withdrawal_requests')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);
    if (!error) setWithdrawals(data || []);
  }

  const copyAddress = () => {
    navigator.clipboard.writeText(DEPOSIT_ADDRESS);
    setCopied(true);
    toast.success('Address copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  // --- Deposit Logic ---
  async function handleVerifyDeposit() {
    if (!user || !txHash.trim() || !depositAmount.trim()) {
      toast.error('Please enter amount and transaction hash');
      return;
    }
    const amountNum = parseFloat(depositAmount);
    if (isNaN(amountNum) || amountNum < MIN_DEPOSIT) {
      toast.error(`Minimum deposit is ${MIN_DEPOSIT} USDT`);
      return;
    }
    if (!txHash.match(/^0x[a-fA-F0-9]{64}$/)) {
      toast.error('Invalid transaction hash format');
      return;
    }
    setIsVerifying(true);
    try {
      const result = await processDeposit(user.id, txHash.trim());
      if (result.success) {
        toast.success('Deposit verified successfully!');
        setDepositAmount('');
        setTxHash('');
        loadBalance();
        loadTransactions();
        setActiveTab('history');
      } else {
        toast.error(result.error || 'Verification failed');
      }
    } catch (error) {
      toast.error('Verification error');
    } finally {
      setIsVerifying(false);
    }
  }

  // --- Withdraw Logic ---
  async function handleWithdraw() {
    if (!user) return;
    const amountNum = parseFloat(withdrawAmount);
    if (isNaN(amountNum) || amountNum < MIN_WITHDRAWAL) {
      toast.error(`Minimum withdrawal is ${MIN_WITHDRAWAL} USDT`);
      return;
    }
    if (!withdrawAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      toast.error('Invalid BSC address');
      return;
    }
    if (!balance || balance.usdt_balance < amountNum) {
      toast.error('Insufficient USDT balance');
      return;
    }
    setIsWithdrawing(true);
    try {
      const result = await requestWithdrawal(user.id, amountNum, withdrawAddress);
      if (result.success) {
        toast.success('Withdrawal request submitted!');
        setWithdrawAmount('');
        setWithdrawAddress('');
        loadBalance();
        loadWithdrawals();
        setActiveTab('history');
      } else {
        toast.error(result.error || 'Withdrawal failed');
      }
    } catch (error) {
      toast.error('Withdrawal error');
    } finally {
      setIsWithdrawing(false);
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <Wallet className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Sign in to access wallet</h2>
          <button onClick={() => navigate('/login')} className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700">
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-2">Wallet</h1>
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-indigo-200 text-sm mb-1">NGC Balance</p>
              <p className="text-3xl font-bold">{formatNumber(balance?.ngc_balance || 0)}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-indigo-200 text-sm mb-1">USDT Balance</p>
              <p className="text-3xl font-bold">{balance?.usdt_balance || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 sticky top-14 z-30">
        <div className="max-w-4xl mx-auto px-4 flex gap-4 overflow-x-auto scrollbar-hide">
          {['deposit', 'withdraw', 'history'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`py-3 px-4 font-medium text-sm border-b-2 transition-colors capitalize whitespace-nowrap ${
                activeTab === tab
                  ? 'border-indigo-600 text-indigo-600 dark:border-red-400 dark:text-red-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {tab === 'deposit' ? 'Deposit' : tab === 'withdraw' ? 'Withdraw' : 'History'}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Deposit Form */}
        {activeTab === 'deposit' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6">
              <h2 className="font-semibold text-lg text-gray-900 dark:text-white mb-4">Deposit USDT</h2>
              <div className="bg-amber-50 dark:bg-yellow-900/20 border border-amber-200 dark:border-yellow-700 rounded-xl p-4 mb-4">
                <AlertTriangle className="w-5 h-5 text-amber-600 inline mr-2" />
                <span className="text-sm text-amber-800 dark:text-yellow-200">Only send USDT (BEP-20) on BSC. Minimum {MIN_DEPOSIT} USDT.</span>
              </div>
              <div className="bg-gray-900 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Deposit Address (BSC)</span>
                  <button onClick={copyAddress} className="text-indigo-400 hover:text-indigo-300 text-sm">
                    {copied ? <CheckCircle className="w-4 h-4 inline" /> : <Copy className="w-4 h-4 inline" />} {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <p className="text-white font-mono text-sm break-all">{DEPOSIT_ADDRESS}</p>
              </div>
              <div className="space-y-3">
                <input
                  type="number"
                  placeholder={`Amount (min ${MIN_DEPOSIT} USDT)`}
                  value={depositAmount}
                  onChange={e => setDepositAmount(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-xl"
                  step="0.01"
                />
                <input
                  type="text"
                  placeholder="Transaction Hash (0x...)"
                  value={txHash}
                  onChange={e => setTxHash(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-xl font-mono text-sm"
                />
                <button
                  onClick={handleVerifyDeposit}
                  disabled={isVerifying}
                  className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50"
                >
                  {isVerifying ? <RefreshCw className="w-5 h-5 animate-spin mx-auto" /> : 'Verify Deposit'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Withdraw Form */}
        {activeTab === 'withdraw' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6">
              <h2 className="font-semibold text-lg text-gray-900 dark:text-white mb-4">Withdraw USDT</h2>
              <div className="bg-amber-50 dark:bg-yellow-900/20 border border-amber-200 dark:border-yellow-700 rounded-xl p-4 mb-4">
                <AlertTriangle className="w-5 h-5 text-amber-600 inline mr-2" />
                <span className="text-sm text-amber-800 dark:text-yellow-200">Minimum withdrawal: {MIN_WITHDRAWAL} USDT. BSC network only.</span>
              </div>
              <div className="space-y-3">
                <input
                  type="number"
                  placeholder={`Amount (min ${MIN_WITHDRAWAL} USDT)`}
                  value={withdrawAmount}
                  onChange={e => setWithdrawAmount(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-xl"
                  step="0.01"
                />
                <input
                  type="text"
                  placeholder="BSC Address (0x...)"
                  value={withdrawAddress}
                  onChange={e => setWithdrawAddress(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-xl font-mono text-sm"
                />
                <button
                  onClick={handleWithdraw}
                  disabled={isWithdrawing}
                  className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50"
                >
                  {isWithdrawing ? <Clock className="w-5 h-5 animate-spin mx-auto" /> : 'Request Withdrawal'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            {/* Deposit History */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Deposit History</h3>
              {transactions.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm">No deposits yet.</p>
              ) : (
                <div className="space-y-2">
                  {transactions.map(tx => (
                    <div key={tx.id} className="flex justify-between items-center text-sm">
                      <div>
                        <span className="font-medium">{tx.amount} USDT</span>
                        <span className="ml-2 text-gray-500">{tx.status}</span>
                      </div>
                      <span className="text-xs text-gray-400">{new Date(tx.created_at).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Withdrawal History */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Withdrawal History</h3>
              {withdrawals.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm">No withdrawals yet.</p>
              ) : (
                <div className="space-y-2">
                  {withdrawals.map(w => (
                    <div key={w.id} className="flex justify-between items-center text-sm">
                      <div>
                        <span className="font-medium">{w.amount} USDT</span>
                        <span className="ml-2 text-gray-500">{w.status}</span>
                      </div>
                      <span className="text-xs text-gray-400">{new Date(w.created_at).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}