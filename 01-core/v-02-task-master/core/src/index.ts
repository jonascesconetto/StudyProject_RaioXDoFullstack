export * from "./shared";
export * from "./users";

import { User } from "./users";

console.log("\x1Bc"); // Limpar o console

const user1: User = new User({
  name: "John Doe",
  email: "john.doe@formacao.dev",
  password: "$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36bQ8a5h6v5Z5Y3rF6l7qGm",
});

user1.name = "Jane Doe"; // Objeto mutável

console.log("Nome: ", user1.name);
console.log("Email: ", user1.email);

const user2: User = new User({
  name: "J",
  email: "123",
  password: "blabla",
});

console.log("Nome: ", user2.name);
console.log("Email: ", user2.email);
console.log("Password: ", user2.password);
