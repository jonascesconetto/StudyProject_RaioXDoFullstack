import { Entity } from "../../shared/entity";

export interface User extends Entity<string> {
  name?: string;
  email?: string;
  password?: string;
}
