export * from "./shared";
export * from "./users";

import { User } from "./users";

console.log("\x1Bc"); // Limpar o console

const user: User = new User({
  name: "John Doe",
  email: "john.doe@formacao.dev",
  password: "$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36bQ8a5h6v5Z5Y3rF6l7qGm",
});

console.log("Nome: ", user.name);
console.log("Iniciais: ", user.$name.initials);
console.log("Email: ", user.email);
console.log("Email Domain: ", user.$email.domain);

const user2: User = User.draft({
  name: "Leo",
  email: "le",
  password: "123456",
});
console.log("Nome: ", user2.name);
console.log("Email: ", user2.email);
