import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  User,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

export const SCOPES = ['https://www.googleapis.com/auth/gmail.send'];

const GMAIL_APP_NAME = 'argon-gmail-oauth';
const app =
  getApps().find((a) => a.name === GMAIL_APP_NAME) ||
  initializeApp(firebaseConfig, GMAIL_APP_NAME);
const auth = getAuth(app);

const provider = new GoogleAuthProvider();
SCOPES.forEach((scope) => provider.addScope(scope));

let isSigningIn = false;
// Strictly cache OAuth access token in memory only (never localStorage/sessionStorage)
let cachedAccessToken: string | null = null;

export const initGmailAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        onAuthSuccess?.(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        onAuthFailure?.();
      }
    } else {
      cachedAccessToken = null;
      onAuthFailure?.();
    }
  });
};

export const signInWithGoogleForGmail = async (): Promise<{
  user: User;
  accessToken: string;
}> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Could not obtain Gmail send access token.');
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } finally {
    isSigningIn = false;
  }
};

export const getGmailAccessToken = (): string | null => cachedAccessToken;

export const signOutGmail = async (): Promise<void> => {
  await auth.signOut();
  cachedAccessToken = null;
};

function encodeBase64UrlUtf8(input: string): string {
  const bytes = new TextEncoder().encode(input);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export async function sendPasswordEmailViaGmail(params: {
  toEmail: string;
  recipientName: string;
  teamName: string;
  role: string;
  defaultPassword: string;
}): Promise<{ id: string }> {
  const token = cachedAccessToken;
  if (!token) {
    throw new Error('NEEDS_GMAIL_AUTH');
  }

  const subject = 'Welcome to ARGON | AVCOE Tech Community — Your Account Credentials';
  const body = [
    `Hello ${params.recipientName},`,
    '',
    'Your account has been created on the ARGON | AVCOE Tech Community portal.',
    '',
    'Account Details:',
    `- Email: ${params.toEmail}`,
    `- Assigned Team: ${params.teamName || 'Unassigned'}`,
    `- Role: ${params.role}`,
    `- Default Password: ${params.defaultPassword}`,
    '',
    'Please sign in with these credentials and update your password after your first login.',
    '',
    'Best regards,',
    'ARGON Core Admin Team · AVCOE, Sangamner',
  ].join('\r\n');

  const rawMime = [
    `To: ${params.toEmail}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset="UTF-8"',
    '',
    body,
  ].join('\r\n');

  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      raw: encodeBase64UrlUtf8(rawMime),
    }),
  });

  if (res.status === 401 || res.status === 403) {
    cachedAccessToken = null;
    throw new Error('NEEDS_GMAIL_AUTH');
  }

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(errText || `Gmail send failed (${res.status})`);
  }

  return (await res.json()) as { id: string };
}

/**
 * Resize an uploaded image file to a lightweight square PNG/WebP data URL
 * so custom team logos and badges stay crisp and fast in client storage.
 */
export function readAndCompressImageFile(file: File, maxSize = 256): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Please choose a valid image file (PNG, JPG, WebP, or SVG).'));
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.onload = () => {
      const dataUrl = String(reader.result || '');
      if (file.type === 'image/svg+xml' && dataUrl.length < 180_000) {
        resolve(dataUrl);
        return;
      }
      const img = new Image();
      img.onerror = () => resolve(dataUrl);
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(dataUrl);
          return;
        }
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/png', 0.9));
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  });
}

export function generateDefaultPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const pick = (len: number) =>
    Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `ARG-${pick(4)}-${pick(4)}`;
}
