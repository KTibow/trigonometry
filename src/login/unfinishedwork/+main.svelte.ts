import { verify } from '@tsndr/cloudflare-worker-jwt';
import {
  deleteVerification,
  cache,
  getAuthOrUndefined,
  getVerificationOrUndefined,
  setVerification,
  type Auth,
} from '../../lib/strg/common.svelte';
import { studentvueOrRelog } from '../../lib/studentvue';
import verifyStudentvueRemote from './verify-studentvue.remote';
import { getAbortSignal, untrack } from 'svelte';
import { trackProgress } from '../../lib/progress.svelte';
import verificationPublicKey from '../../lib/verification/public-key';
import { type StudentClassList, STUDENT_CLASS_LIST_CACHE_KEY } from './classlist';

type VerificationPayload = {
  verification?: { method?: string };
};

const addVerification = async (auth: Auth) => {
  const tokenData = await studentvueOrRelog<{
    AuthToken: {
      '@_EncyToken': string;
    };
  }>('GenerateAuthToken', {
    Username: '',
    TokenForClassWebSite: 'true',
    DocumentID: '1',
    AssignmentID: '1',
  });
  const token = tokenData.AuthToken['@_EncyToken'];

  const jwt = await verifyStudentvueRemote({ email: auth.email, token });
  setVerification(jwt);
};

const loadStudentClassList = (signal: AbortSignal) =>
  studentvueOrRelog<StudentClassList>('StudentClassList', undefined, signal);

const cleanup = $effect.root(() => {
  $effect(() => {
    const auth = getAuthOrUndefined();
    const verification = getVerificationOrUndefined();
    if (auth && !verification) {
      untrack(() => trackProgress('Verifying your identity', addVerification(auth)));
    }
  });
  $effect(() => {
    const auth = getAuthOrUndefined();
    const verification = getVerificationOrUndefined();

    if (auth && verification) {
      untrack(async () => {
        try {
          const decoded = await verify<VerificationPayload>(verification, verificationPublicKey, {
            algorithm: 'ES256',
            throwError: true,
          });
          const payload = decoded!.payload;
          if (payload.sub != auth.email || typeof payload.verification?.method != 'string') {
            throw new Error('bad payload');
          }
        } catch {
          deleteVerification();
        }
      });
    }
  });
  $effect(() => {
    const auth = getAuthOrUndefined();
    const signal = getAbortSignal();

    if (!auth) {
      return;
    }

    untrack(() =>
      trackProgress(
        'Checking the schedule',
        loadStudentClassList(signal).then((studentClassList) => {
          cache[STUDENT_CLASS_LIST_CACHE_KEY] = studentClassList;
        }),
      ),
    );
  });
});
if (import.meta.hot) {
  import.meta.hot.dispose(cleanup);
}
