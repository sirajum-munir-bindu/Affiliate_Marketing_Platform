import { describe, it, expect } from "vitest";
import { POST as loginHandler } from "@/app/api/auth/login/route";
import { verifySessionToken, COOKIE_NAME } from "@/lib/auth";

describe("Login Flow & Authentication Handlers", () => {
  it("successfully logs in Super Admin with valid credentials", async () => {
    const req = {
      json: async () => ({
        email: "admin@platform.com",
        password: "AdminSecurePassword123!",
      }),
    } as any;

    const response = await loginHandler(req);
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.user.email).toBe("admin@platform.com");
    expect(body.user.role).toBe("ADMIN");

    // Verify Set-Cookie header exists and has the auth token
    const cookieHeader = response.headers.get("set-cookie");
    expect(cookieHeader).toBeDefined();
    expect(cookieHeader).toContain(COOKIE_NAME);

    // Extract token from cookie header
    const match = cookieHeader?.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
    expect(match).toBeTruthy();
    const token = match![1];

    const verified = await verifySessionToken(token);
    expect(verified).not.toBeNull();
    expect(verified?.email).toBe("admin@platform.com");
    expect(verified?.role).toBe("ADMIN");
  });

  it("successfully logs in Approved Marketer with valid credentials", async () => {
    const req = {
      json: async () => ({
        email: "marketer@platform.com",
        password: "Marketer123!",
      }),
    } as any;

    const response = await loginHandler(req);
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.user.role).toBe("MARKETER");
    expect(body.user.marketerStatus).toBe("APPROVED");
  });

  it("rejects login with invalid password", async () => {
    const req = {
      json: async () => ({
        email: "admin@platform.com",
        password: "WrongPassword!",
      }),
    } as any;

    const response = await loginHandler(req);
    expect(response.status).toBe(401);

    const body = await response.json();
    expect(body.error).toBe("Invalid email or password.");
  });

  it("rejects login with unregistered email", async () => {
    const req = {
      json: async () => ({
        email: "nonexistent@unknown.com",
        password: "AnyPassword123!",
      }),
    } as any;

    const response = await loginHandler(req);
    expect(response.status).toBe(401);
  });
});
