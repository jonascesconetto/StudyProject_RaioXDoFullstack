import { Entity, EntityProps } from "../../shared/entity";

export interface UserProps extends EntityProps<string> {
  name?: string;
  email?: string;
  password?: string;
}

export class User extends Entity<UserProps> {
  private _name: string;
  private _email: string;
  private _password?: string;

  constructor(props: UserProps) {
    super(props);
    this._name = props?.name ?? "";
    this._email = props?.email?.trim().toLowerCase() ?? "";
    this._password = props?.password ? props?.password : undefined;
  }

  get name(): string {
    return this._name;
  }

  get email(): string {
    return this._email;
  }

  get password(): string | undefined {
    return this._password;
  }

  set name(name: string) {
    this._name = name;
  }

  set email(email: string) {
    this._email = email.trim().toLowerCase();
  }

  set password(password: string | undefined) {
    this._password = password;
  }

  withoutPassword(): User {
    return new User({
      id: this.id,
      name: this.name,
      email: this.email,
    });
  }
}
