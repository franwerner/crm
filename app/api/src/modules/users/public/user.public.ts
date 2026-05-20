export interface UserCredentials {
  id: string
  email: string
  passwordHash: string
}

export interface UsersPublicApi {
  findByEmail(email: string): Promise<UserCredentials | null>
}
