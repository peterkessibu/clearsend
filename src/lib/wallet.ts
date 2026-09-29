import { createClient } from "@/lib/supabase/server";
import {
  mapBalances,
  quoteWalletExchange,
  type WalletBalances,
  type WalletExchangeQuote,
} from "@/lib/wallet-model";
import type { Currency } from "@/types";

export {
  CURRENCY_NOTES,
  WALLET_CURRENCIES,
  emptyBalances,
  isWalletCurrency,
  mapBalances,
  quoteWalletExchange,
  type WalletBalances,
  type WalletExchangeQuote,
} from "@/lib/wallet-model";

export async function getBalancesForUser(userId: string): Promise<WalletBalances> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("wallet_balances")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    throw new Error(error.message);
  }

  return mapBalances(data);
}

export async function loadWallet(
  currency: Currency,
  amount: number
): Promise<WalletBalances> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("wallet_load", {
    p_currency: currency,
    p_amount: amount,
  });

  if (error) {
    throw new Error(error.message);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return getBalancesForUser(user.id);
}

export async function exchangeWallet(
  from: Currency,
  to: Currency,
  amountIn: number
): Promise<{ quote: WalletExchangeQuote; balances: WalletBalances }> {
  const quote = quoteWalletExchange(from, to, amountIn);
  const supabase = await createClient();

  const { error } = await supabase.rpc("wallet_exchange", {
    p_from: from,
    p_to: to,
    p_amount_in: amountIn,
    p_amount_out: quote.amountOut,
    p_fee: quote.fee,
  });

  if (error) {
    const msg = error.message || "Exchange failed";
    if (/insufficient/i.test(msg)) {
      throw new Error("Insufficient balance");
    }
    throw new Error(msg);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  return {
    quote,
    balances: await getBalancesForUser(user.id),
  };
}
