import { supabase } from './api';

// BSC Configuration
const BSC_CONFIG = {
  chain: 'bsc',
  rpcUrl: 'https://bsc-dataseed.binance.org/',
  usdtContract: '0x55d398326f99059fF775485246999027B3197955',
  bscscanApiUrl: 'https://api.bscscan.com/api',
  requiredConfirmations: 12,
  depositAddress: '0xF4b991bD77ABeF8964a1451B127316d2a66330cb',
};

const BSCSCAN_API_KEY = import.meta.env.VITE_BSCSCAN_API_KEY || '';
const USDT_TO_NGC_RATE = 1000;

// ==================== PAYMENT VERIFICATION ====================

export async function verifyTransaction(txHash: string): Promise<{
  valid: boolean;
  from?: string;
  to?: string;
  amount?: number;
  confirmations?: number;
  status?: string;
  blockNumber?: number;
  error?: string;
}> {
  try {
    const txResponse = await fetch(
      `${BSC_CONFIG.bscscanApiUrl}?module=transaction&action=gettxreceiptstatus&txhash=${txHash}&apikey=${BSCSCAN_API_KEY}`
    );
    const txData = await txResponse.json();

    if (txData.status !== '1' || txData.result.status !== '1') {
      return { valid: false, error: 'Transaction not confirmed or failed' };
    }

    const detailsResponse = await fetch(
      `${BSC_CONFIG.bscscanApiUrl}?module=transaction&action=gettxinfo&txhash=${txHash}&apikey=${BSCSCAN_API_KEY}`
    );
    const detailsData = await detailsResponse.json();

    if (detailsData.status !== '1') {
      return { valid: false, error: 'Could not fetch transaction details' };
    }

    const tx = detailsData.result;

    if (tx.input && tx.input.startsWith('0xa9059cbb')) {
      const tokenResponse = await fetch(
        `${BSC_CONFIG.bscscanApiUrl}?module=account&action=tokentx&contractaddress=${BSC_CONFIG.usdtContract}&txhash=${txHash}&apikey=${BSCSCAN_API_KEY}`
      );
      const tokenData = await tokenResponse.json();

      if (tokenData.status !== '1' || !tokenData.result || tokenData.result.length === 0) {
        return { valid: false, error: 'Not a USDT BEP-20 transfer' };
      }

      const tokenTx = tokenData.result[0];
      const amount = parseFloat(tokenTx.value) / Math.pow(10, 18);
      const toAddress = tokenTx.to.toLowerCase();
      const fromAddress = tokenTx.from.toLowerCase();

      if (toAddress !== BSC_CONFIG.depositAddress.toLowerCase()) {
        return { valid: false, error: 'Transaction not sent to deposit address' };
      }

      const blockResponse = await fetch(
        `${BSC_CONFIG.bscscanApiUrl}?module=proxy&action=eth_blockNumber&apikey=${BSCSCAN_API_KEY}`
      );
      const blockData = await blockResponse.json();
      const currentBlock = parseInt(blockData.result, 16);
      const txBlock = parseInt(tokenTx.blockNumber);
      const confirmations = currentBlock - txBlock;

      if (confirmations < BSC_CONFIG.requiredConfirmations) {
        return { 
          valid: false, 
          error: `Waiting for confirmations: ${confirmations}/${BSC_CONFIG.requiredConfirmations}`,
          confirmations 
        };
      }

      return {
        valid: true,
        from: fromAddress,
        to: toAddress,
        amount,
        confirmations,
        status: 'confirmed',
        blockNumber: txBlock
      };
    }

    return { valid: false, error: 'Not a USDT BEP-20 token transfer' };

  } catch (error) {
    console.error('Verification error:', error);
    return { valid: false, error: 'Verification failed: ' + (error as Error).message };
  }
}

// ==================== DEPOSIT PROCESSING ====================

