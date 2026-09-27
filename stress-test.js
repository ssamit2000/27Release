import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 200,
  duration: '30s',
};

export default function () {
  const res = http.get('https://27-release.vercel.app/api/releases');

  check(res, {
    'status is 200': (r) => r.status === 200,
  });

  sleep(1);
}