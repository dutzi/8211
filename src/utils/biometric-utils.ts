const BIO_SIGNUP_LS_KEY = 'bioSignupUserHandle-v2';
const CHALLENGE_STRING = '8211-challenge';

if (window.location.search.indexOf('bio=1') !== -1) {
  alert('המידע נמחק');
  localStorage.removeItem('isBioDismissed');
  localStorage.removeItem(BIO_SIGNUP_LS_KEY);
  location.href = '/';
}

function stringToArrayBuffer(str: string) {
  const buf = new ArrayBuffer(str.length);
  const bufView = new Uint8Array(buf);
  for (let i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}

function arrayBufferToString(buffer: ArrayBuffer) {
  return String.fromCharCode.apply(null, new Uint8Array(buffer) as any);
}

export async function bioSignUp(password: string) {
  const publicKeyCredential = await window.navigator.credentials.create({
    publicKey: {
      rp: { name: window.location.hostname },
      user: {
        name: `user@example.com`,
        id: stringToArrayBuffer(password),
        displayName: `8211 user`,
      },
      pubKeyCredParams: [{ type: 'public-key', alg: -7 }],
      challenge: stringToArrayBuffer(CHALLENGE_STRING),
      authenticatorSelection: { authenticatorAttachment: 'platform' },
    },
  });

  const id = (publicKeyCredential as any).rawId;

  if (!id) {
    return false;
  }

  const userHandle = arrayBufferToString(id);
  localStorage.setItem(BIO_SIGNUP_LS_KEY, userHandle);

  return true;
}

export async function bigSignIn() {
  const publicKeyCredential = await navigator.credentials.get({
    publicKey: {
      challenge: stringToArrayBuffer(CHALLENGE_STRING),
      allowCredentials: [
        {
          type: 'public-key',
          id: stringToArrayBuffer(localStorage.getItem(BIO_SIGNUP_LS_KEY)!),
          transports: ['internal'],
        },
      ],
    },
  });

  if (!publicKeyCredential) {
    return;
  }

  return arrayBufferToString((publicKeyCredential as any).response.userHandle);
}

export function dismissBioSignUp() {
  localStorage.setItem('isBioDismissed', 'true');
}

export function getIsBioSignedUp() {
  return !!localStorage.getItem(BIO_SIGNUP_LS_KEY);
}

export function getIsBioDismissed() {
  return localStorage.getItem('isBioDismissed') === 'true';
}
