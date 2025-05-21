import request from "supertest";
import app from "@/server";
import { clearTestUser } from "@/test/utils/testUtils";

const TEST_EMAIL = `integration-${Date.now()}@example.com`;

beforeAll(async () => {
  await clearTestUser(TEST_EMAIL);
});

afterAll(async () => {
  await clearTestUser(TEST_EMAIL);
});

test("POST /api/auth/register", async () => {
  const res = await request(app).post("/api/auth/register").send({
    name: "John kak",
    age: 20,
    email: TEST_EMAIL,
    phone: "+1234567890",
    password: "password",
  });

  expect(res.status).toBe(201);
  expect(res.body.message).toBe("User registered successfully");
  expect(res.body.user.email).toBe(TEST_EMAIL);
});
