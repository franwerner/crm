export interface UserCredentials {
  id: string
  email: string
  passwordHash: string
}

export interface UserProfile {
  id: string
  email: string
  name: string
  createdAt: Date
  updatedAt: Date
}

export interface UsersPublicApi {
  findByEmail(email: string): Promise<UserCredentials | null>
  findById(id: string): Promise<UserProfile | null>
}
