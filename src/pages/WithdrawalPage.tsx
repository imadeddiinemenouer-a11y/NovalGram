import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, Wallet, AlertTriangle, CheckCircle, History, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { requestWithdrawal, getUserBalance, supabase } from '../utils/api';
import { formatNumber } from '../utils/helpers';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

export default function WithdrawalPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');
  const [balance, setBalance] = useState<any>(null);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'withdraw' | 'history'>('withdraw');

  useEffect(() => {
    if (user) {
      loadBalance();
      loadWithdrawals();
    }
  }, [user]);

  async function loadBalance() {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('user_balances')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!error) setBalance(data);
    } catch (error) {
      console.error('Error loading balance:', error);
    }
  }

  async function loadWithdrawals() {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('withdrawal_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!error) setWithdrawals(data || []);
    } catch (error) {
      console.error('Error loading withdrawals:', error);
    }
  }

  async function handleWithdraw() {
    if (!user) return;

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (numAmount < 10) {
      toast.error('Minimum withdrawal is 10 USDT');
      return;
    }

    if (!address.match(/^0x[a-fA-F0-9]{40}$/)) {
      toast.error('Invalid BSC address format');
      return;
    }

    if (!balance || balance.usdt_balance < numAmount) {
      toast.error('Insufficient USDT balance');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await requestWithdrawal(user.id, numAmount, address);

      if (result.success) {
        toast.success(result.message || 'Withdrawal request submitted!');
        setAmount('');
        setAddress('');
        loadBalance();
        loadWithdrawals();
      } else {
        toast.error(result.error || 'Withdrawal failed');
      }
    } catch (error) {
      toast.error('Withdrawal error');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Wallet className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Sign in to access withdrawals</h2>
          <button 
            onClick={() => navigate('/login')}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-green-600 via-emerald-600 to-teal-500 text-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-2">Withdraw</h1>
          <p className="text-emerald-100">Withdraw your earnings to your wallet</p>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mt-6">
            <p className="text-emerald-200 text-sm mb-1">Available Balance</p>
            <p className="text-3xl font-bold">{balance?.usdt_balance || 0} USDT</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-14 z-30">
        <div className="max-w-4xl mx-auto px-4 flex gap-4">
          <button
            onClick={() => setActiveTab('withdraw')}
            className={`py-3 px-4 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'withdraw'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Withdraw
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-3 px-4 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'history'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            History
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {activeTab === 'withdraw' ? (
          <div className="space-y-6">
            {/* Withdrawal Form */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="font-semibold text-lg mb-4">Withdraw USDT</h2>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-800">Important:</p>
                    <ul className="text-sm text-amber-700 mt-1 space-y-1">
                      <li>• Minimum withdrawal: 10 USDT</li>
                      <li>• Network: BNB Smart Chain (BSC) only</li>
                      <li>• Double-check your address - transactions cannot be reversed</li>
                      <li>• Processing time: 1-24 hours</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount (USDT)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="Min 10 USDT"
                      min="10"
                      step="0.01"
                      className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    <button
                      onClick={() => setAmount(balance?.usdt_balance?.toString() || '0')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                      Max
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Available: {balance?.usdt_balance || 0} USDT
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    BSC Address (Recipient)
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="0x..."
                    className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Must be a BNB Smart Chain address
                  </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-500">Amount</span>
                    <span className="font-medium">{amount || 0} USDT</span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-500">Network Fee</span>
                    <span className="font-medium">~0.5 USDT</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 flex justify-between">
                    <span className="font-medium">Total Receive</span>
                    <span className="font-bold text-indigo-600">
                      {Math.max(0, parseFloat(amount || '0') - 0.5).toFixed(2)} USDT
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleWithdraw}
                  disabled={isSubmitting || !amount || !address}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {isSubmitting ? (
                    <>
                      <Clock className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <ArrowUpRight className="w-5 h-5" />
                      Request Withdrawal
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* How it works */}
            <div className="bg-indigo-50 rounded-xl p-6">
              <h3 className="font-semibold text-indigo-900 mb-3">How it works</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-indigo-200 rounded-full flex items-center justify-center text-indigo-700 text-xs font-bold flex-shrink-0">1</div>
                  <p className="text-sm text-indigo-800">Submit withdrawal request with your BSC address</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-indigo-200 rounded-full flex items-center justify-center text-indigo-700 text-xs font-bold flex-shrink-0">2</div>
                  <p className="text-sm text-indigo-800">System processes automatically (1-24 hours)</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-indigo-200 rounded-full flex items-center justify-center text-indigo-700 text-xs font-bold flex-shrink-0">3</div>
                  <p className="text-sm text-indigo-800">USDT arrives in your wallet on BSC network</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-4 border-b border-gray-100">
              <h2 className="font-semibold">Withdrawal History</h2>
            </div>

            {withdrawals.length === 0 ? (
              <div className="text-center py-12">
                <History className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-gray-500">No withdrawals yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {withdrawals.map((w) => (
                  <div key={w.id} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${
                          w.status === 'completed' ? 'bg-green-500' :
                          w.status === 'processing' ? 'bg-blue-500' :
                          w.status === 'pending' ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`} />
                        <span className="font-medium text-sm capitalize">{w.status}</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900">{w.amount} USDT</span>
                    </div>
                    <p className="text-xs text-gray-500 font-mono">{w.to_address.slice(0, 15)}...{w.to_address.slice(-10)}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(w.created_at).toLocaleString()}
                    </p>
                    {w.tx_hash && (
                      <p className="text-xs text-indigo-600 mt-1">
                        Tx: {w.tx_hash.slice(0, 20)}...
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
