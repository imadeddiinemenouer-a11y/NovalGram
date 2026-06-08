import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Heart, Send, MessageCircle, Coins, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { directSupportAuthor, getUserBalance } from '../../utils/bsc_payment';
import { formatNumber } from '../../utils/helpers';
import toast from 'react-hot-toast';

interface DirectSupportProps {
  authorId: string;
  authorName: string;
  novelId?: string;
  chapterId?: string;
  onSupport?: () => void;
}

export default function DirectSupport({ 
  authorId, 
  authorName, 
  novelId, 
  chapterId,
  onSupport 
}: DirectSupportProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [amount, setAmount] = useState(50);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [balance, setBalance] = useState(0);

  const presetAmounts = [10, 50, 100, 500, 1000];

  async function handleSupport() {
    if (!user) {
      toast.error('Please sign in to support authors');
      return;
    }

    if (amount < 10) {
      toast.error('Minimum support is 10 NGC');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await directSupportAuthor(
        user.id,
        authorId,
        amount,
        message,
        novelId,
        chapterId
      );

      if (result.success) {
        toast.success(result.message || `Supported ${authorName} with ${amount} NGC!`);
        setShowForm(false);
        setMessage('');
        if (onSupport) onSupport();
      } else {
        toast.error(result.error || 'Failed to send support');
      }
    } catch (error) {
      toast.error('Error sending support');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!showForm) {
    return (
      <button
        onClick={() => {
          if (!user) {
            toast.error('Please sign in first');
            return;
          }
          setShowForm(true);
          getUserBalance(user.id).then(b => setBalance(b.ngc_balance || 0));
        }}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl hover:from-pink-600 hover:to-rose-600 transition-all font-medium"
      >
        <Heart className="w-4 h-4" />
        <span>Support Author</span>
      </button>
    );
  }

  return (
    <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl p-6 border border-pink-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-pink-500" />
          <span className="font-semibold text-gray-900">Support {authorName}</span>
        </div>
        <button 
          onClick={() => setShowForm(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-600">Your Balance</span>
          <span className="font-semibold text-gray-900">{formatNumber(balance)} NGC</span>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <Coins className="w-4 h-4 text-yellow-500" />
          <span className="text-sm text-gray-500">Author receives 95% (Platform takes 5%)</span>
        </div>
      </div>

      {/* Preset Amounts */}
      <div className="grid grid-cols-5 gap-2 mb-4">
        {presetAmounts.map(amt => (
          <button
            key={amt}
            onClick={() => setAmount(amt)}
            className={`py-2 rounded-lg text-sm font-medium transition-all ${
              amount === amt 
                ? 'bg-pink-500 text-white' 
                : 'bg-white border border-gray-200 text-gray-700 hover:border-pink-300'
            }`}
          >
            {amt}
          </button>
        ))}
      </div>

      {/* Custom Amount */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Custom Amount (NGC)
        </label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(Math.max(10, parseInt(e.target.value) || 0))}
          min={10}
          className="w-full px-4 py-3 bg-white rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500"
        />
      </div>

      {/* Message */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Message (Optional)
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Send a message to the author..."
          rows={3}
          className="w-full px-4 py-3 bg-white rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
        />
      </div>

      {/* Summary */}
      <div className="bg-white rounded-xl p-4 mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600">Your Support</span>
          <span className="font-semibold">{amount} NGC</span>
        </div>
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600">Platform Fee (5%)</span>
          <span className="text-red-500">-{Math.round(amount * 0.05)} NGC</span>
        </div>
        <div className="border-t border-gray-200 pt-2 flex justify-between">
          <span className="font-medium text-gray-900">Author Receives</span>
          <span className="font-bold text-green-600">{Math.round(amount * 0.95)} NGC</span>
        </div>
      </div>

      {/* Submit */}
      <button
        onClick={handleSupport}
        disabled={isSubmitting || amount > balance}
        className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-bold hover:from-pink-600 hover:to-rose-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <span>Sending...</span>
        ) : (
          <>
            <Send className="w-5 h-5" />
            <span>Send {amount} NGC Support</span>
          </>
        )}
      </button>

      {amount > balance && (
        <div className="flex items-center gap-2 mt-3 text-red-500 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>Insufficient balance. Earn NGC by watching ads.</span>
        </div>
      )}
    </div>
  );
}