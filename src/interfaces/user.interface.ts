export interface User_IF {
    username: string
    email: string
    password: string
    phone: string
    address: string
    bankAccount: string
}

export function isUser(object: any): object is User_IF {
    // return object.username &&
      return  object.email && object.password
        // && object.phone && object.address && object.bankAccount
}