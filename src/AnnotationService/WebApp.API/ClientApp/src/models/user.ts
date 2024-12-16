export type User = {
    id: string,
    mail: string,
    fullName: string,
    roles: string[]
}

export const Role = {
    Admin: "Admin",
    User: "User"
}
