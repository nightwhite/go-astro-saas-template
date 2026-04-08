import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: 10,
  duration: "30s",
  thresholds: {
    http_req_failed: ["rate<0.05"],
    http_req_duration: ["p(95)<500"],
  },
};

const baseURL = __ENV.BASE_URL || "http://127.0.0.1:8080";
const csrfHeader = __ENV.CSRF_HEADER || "X-CSRF-Token";
const csrfToken = __ENV.CSRF_TOKEN || "dev-token";

export default function () {
  const payload = JSON.stringify({
    email: "admin@example.com",
    password: "admin123456",
    captcha_token: "dev-pass",
  });
  const response = http.post(`${baseURL}/api/v1/auth/login`, payload, {
    headers: {
      "Content-Type": "application/json",
      [csrfHeader]: csrfToken,
    },
  });

  check(response, {
    "login status is 200": (r) => r.status === 200,
  });
  sleep(0.2);
}
