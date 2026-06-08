import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Lock, Coins, AlertCircle, CheckCircle, Zap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { purchasePremiumChapter, getUserBalance } from '../../utils/bsc_payment';
import { formatNumber } from '../../utils/helpers';
import toast from 'react-hot-toast';

interface PremiumChapterModalProps {
  chapterId: string;
  chapterTitle: string;
  chapterPrice: number;
  novelTitle: string;
  onPurchase: () => void;
  onClose: () => void;
}

export default function PremiumChapterModal({
  chapterId,
  chapterTitle,
  chapterPrice,
  novelTitle,
  onPurchase,
  onClose
}: PremiumChapterModalProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [balance, setBalance] = useState(0);

  React.useEffect(() => {
    if (user) {
      getUserBalance(user.id).then(b => setBalance(b.ngc_balance || 0));
    }
  }, [user]);

  async function handlePurchase() {
    if (!user) {
      toast.error('Please sign in to purchase');
      return;
    }

    setIsPurchasing(true);
    try {
      const result = await purchasePremiumChapter(user.id, chapterId);

      if (result.success) {
        toast.success(result.message || 'Chapter purchased successfully!');
        onPurchase();
        onClose();
      } else {
        toast.error(result.error || 'Failed to purchase chapter');
      }
    } catch (error) {
      toast.error('Error purchasing chapter');
    } finally {
      setIsPurchasing(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">Premium Chapter</h2>
          <p className="text-gray-500 text-sm">{novelTitle}</p>
        </div>

        {/* Chapter Info */}
        <div className="bg-gray-50 rounded-xl p-4 mb-4">
          <h3 className="font-semibold text-gray-900 mb-2">{chapterTitle}</h3>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Price</span>
            <div className="flex items-center gap-1">
              <Coins className="w-4 h-4 text-yellow-500" />
              <span className="font-bold text-gray-900">{chapterPrice} NGC</span>
            </div>
          </div>
        </div>

        {/* Balance */}
        <div className="bg-indigo-50 rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-indigo-700">Your Balance</span>
            <div className="flex items-center gap-1">
              <Coins className="w-4 h-4 text-yellow-500" />
              <span className="font-bold text-indigo-900">{formatNumber(balance)} NGC</span>
            </div>
          </div>
        </div>

        {/* Price Breakdown */}
        <div className="space-y-2 mb-6">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Chapter Price</span>
            <span className="font-medium">{chapterPrice} NGC</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Platform Fee (5%)</span>
            <span className="text-red-500">-{Math.round(chapterPrice * 0.05)} NGC</span>
          </div>
          <div className="border-t border-gray-200 pt-2 flex justify-between">
            <span className="font-medium text-gray-900">Author Receives</span>
            <span className="font-bold text-green-600">{Math.round(chapterPrice * 0.95)} NGC</span>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={handlePurchase}
            disabled={isPurchasing || balance < chapterPrice}
            className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPurchasing ? (
              <span>Purchasing...</span>
            ) : balance < chapterPrice ? (
              <>
                <AlertCircle className="w-5 h-5" />
                <span>Insufficient Balance</span>
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                <span>Purchase for {chapterPrice} NGC</span>
              </>
            )}
          </button>

          {balance < chapterPrice && (
            <button
              onClick={() => {
                onClose();
                // Navigate to ad rewards page
                window.location.href = '/rewards';
              }}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-xl font-bold hover:from-yellow-500 hover:to-orange-600 transition-all"
            >
              <Coins className="w-5 h-5" />
              <span>Earn Free NGC</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="w-full py-3 text-gray-600 hover:text-gray-900 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}