import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: 8,
  duration: "30s",
  thresholds: {
    http_req_failed: ["rate<0.05"],
    http_req_duration: ["p(95)<700"],
  },
};

const baseURL = __ENV.BASE_URL || "http://127.0.0.1:8080";
const sessionCookie = __ENV.SESSION_COOKIE || "";

const routes = [
  "/api/v1/admin/overview",
  "/api/v1/admin/users?page=1&page_size=20",
  "/api/v1/admin/files?page=1&page_size=20",
  "/api/v1/admin/jobs?page=1&page_size=20",
  "/api/v1/admin/audit?page=1&page_size=20",
];

export default function () {
  const target = routes[Math.floor(Math.random() * routes.length)];
  const response = http.get(`${baseURL}${target}`, {
    headers: sessionCookie
      ? {
          Cookie: `go_astro_session=${sessionCookie}`,
        }
      : undefined,
  });
  check(response, {
    "admin request is 200/401": (r) => r.status === 200 || r.status === 401,
  });
  sleep(0.2);
}
