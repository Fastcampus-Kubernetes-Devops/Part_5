import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
  vus: 1,
  duration: '30s',
};

export default function () {
  http.get('http://my-otel-demo-frontendproxy.otel-demo.svc.cluster.local:8080');
  sleep(1);
}
