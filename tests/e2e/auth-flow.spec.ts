import { expect, test } from "@playwright/test";

test.describe("Auth flow pages", () => {
  test("login page renders required controls", async ({ page }) => {
    await page.goto("/bejelentkezes");

    await expect(page.getByText("A folytatáshoz kérjük, jelentkezz be.")).toBeVisible();
    await expect(page.locator("input[type=\"email\"]")).toBeVisible();
    await expect(page.locator("input[type=\"password\"]")).toBeVisible();
    await expect(page.getByRole("button", { name: "Bejelentkezés", exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "Nincs még fiókod? Regisztrálj" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Elfelejtetted a jelszavad?" })).toBeVisible();
  });

  test("signup page renders required controls", async ({ page }) => {
    await page.goto("/regisztracio");

    await expect(page.getByText("Hozz létre új fiókot")).toBeVisible();
    await expect(page.locator("input[autocomplete=\"name\"]")).toBeVisible();
    await expect(page.locator("input[type=\"email\"]")).toBeVisible();
    await expect(page.locator("input[type=\"password\"]")).toBeVisible();
    await expect(page.getByRole("button", { name: "Regisztráció" })).toBeVisible();
  });

  test("forgot-password page renders required controls", async ({ page }) => {
    await page.goto("/jelszo-visszaallitas");

    await expect(page.getByText("Jelszó visszaállítás")).toBeVisible();
    await expect(page.locator("input[type=\"email\"]")).toBeVisible();
    await expect(page.getByRole("button", { name: "Reset link küldése" })).toBeVisible();
  });

  test("verify-email page renders resend controls", async ({ page }) => {
    await page.goto("/email-megerosites?email=user@example.com");

    await expect(page.getByText("Email cím megerősítése")).toBeVisible();
    await expect(page.locator("input[type=\"email\"]")).toHaveValue("user@example.com");
    await expect(page.getByRole("button", { name: "Megerősítő email újraküldése" })).toBeVisible();
  });

  test("reset password page validates missing token", async ({ page }) => {
    await page.goto("/uj-jelszo");

    await expect(page.getByText("Érvénytelen vagy lejárt visszaállítási token.")).toBeVisible();

    await expect(page.locator("button[type=\"submit\"]")).toBeDisabled();
  });
});