export async function processDeposit(userId: string, txHash: string): Promise<{
  success: boolean;
  ngcAmount?: number;
  message?: string;
  error?: string;
}> {
  try {
    const { data: existing } = await supabase
      .from('payment_transactions')
      .select('*')
      .eq('tx_hash', txHash)
      .single();

    if (existing) {
      if (existing.status === 'confirmed') {
        return { success: false, error: 'Transaction already processed' };
      }
    }

    const verification = await verifyTransaction(txHash);

    if (!verification.valid) {
      await supabase.from('verification_logs').insert({
        tx_hash: txHash,
        status: 'failed',
        error_message: verification.error
      });
      return { success: false, error: verification.error };
    }

    const ngcAmount = (verification.amount || 0) * USDT_TO_NGC_RATE;

    const { data: payment, error: paymentError } = await supabase
      .from('payment_transactions')
      .upsert({
        user_id: userId,
        tx_hash: txHash,
        from_address: verification.from,
        to_address: verification.to,
        amount: verification.amount,
        token_symbol: 'USDT',
        token_contract: BSC_CONFIG.usdtContract,
        chain: 'bsc',
        status: 'confirmed',
        confirmations: verification.confirmations,
        block_number: verification.blockNumber,
        verified_at: new Date().toISOString()
      })
      .select()
      .single();

    if (paymentError) throw paymentError;

    const { data: balance } = await supabase
      .from('user_balances')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (balance) {
      await supabase
        .from('user_balances')
        .update({
          ngc_balance: balance.ngc_balance + ngcAmount,
          usdt_balance: balance.usdt_balance + (verification.amount || 0),
          total_deposited: balance.total_deposited + (verification.amount || 0),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);
    } else {
      await supabase
        .from('user_balances')
        .insert({
          user_id: userId,
          ngc_balance: ngcAmount,
          usdt_balance: verification.amount || 0,
          total_deposited: verification.amount || 0
        });
    }

    await supabase.from('coin_transactions').insert({
      user_id: userId,
      type: 'deposit',
      amount: ngcAmount,
      usdt_equivalent: verification.amount,
      description: `Deposit via BSC: ${txHash}`,
      payment_tx_id: payment.id
    });

    await supabase.from('verification_logs').insert({
      tx_hash: txHash,
      status: 'success',
      response_data: verification
    });

    return {
      success: true,
      ngcAmount,
      message: `Successfully added ${ngcAmount} NGC to your balance!`
    };

  } catch (error) {
    console.error('Deposit processing error:', error);
    return { success: false, error: 'Processing failed: ' + (error as Error).message };
  }
}

// ==================== AD REWARDS (Google AdSense) ====================

export async function processAdReward(userId: string, durationSeconds: number = 15): Promise<{
  success: boolean;
  ngcAmount?: number;
  message?: string;
  error?: string;
}> {
  try {
    const ngcReward = 5; // 5 NGC per 15 seconds
    const today = new Date().toISOString().split('T')[0];

    // Check daily limits
    const { data: dailyLimit } = await supabase
      .from('daily_ad_limits')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .single();

    if (dailyLimit) {
      if (dailyLimit.ads_watched >= dailyLimit.max_ads) {
        return { success: false, error: 'Daily ad limit reached (20 ads)' };
      }
      if (dailyLimit.ngc_earned >= dailyLimit.max_ngc) {
        return { success: false, error: 'Daily NGC limit reached (100 NGC)' };
      }
    }

    // Record ad reward
    await supabase.from('ad_rewards').insert({
      user_id: userId,
      ad_type: 'google_adsense',
      duration_seconds: durationSeconds,
      ngc_reward: ngcReward,
      watched_at: new Date().toISOString()
    });

    // Update or create daily limit
    if (dailyLimit) {
      await supabase
        .from('daily_ad_limits')
        .update({
          ads_watched: dailyLimit.ads_watched + 1,
          ngc_earned: dailyLimit.ngc_earned + ngcReward,
          updated_at: new Date().toISOString()
        })
        .eq('id', dailyLimit.id);
    } else {
      await supabase.from('daily_ad_limits').insert({
        user_id: userId,
        date: today,
        ads_watched: 1,
        ngc_earned: ngcReward
      });
    }

    // Update user balance
    const { data: balance } = await supabase
      .from('user_balances')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (balance) {
      await supabase
        .from('user_balances')
        .update({
          ngc_balance: balance.ngc_balance + ngcReward,
          total_earned_ads: balance.total_earned_ads + ngcReward,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);
    } else {
      await supabase.from('user_balances').insert({
        user_id: userId,
        ngc_balance: ngcReward,
        total_earned_ads: ngcReward
      });
    }

    // Record transaction
    await supabase.from('coin_transactions').insert({
      user_id: userId,
      type: 'ad_reward',
      amount: ngcReward,
      description: `Ad reward: ${durationSeconds}s Google AdSense`
    });

    return {
      success: true,
      ngcAmount: ngcReward,
      message: `Earned ${ngcReward} NGC for watching ad!`
    };

  } catch (error) {
    console.error('Ad reward error:', error);
    return { success: false, error: 'Failed to process ad reward' };
  }
}

// ==================== PREMIUM CHAPTER PURCHASE ====================

export async function purchasePremiumChapter(userId: string, chapterId: string): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
    // Get chapter details
    const { data: chapter } = await supabase
      .from('chapters')
      .select('*, novel:novels(*)')
      .eq('id', chapterId)
      .single();

    if (!chapter) {
      return { success: false, error: 'Chapter not found' };
    }

    if (!chapter.is_premium || chapter.price_ngc <= 0) {
      return { success: false, error: 'Chapter is not premium' };
    }

    // Check user balance
    const { data: balance } = await supabase
      .from('user_balances')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!balance || balance.ngc_balance < chapter.price_ngc) {
      return { success: false, error: `Insufficient NGC. Need ${chapter.price_ngc} NGC` };
    }

    // Deduct balance
    await supabase
      .from('user_balances')
      .update({
        ngc_balance: balance.ngc_balance - chapter.price_ngc,
        total_spent: balance.total_spent + chapter.price_ngc,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    // Record purchase
    const { data: purchase } = await supabase
      .from('premium_purchases')
      .insert({
        user_id: userId,
        chapter_id: chapterId,
        novel_id: chapter.novel_id,
        price_paid: chapter.price_ngc
      })
      .select()
      .single();

    // Record transaction
    await supabase.from('coin_transactions').insert({
      user_id: userId,
      type: 'premium_chapter',
      amount: -chapter.price_ngc,
      description: `Purchased premium chapter: ${chapter.title}`,
      related_chapter_id: chapterId,
      related_novel_id: chapter.novel_id
    });

    // Add author earnings
    await supabase.from('author_earnings').insert({
      author_id: chapter.novel?.author_id,
      source: 'premium_chapter',
      amount_ngc: purchase.author_earns_ngc,
      novel_id: chapter.novel_id,
      chapter_id: chapterId,
      reader_id: userId,
      description: `Premium chapter purchase: ${chapter.title}`
    });

    return {
      success: true,
      message: `Successfully purchased chapter for ${chapter.price_ngc} NGC!`
    };

  } catch (error) {
    console.error('Premium purchase error:', error);
    return { success: false, error: 'Failed to purchase chapter' };
  }
}

// ==================== DIRECT SUPPORT ====================

export async function directSupportAuthor(
  supporterId: string,
  authorId: string,
  amount: number,
  message: string = '',
  novelId?: string,
  chapterId?: string
): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
    if (amount < 10) {
      return { success: false, error: 'Minimum support is 10 NGC' };
    }

    // Check balance
    const { data: balance } = await supabase
      .from('user_balances')
      .select('*')
      .eq('user_id', supporterId)
      .single();

    if (!balance || balance.ngc_balance < amount) {
      return { success: false, error: `Insufficient NGC. Need ${amount} NGC` };
    }

    // Deduct from supporter
    await supabase
      .from('user_balances')
      .update({
        ngc_balance: balance.ngc_balance - amount,
        total_spent: balance.total_spent + amount,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', supporterId);

    // Record support
    const { data: support } = await supabase
      .from('direct_supports')
      .insert({
        supporter_id: supporterId,
        author_id: authorId,
        novel_id: novelId,
        chapter_id: chapterId,
        amount_ngc: amount,
        message
      })
      .select()
      .single();

    // Add to author balance
    const { data: authorBalance } = await supabase
      .from('user_balances')
      .select('*')
      .eq('user_id', authorId)
      .single();

    if (authorBalance) {
      await supabase
        .from('user_balances')
        .update({
          ngc_balance: authorBalance.ngc_balance + support.author_earns_ngc,
          total_earned_donations: authorBalance.total_earned_donations + support.author_earns_ngc,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', authorId);
    } else {
      await supabase.from('user_balances').insert({
        user_id: authorId,
        ngc_balance: support.author_earns_ngc,
        total_earned_donations: support.author_earns_ngc
      });
    }

    // Record transaction for supporter
    await supabase.from('coin_transactions').insert({
      user_id: supporterId,
      type: 'direct_support',
      amount: -amount,
      description: `Supported author: ${amount} NGC`,
      related_user_id: authorId,
      related_novel_id: novelId,
      related_chapter_id: chapterId
    });

    // Record earnings for author
    await supabase.from('author_earnings').insert({
      author_id: authorId,
      source: 'direct_support',
      amount_ngc: support.author_earns_ngc,
      novel_id: novelId,
      chapter_id: chapterId,
      reader_id: supporterId,
      description: `Direct support: ${message || 'No message'}`
    });

    return {
      success: true,
      message: `Successfully supported author with ${amount} NGC! Author receives ${support.author_earns_ngc} NGC (95%)`
    };

  } catch (error) {
    console.error('Direct support error:', error);
    return { success: false, error: 'Failed to process support' };
  }
}

// ==================== WITHDRAWAL ====================

export async function requestWithdrawal(
  userId: string,
  amount: number,
  toAddress: string
): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
    if (!toAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      return { success: false, error: 'Invalid BSC address' };
    }

    if (amount < 10) {
      return { success: false, error: 'Minimum withdrawal is 10 USDT' };
    }

    const { data: balance } = await supabase
      .from('user_balances')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!balance || balance.usdt_balance < amount) {
      return { success: false, error: 'Insufficient USDT balance' };
    }

    const { data: withdrawal } = await supabase
      .from('withdrawal_requests')
      .insert({
        user_id: userId,
        amount,
        to_address: toAddress,
        status: 'pending'
      })
      .select()
      .single();

    return {
      success: true,
      message: 'Withdrawal request submitted. Processing will begin automatically.'
    };

  } catch (error) {
    return { success: false, error: 'Withdrawal request failed' };
  }
}

