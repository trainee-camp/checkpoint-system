export interface User_IF extends Credentials_IF {
    username: string
    phone: string
    address: string
    bankAccount: string
}

export interface Credentials_IF {
    email: string
    password: string
}

export interface UserDataVaried {
    username?: string
    phone?: string
    address?: string
    bankAccount?: string

}

export function isUser(object: any): object is User_IF {
    // return object.username &&
    return object.email && object.password
    // && object.phone && object.address && object.bankAccount
}