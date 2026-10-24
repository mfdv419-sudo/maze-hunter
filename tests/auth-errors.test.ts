import { describe, expect, it } from "vitest";
import { authErrorInfo } from "../src/services/auth-errors";
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
});