// ==================== BALANCE & FEATURES ====================

export async function getUserBalance(userId: string) {
  const { data, error } = await supabase
    .from('user_balances')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;

  if (!data) {
    return {
      ngc_balance: 0,
      usdt_balance: 0,
      total_deposited: 0,
      total_withdrawn: 0,
      total_spent: 0,
      total_earned_ads: 0,
      total_earned_donations: 0
    };
  }

  return data;
}

export async function getFeatureStoreItems() {
  const { data, error } = await supabase
    .from('feature_store_items')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return data;
}

export async function purchaseFeature(userId: string, featureId: string): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
    const { data: feature } = await supabase
      .from('feature_store_items')
      .select('*')
      .eq('id', featureId)
      .single();

    if (!feature) {
      return { success: false, error: 'Feature not found' };
    }

    const { data: balance } = await supabase
      .from('user_balances')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!balance || balance.ngc_balance < feature.price_ngc) {
      return { success: false, error: 'Insufficient NGC balance' };
    }

    await supabase
      .from('user_balances')
      .update({
        ngc_balance: balance.ngc_balance - feature.price_ngc,
        total_spent: balance.total_spent + feature.price_ngc,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    const expiresAt = feature.duration_days 
      ? new Date(Date.now() + feature.duration_days * 24 * 60 * 60 * 1000).toISOString()
      : null;

    await supabase
      .from('user_features')
      .upsert({
        user_id: userId,
        feature_id: featureId,
        expires_at: expiresAt,
        is_active: true
      });

    await supabase.from('coin_transactions').insert({
      user_id: userId,
      type: 'spend',
      amount: -feature.price_ngc,
      description: `Purchased: ${feature.name}`
    });

    return {
      success: true,
      message: `Successfully purchased ${feature.name}!`
    };

  } catch (error) {
    return { success: false, error: 'Purchase failed' };
  }
}

