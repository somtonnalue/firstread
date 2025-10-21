/**
 * User Entity - Domain Layer
 * Represents a user in the system
 */

export interface UserProps {
  id: string;
  name?: string;
  email: string;
  emailVerified?: Date;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class User {
  constructor(private props: UserProps) {}

  get id(): string {
    return this.props.id;
  }

  get name(): string | undefined {
    return this.props.name;
  }

  get email(): string {
    return this.props.email;
  }

  get emailVerified(): Date | undefined {
    return this.props.emailVerified;
  }

  get image(): string | undefined {
    return this.props.image;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  updateName(name: string): void {
    this.props.name = name;
    this.props.updatedAt = new Date();
  }

  updateEmail(email: string): void {
    this.props.email = email;
    this.props.updatedAt = new Date();
  }

  verifyEmail(): void {
    this.props.emailVerified = new Date();
    this.props.updatedAt = new Date();
  }

  toJSON(): UserProps {
    return { ...this.props };
  }

  static create(props: Omit<UserProps, "createdAt" | "updatedAt">): User {
    const now = new Date();
    return new User({
      ...props,
      createdAt: now,
      updatedAt: now,
    });
  }
}
