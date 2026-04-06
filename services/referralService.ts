import {
  doc, getDoc, setDoc, addDoc, collection,
  query, where, getDocs, updateDoc, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';

// ─── Code generation ──────────────────────────────────────────────────────────

/**
 * Derive a deterministic CLX-XXXXXX code from a wallet address or user uid.
 * Uses the first 6 hex chars (after 0x) for wallet addresses.
 */
export function generateReferralCode(identifier: string): string {
  const cleaned = identifier.replace(/^0x/i, '').toUpperCase();
  return `CLX-${cleaned.slice(0, 6)}`;
}

// ─── URL parameter helper ─────────────────────────────────────────────────────

const REF_STORAGE_KEY = 'clarix_pending_ref';

/** Call once on app load to capture ?ref= from the URL. */
export function captureRefParam(): void {
  const params = new URLSearchParams(window.location.search);
  const ref = params.get('ref');
  if (ref && /^CLX-[0-9A-F]{6}$/i.test(ref)) {
    sessionStorage.setItem(REF_STORAGE_KEY, ref.toUpperCase());
  }
}

/** Returns the pending referral code captured from the URL (if any). */
export function getPendingRef(): string | null {
  return sessionStorage.getItem(REF_STORAGE_KEY);
}

/** Clears the pending ref (after it has been saved to the user doc). */
export function clearPendingRef(): void {
  sessionStorage.removeItem(REF_STORAGE_KEY);
}

// ─── Firestore ops ───────────────────────────────────────────────────────────

/**
 * Ensure the user document contains a referralCode.
 * Returns the code (existing or newly generated).
 */
export async function ensureReferralCode(
  uid: string,
  identifier: string, // walletAddress or uid
): Promise<string> {
  const ref = doc(db, 'users', uid);
  const snap = await getDoc(ref);
  if (snap.exists() && snap.data().referralCode) {
    return snap.data().referralCode as string;
  }
  const code = generateReferralCode(identifier || uid);
  await setDoc(ref, { referralCode: code }, { merge: true });
  return code;
}

/**
 * Save the referrer code on the new user's document (called at signup/wallet connect).
 * No-ops if the user already has a referredBy value.
 */
export async function saveReferredBy(uid: string, referrerCode: string): Promise<void> {
  const ref = doc(db, 'users', uid);
  const snap = await getDoc(ref);
  if (snap.exists() && snap.data().referredBy) return; // already set
  await setDoc(ref, { referredBy: referrerCode }, { merge: true });
}

// ─── Reward trigger ───────────────────────────────────────────────────────────

/**
 * Called when a referred user completes their very first lesson.
 * - Awards the referred user 5 $PATH (stored in their doc for App.tsx to apply)
 * - Writes a referral_events doc so the referrer can claim their 15 $PATH
 */
export async function triggerReferralRewards(
  referredUid: string,
  referredWallet: string | undefined,
  referrerCode: string,
): Promise<void> {
  // Check event hasn't already been fired
  const eventsQ = query(
    collection(db, 'referral_events'),
    where('referredUid', '==', referredUid),
  );
  const existing = await getDocs(eventsQ);
  if (!existing.empty) return; // already triggered

  // Write event — referrer will process this on next load
  await addDoc(collection(db, 'referral_events'), {
    referrerCode,
    referredUid,
    referredWallet: referredWallet ?? null,
    referrerRewarded: false,
    referredRewarded: false,
    createdAt: serverTimestamp(),
  });
}

/**
 * Checks for unclaimed referral rewards for the given referrer code.
 * Returns the number of new conversions to reward (each worth 15 tokens).
 * Marks events as rewarded.
 */
export async function claimReferrerRewards(referralCode: string): Promise<number> {
  const q = query(
    collection(db, 'referral_events'),
    where('referrerCode', '==', referralCode),
    where('referrerRewarded', '==', false),
  );
  const snap = await getDocs(q);
  if (snap.empty) return 0;

  const updates = snap.docs.map(d =>
    updateDoc(d.ref, { referrerRewarded: true })
  );
  await Promise.all(updates);
  return snap.docs.length;
}

// ─── Stats ────────────────────────────────────────────────────────────────────

export interface ReferralStats {
  totalReferrals: number;
  tokensEarned: number;
}

export async function getReferralStats(referralCode: string): Promise<ReferralStats> {
  const q = query(
    collection(db, 'referral_events'),
    where('referrerCode', '==', referralCode),
    where('referrerRewarded', '==', true),
  );
  const snap = await getDocs(q);
  return {
    totalReferrals: snap.size,
    tokensEarned: snap.size * 15,
  };
}
