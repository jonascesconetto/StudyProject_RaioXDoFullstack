export * from "./shared";
export * from "./users";

import { User } from "./users";

console.log("\x1Bc"); // Limpar o console

const user1: User = new User({
  name: "John Doe",
  email: "john.doe@formacao.dev",
  password: "$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36bQ8a5h6v5Z5Y3rF6l7qGm",
});

const user2: User = user1.withName("Jane Doe");

console.log("User 1:", user1.name, user1.id);
console.log("User 2:", user2.name, user2.id);

console.log(user1.equals(user2) ? "Users are equal" : "Users are different");
