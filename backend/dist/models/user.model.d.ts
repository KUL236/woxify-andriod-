export interface User {
    id: string;
    name: string;
    email: string;
    password: string;
    created_at: Date;
    updated_at: Date;
}
export interface CreateUserDto {
    name: string;
    email: string;
    password: string;
}
export declare class UserModel {
    static create(data: CreateUserDto): Promise<User>;
    static findByEmail(email: string): Promise<User | null>;
    static findById(id: string): Promise<User | null>;
    static comparePassword(plainPassword: string, hashedPassword: string): Promise<boolean>;
}
//# sourceMappingURL=user.model.d.ts.map