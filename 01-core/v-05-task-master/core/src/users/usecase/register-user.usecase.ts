import { Email, PersonName } from "../../shared";
import { User } from "../model/user.entity";
import CryptoProvider from "../provider/crypto.provider";
import UseCase from "../../shared/use-case";
import UserRepository from "../provider/user.repository";

type Input = {
  name: string;
  email: string;
  password: string;
};

export default class RegisterUser implements UseCase<Input, void> {
  constructor(
    private readonly repo: UserRepository,
    private readonly crypto: CryptoProvider
  ) {}

  async execute(user: Input): Promise<void> {
    const { name, email, password } = user;

    const validName = PersonName.create(name).value;
    const validEmail = Email.create(email).value;

    const existingUser = await this.repo.findByEmail(validName);
    if (existingUser) throw new Error("Usuário já existe");

    if (!password) throw new Error("Senha é obrigatória");

    const hashedPassword = await this.crypto.encrypt(password!);
    const newUser = new User({
      name: validName,
      email: validEmail,
      password: hashedPassword,
    });
    await this.repo.save(newUser);
  }
}
