import { describe, expect, it } from "vitest";
import { authErrorInfo, loginErrorDetails, safeLoginText } from "../src/services/auth-errors";
describe("safe login diagnostics", () => {
  it("distinguishes blocked popups, closed popups and project configuration", () => {
    for (const code of ["auth/popup-blocked", "auth/popup-closed-by-user", "auth/unauthorized-domain", "auth/operation-not-allowed", "auth/invalid-api-key"]) {
      const id = authErrorInfo({ code }, "id")!;
      const en = authErrorInfo({ code }, "en")!;
      expect(id.code).toBe(code);
      expect(id.message).not.toBe(en.message);
    }
  });
  it("never displays raw provider responses or credentials", () => {
    const result = authErrorInfo({ code: "auth/internal-error", message: "PRIVATE_TOKEN", customData: { token: "PRIVATE_TOKEN" } }, "id")!;
    expect(JSON.stringify(result)).not.toContain("PRIVATE_TOKEN");
    expect(authErrorInfo({ code: "<script>" }, "id")).toBeNull();
  });
  it("separates denied profile access from OAuth failure", () => {
    expect(authErrorInfo({ code: "permission-denied" }, "id")?.message).toContain("Akun sudah masuk");
    expect(authErrorInfo(new Error("unrelated"), "id")).toBeNull();
  });
  it("preserves uncoded TypeError and DOMException details", () => {
    const type = loginErrorDetails(new TypeError("Cannot read properties of undefined (reading 'open')"), "id");
    expect(type.name).toBe("TypeError");
    expect(type.code).toBeNull();
    expect(type.detail).toContain("reading 'open'");
    const security = loginErrorDetails(new DOMException("Storage access denied", "SecurityError"), "en");
    expect(security.name).toBe("SecurityError");
    expect(security.detail).toBe("Storage access denied");
  });
  it("recovers Firebase codes from messages and wrapped causes", () => {
    const nested = new Error("Popup failed", {cause: {code: "auth/popup-closed-by-user", message: "Window closed"}});
    expect(authErrorInfo(nested, "id")?.code).toBe("auth/popup-closed-by-user");
    expect(loginErrorDetails(nested, "en").detail).toContain("Cause: Window closed");
    expect(authErrorInfo("Firebase: Error (auth/unauthorized-domain).", "en")?.code).toBe("auth/unauthorized-domain");
  });
  it("redacts credentials, private keys, emails and URLs from diagnostic messages", () => {
    const secrets = ["TEST_ACCESS", "TEST_PASSWORD", "TEST_CLIENT_SECRET", "some.user@example.com", "AIza" + "a".repeat(35), "eyJhbGciOiJIUzI1NiJ9.eyJ1aWQiOiJhYmMifQ.SIGNATURE", "PRIVATE_CONTENT"];
    const raw = `TypeError: access_token=${secrets[0]}, password="${secrets[1]}", client_secret='${secrets[2]}' ${secrets[3]} ${secrets[4]} ${secrets[5]} https://example.com/handler?code=PRIVATE_URL_VALUE\n-----BEGIN PRIVATE KEY-----\n${secrets[6]}\n-----END PRIVATE KEY-----`;
    const text = safeLoginText(raw, 2000);
    for (const secret of secrets) expect(text).not.toContain(secret);
    expect(text).not.toContain("PRIVATE_URL_VALUE");
    expect(text).toContain("TypeError");
    expect(text).toContain("[URL removed]");
  });
  it("handles cyclic causes, unreadable getters and non-Error rejections", () => {
    const cycle: {message:string; cause?:unknown} = {message:"gapi initialization failed"};
    cycle.cause = cycle;
    expect(loginErrorDetails(cycle,"id").detail).toBe(cycle.message);
    const hostile = Object.defineProperty({}, "code", {get() {throw Error("not readable");}});
    expect(() => loginErrorDetails(hostile,"en")).not.toThrow();
    expect(loginErrorDetails("Network Error", "en").detail).toBe("Network Error");
    expect(loginErrorDetails(null, "en").name).toBe("Null rejection");
    expect(loginErrorDetails(undefined, "en").detail).toContain("no message");
  });
  it("reads gapi-style error fields and nested errors without serializing other fields", () => {
    const info = loginErrorDetails({error:"idpiframe_initialization_failed", details:"Initialization failed", tokens:{access_token:"HIDDEN_TOKEN"}}, "id");
    expect(info.detail).toContain("idpiframe_initialization_failed");
    expect(info.detail).toContain("Initialization failed");
    expect(JSON.stringify(info)).not.toContain("HIDDEN_TOKEN");
    expect(authErrorInfo({error:{code:"auth/network-request-failed"}}, "en")?.code).toBe("auth/network-request-failed");
  });
  it("retains only script basenames and line numbers from stack frames", () => {
    const error = {name:"TypeError", message:"Popup failed", stack:"TypeError: Popup failed\n at open (https://site.test/assets/index-abc.js:1:234)\n at source (https://site.test/code?access_token=HIDDEN)"};
    const info = loginErrorDetails(error,"en");
    expect(info.frames).toContain("index-abc.js:1:234");
    expect(info.frames).not.toContain("site.test");
    expect(info.frames).not.toContain("HIDDEN");
  });
});
