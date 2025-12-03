import { PersonName } from "../../shared/person-name.vo";
import { Email, HashPassword } from "../../shared";
import { Entity, EntityMode, EntityProps } from "../../shared/entity";

export interface UserProps extends EntityProps<string> {
  name?: string;
  email?: string;
  password?: string;
}

export class User extends Entity<UserProps> {
  public readonly name: string;
  public readonly email: string;
  public readonly password?: string;

  constructor(props: UserProps, mode: EntityMode = "valid") {
    super(props, mode);
    this.name =
      mode === "valid"
        ? PersonName.create(props?.name ?? "").value
        : props?.name ?? "";
    this.email =
      mode === "valid"
        ? Email.create(props?.email ?? "").value
        : props?.email ?? "";
    this.password =
      mode === "valid"
        ? props?.password
          ? HashPassword.create(props.password).value
          : undefined
        : props?.password;
  }

  static draft(props: UserProps = {}): User {
    return new User(props, "draft");
  }

  withoutPassword(): User {
    return this.clone({ password: undefined });
  }

  get $name(): PersonName {
    return PersonName.create(this.name);
  }

  get $email(): Email {
    return Email.create(this.email);
  }

  get $password(): HashPassword | undefined {
    return this.password ? HashPassword.create(this.password) : undefined;
  }
}