export async function getUserFeatures(userId: string) {
  const { data, error } = await supabase
    .from('user_features')
    .select('*, feature:feature_store_items(*)')
    .eq('user_id', userId)
    .eq('is_active', true);

  if (error) throw error;
  return data;
}

// ==================== AUTO-WORKER FUNCTIONS ====================

export async function processPendingWithdrawals(): Promise<{
  processed: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let processed = 0;

  try {
    const { data: pending } = await supabase
      .from('withdrawal_requests')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(10);

    if (!pending || pending.length === 0) {
      return { processed: 0, errors: [] };
    }

    for (const withdrawal of pending) {
      try {
        await supabase
          .from('withdrawal_requests')
          .update({
            status: 'processing',
            processed_at: new Date().toISOString()
          })
          .eq('id', withdrawal.id);

        processed++;
      } catch (err) {
        errors.push(`Withdrawal ${withdrawal.id}: ${(err as Error).message}`);
      }
    }

    return { processed, errors };

  } catch (error) {
    return { processed: 0, errors: [(error as Error).message] };
  }
}

export async function getDailyAdStats(userId: string) {
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('daily_ad_limits')
    .select('*')
    .eq('user_id', userId)
    .eq('date', today)
    .single();

  if (error && error.code !== 'PGRST116') throw error;

  return data || {
    ads_watched: 0,
    ngc_earned: 0,
    max_ads: 20,
    max_ngc: 100
  };
}
