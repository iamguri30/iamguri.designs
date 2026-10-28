import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  updateProfile,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  User
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';

export interface AdminAuthState {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  error: string | null;
}

export const ADMIN_EMAIL_ALLOWLIST = ['gk9192101@gmail.com'];

export async function checkIsUserAdmin(user: User | null): Promise<boolean> {
  if (!user) return false;
  if (user.email && ADMIN_EMAIL_ALLOWLIST.includes(user.email.toLowerCase())) {
    return true;
  }
  try {
    const adminDoc = await getDoc(doc(db, 'admins', user.uid));
    if (adminDoc.exists()) return true;
  } catch (err) {
    console.warn('Error verifying admin document:', err);
  }
  return false;
}

export async function loginWithGoogle(): Promise<User> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const result = await signInWithPopup(auth, provider);
  return result.user;
}

export async function loginWithEmail(email: string, pass: string): Promise<User> {
  try {
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    return cred.user;
  } catch (error: any) {
    if (error.code === 'auth/operation-not-allowed') {
      throw new Error('Email/Password provider is not yet enabled in the Firebase Console. You can sign in instantly with Google, or enable Email/Password in Firebase Authentication settings.');
    }
    throw error;
  }
}

export async function logoutUser(): Promise<void> {
  await fbSignOut(auth);
}

/**
 * Updates administrator display name / username in Firebase Auth and Firestore admins document
 */
export async function updateAdminUsername(username: string): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error('No authenticated user found.');

  // 1. Update Firebase Auth Profile
  await updateProfile(user, { displayName: username.trim() });

  // 2. Persist in admins collection
  try {
    await setDoc(doc(db, 'admins', user.uid), {
      username: username.trim(),
      email: user.email,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } catch (err) {
    console.warn('Could not update admin document in Firestore:', err);
  }
}

/**
 * Updates administrator password in Firebase Auth with automatic reauthentication if current password is provided
 */
export async function updateAdminPassword(newPassword: string, currentPassword?: string): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error('No authenticated user found.');
  if (!user.email) throw new Error('User has no associated email.');

  if (newPassword.length < 6) {
    throw new Error('New password must be at least 6 characters long.');
  }

  try {
    // If current password provided, re-authenticate first to prevent 'requires-recent-login'
    if (currentPassword) {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
    }
    await updatePassword(user, newPassword);
  } catch (error: any) {
    if (error.code === 'auth/requires-recent-login') {
      throw new Error('For security reasons, please enter your Current Password or re-login before updating your password.');
    }
    if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
      throw new Error('The current password provided is incorrect.');
    }
    throw error;
  }
}
