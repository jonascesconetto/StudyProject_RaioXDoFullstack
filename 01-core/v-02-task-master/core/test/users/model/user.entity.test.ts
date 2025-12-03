import { User } from "../../../src";

describe("User Entity", () => {
  // Hash bcrypt válido gerado com bcryptjs.hashSync('password123', 10)
  const validHashPassword =
    "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy";

  describe("Constructor", () => {
    it("should create user with provided properties", () => {
      const user = new User({
        name: "João Silva",
        email: "joao.silva@example.com",
        password: validHashPassword,
      });

      expect(user.name).toBe("João Silva");
      expect(user.email).toBe("joao.silva@example.com");
      expect(user.password).toBe(validHashPassword);
    });

    it("should create user with minimal properties", () => {
      const user = new User({
        name: "Ana Maria",
        email: "ana@example.com",
      });

      expect(user.name).toBe("Ana Maria");
      expect(user.email).toBe("ana@example.com");
      expect(user.password).toBeUndefined();
    });

    it("should generate id when not provided", () => {
      const user = new User({
        name: "Pedro Santos",
        email: "pedro@example.com",
      });

      expect(user.id).toBeDefined();
      expect(user.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
      );
    });

    it("should use provided id", () => {
      const customId = "550e8400-e29b-41d4-a716-446655440000";
      const user = new User({
        id: customId,
        name: "Maria José",
        email: "maria@example.com",
      });

      expect(user.id).toBe(customId);
    });

    it("should create empty user when no properties provided", () => {
      const user = new User({});

      expect(user.name).toBe("");
      expect(user.email).toBe("");
      expect(user.password).toBeUndefined();
    });
  });

  describe("Email validation", () => {
    it("should accept valid email", () => {
      const user = new User({
        name: "Ana Costa",
        email: "ana.costa@example.com",
      });

      expect(user.email).toBe("ana.costa@example.com");
    });

    it("should convert email to lowercase", () => {
      const user = new User({
        name: "Paulo Lima",
        email: "PAULO.LIMA@EXAMPLE.COM",
      });

      expect(user.email).toBe("paulo.lima@example.com");
    });

    it("should trim email whitespace", () => {
      const user = new User({
        name: "Test User",
        email: "  test@example.com  ",
      });

      expect(user.email).toBe("test@example.com");
    });
  });

  describe("Password handling", () => {
    it("should accept valid hash password", () => {
      const user = new User({
        name: "Secure User",
        email: "secure@example.com",
        password: validHashPassword,
      });

      expect(user.password).toBe(validHashPassword);
    });

    it("should handle undefined password", () => {
      const user = new User({
        name: "No Password User",
        email: "nopass@example.com",
      });

      expect(user.password).toBeUndefined();
    });

    it("should handle empty password as undefined", () => {
      const user = new User({
        name: "Empty Password User",
        email: "empty@example.com",
        password: "",
      });

      expect(user.password).toBeUndefined();
    });
  });

  describe("withoutPassword method", () => {
    it("should return user without password", () => {
      const user = new User({
        name: "User With Password",
        email: "withpass@example.com",
        password: validHashPassword,
      });

      const userWithoutPassword = user.withoutPassword();

      expect(user.password).toBe(validHashPassword);
      expect(userWithoutPassword.password).toBeUndefined();
      expect(userWithoutPassword.name).toBe(user.name);
      expect(userWithoutPassword.email).toBe(user.email);
      expect(userWithoutPassword.id).toBe(user.id);
    });

    it("should return same user when password is already undefined", () => {
      const user = new User({
        name: "User Without Password",
        email: "nopass@example.com",
      });

      const userWithoutPassword = user.withoutPassword();

      expect(userWithoutPassword.password).toBeUndefined();
      expect(userWithoutPassword.name).toBe(user.name);
      expect(userWithoutPassword.email).toBe(user.email);
      expect(userWithoutPassword.id).toBe(user.id);
    });

    it("should create new instance without password", () => {
      const user = new User({
        name: "Original User",
        email: "original@example.com",
        password: validHashPassword,
      });

      const userWithoutPassword = user.withoutPassword();

      expect(userWithoutPassword).not.toBe(user);
      expect(userWithoutPassword.equals(user)).toBe(true);
    });
  });

  describe("Entity behavior", () => {
    it("should inherit equality comparison", () => {
      const id = "550e8400-e29b-41d4-a716-446655440000";
      const user1 = new User({
        id,
        name: "User One",
        email: "user1@example.com",
      });
      const user2 = new User({
        id,
        name: "User Two",
        email: "user2@example.com",
      });

      expect(user1.equals(user2)).toBe(true);
    });

    it("should provide access to props through data getter", () => {
      const user = new User({
        name: "Data User",
        email: "data@example.com",
        password: validHashPassword,
      });
      const data = user.data;

      expect(data.name).toBe("Data User");
      expect(data.email).toBe("data@example.com");
      expect(data.password).toBe(validHashPassword);
    });
  });

  describe("Setters", () => {
    it("should allow updating name", () => {
      const user = new User({
        name: "Old Name",
        email: "old.email@example.com",
        password: validHashPassword,
      });

      user.name = "New Name";

      expect(user.name).toBe("New Name");
    });
    it("should allow updating email with valid format", () => {
      const user = new User({
        name: "Email User",
        email: "old.email@example.com",
        password: validHashPassword,
      });

      user.email = "new.email@example.com";

      expect(user.email).toBe("new.email@example.com");
    });

    it("should allow updating password with valid format", () => {
      const user = new User({
        name: "Password User",
        email: "password@example.com",
        password: validHashPassword,
      });

      user.password = "newPasswordHash";

      expect(user.password).toBe("newPasswordHash");
    });
  });
});
