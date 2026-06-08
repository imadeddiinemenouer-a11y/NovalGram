import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Copy, CheckCircle, ArrowRight, Wallet, AlertTriangle, RefreshCw, History } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { processDeposit, getUserBalance, supabase } from '../utils/api';
import { formatNumber } from '../utils/helpers';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const DEPOSIT_ADDRESS = '0xF4b991bD77ABeF8964a1451B127316d2a66330cb';
const USDT_CONTRACT = '0x55d398326f99059fF775485246999027B3197955';

export default function DepositPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [txHash, setTxHash] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [balance, setBalance] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'deposit' | 'history'>('deposit');

  useEffect(() => {
    if (user) {
      loadBalance();
      loadTransactions();
    }
  }, [user]);

  async function loadBalance() {
    if (!user) return;
    try {
      const data = await getUserBalance(user.id);
      setBalance(data);
    } catch (error) {
      console.error('Error loading balance:', error);
    }
  }

  async function loadTransactions() {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('payment_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (!error) setTransactions(data || []);
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  }

  function copyAddress() {
    navigator.clipboard.writeText(DEPOSIT_ADDRESS);
    setCopied(true);
    toast.success('Address copied!');
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleVerify() {
    if (!user || !txHash.trim()) {
      toast.error('Please enter transaction hash');
      return;
    }

    // Validate txHash format
    if (!txHash.match(/^0x[a-fA-F0-9]{64}$/)) {
      toast.error('Invalid transaction hash format');
      return;
    }

    setIsVerifying(true);
    try {
      const result = await processDeposit(user.id, txHash.trim());

      if (result.success) {
        toast.success(result.message || 'Deposit successful!');
        setTxHash('');
        loadBalance();
        loadTransactions();
      } else {
        toast.error(result.error || 'Verification failed');
      }
    } catch (error) {
      toast.error('Verification error');
    } finally {
      setIsVerifying(false);
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Wallet className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Sign in to access wallet</h2>
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
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-2">Wallet</h1>
          <p className="text-indigo-100">Manage your Novelgram Coins</p>

          {/* Balance Cards */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-indigo-200 text-sm mb-1">NGC Balance</p>
              <p className="text-3xl font-bold">{formatNumber(balance?.ngc_balance || 0)}</p>
              <p className="text-xs text-indigo-200">Novelgram Coins</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-indigo-200 text-sm mb-1">USDT Balance</p>
              <p className="text-3xl font-bold">{balance?.usdt_balance || 0}</p>
              <p className="text-xs text-indigo-200">BSC Network</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-14 z-30">
        <div className="max-w-4xl mx-auto px-4 flex gap-4">
          <button
            onClick={() => setActiveTab('deposit')}
            className={`py-3 px-4 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'deposit'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Deposit
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
        {activeTab === 'deposit' ? (
          <div className="space-y-6">
            {/* Step 1: Deposit Address */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-sm">1</div>
                <h2 className="font-semibold text-lg">Send USDT to this address</h2>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-800">Important:</p>
                    <p className="text-sm text-amber-700">Only send USDT (BEP-20) on BNB Smart Chain. Sending other tokens or using wrong network will result in permanent loss.</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-900 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Deposit Address (BSC)</span>
                  <button
                    onClick={copyAddress}
                    className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span className="text-sm">{copied ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
                <p className="text-white font-mono text-sm break-all">{DEPOSIT_ADDRESS}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-500">Network</p>
                  <p className="font-medium">BNB Smart Chain (BSC)</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-500">Token</p>
                  <p className="font-medium">USDT (BEP-20)</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-500">Min Deposit</p>
                  <p className="font-medium">1 USDT</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-500">Rate</p>
                  <p className="font-medium">1 USDT = 1000 NGC</p>
                </div>
              </div>
            </div>

            {/* Step 2: Enter TxHash */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-sm">2</div>
                <h2 className="font-semibold text-lg">Enter Transaction Hash</h2>
              </div>

              <p className="text-sm text-gray-500 mb-4">
                After sending USDT, copy the transaction hash (TxID) from your wallet and paste it here.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Transaction Hash (TxID)
                  </label>
                  <input
                    type="text"
                    value={txHash}
                    onChange={(e) => setTxHash(e.target.value)}
                    placeholder="0x..."
                    className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono text-sm"
                  />
                </div>

                <button
                  onClick={handleVerify}
                  disabled={isVerifying || !txHash.trim()}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {isVerifying ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Verifying on Blockchain...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Verify & Add Balance
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
                  <p className="text-sm text-indigo-800">Send USDT (BEP-20) from your wallet to the deposit address above</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-indigo-200 rounded-full flex items-center justify-center text-indigo-700 text-xs font-bold flex-shrink-0">2</div>
                  <p className="text-sm text-indigo-800">Wait for confirmation on BSC (usually 1-3 minutes)</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-indigo-200 rounded-full flex items-center justify-center text-indigo-700 text-xs font-bold flex-shrink-0">3</div>
                  <p className="text-sm text-indigo-800">Copy the transaction hash (TxID) from your wallet</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-indigo-200 rounded-full flex items-center justify-center text-indigo-700 text-xs font-bold flex-shrink-0">4</div>
                  <p className="text-sm text-indigo-800">Paste it here and click verify - balance added automatically!</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-4 border-b border-gray-100">
              <h2 className="font-semibold">Transaction History</h2>
            </div>

            {transactions.length === 0 ? (
              <div className="text-center py-12">
                <History className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-gray-500">No transactions yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {transactions.map((tx) => (
                  <div key={tx.id} className="p-4 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${
                          tx.status === 'confirmed' ? 'bg-green-500' :
                          tx.status === 'pending' ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`} />
                        <span className="font-medium text-sm">{tx.status}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{tx.amount} USDT</p>
                      <p className="text-xs text-gray-400 font-mono">{tx.tx_hash.slice(0, 20)}...</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        {new Date(tx.created_at).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-400">
                        {tx.confirmations} confirmations
                      </p>
                    </div>
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
