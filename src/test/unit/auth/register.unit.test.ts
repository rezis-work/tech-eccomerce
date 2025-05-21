import { register } from "@/modules/auth/services/register";
import { clearTestUser } from "@/test/utils/testUtils";

const TEST_EMAIL = `unit-${Date.now()}@example.com`;

beforeAll(async () => {
  await clearTestUser(TEST_EMAIL);
});

afterAll(async () => {
  await clearTestUser(TEST_EMAIL);
});

test("should register a new user", async () => {
  const result = await register({
    name: "John Doe",
    email: TEST_EMAIL,
    age: 20,
    phone: "+1234567890",
    password: "password",
  });

  expect(result.message).toBe("User registered successfully");
  expect(result.user.email).toBe(TEST_EMAIL);
  expect(result.user.name).toBe("John Doe");
  expect(result.user.age).toBe(20);
  expect(result.user.phone).toBe("+1234567890");
  expect(result.user.role).toBe("USER");
});
