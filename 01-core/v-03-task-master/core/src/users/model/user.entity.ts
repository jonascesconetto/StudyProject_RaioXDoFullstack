import { Entity, EntityProps } from "../../shared/entity";

export interface UserProps extends EntityProps<string> {
  name?: string;
  email?: string;
  password?: string;
}

export class User extends Entity<UserProps> {
  public readonly name: string;
  public readonly email: string;
  public readonly password?: string;

  constructor(props: UserProps) {
    super(props);
    this.name = props?.name ?? "";
    this.email = props?.email?.trim().toLowerCase() ?? "";
    this.password = props?.password ? props?.password : undefined;
  }

  withName(name: string): User {
    return this.clone({ name });
  }

  withoutPassword(): User {
    return this.clone({ password: undefined });
  }
}
