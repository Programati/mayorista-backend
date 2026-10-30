import { describe, it, expect } from "vitest";
import { createApp } from "./../../src/app.ts";

describe("setup de Vitest", () => {
  it("ejecuta un test trivial", () => {
    expect(1 + 1).toBe(2);
  });

  it("createApp() construye la app sin conectar la base", () => {
    const app = createApp();
    expect(typeof app).toBe("function"); // una app de Express es una función
  });
});
