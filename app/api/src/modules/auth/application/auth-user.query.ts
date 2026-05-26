export interface AuthUserCredentials {
  id: string
  email: string
  passwordHash: string
}

export interface AuthUserProfile {
  id: string
  email: string
  name: string
  createdAt: Date
  updatedAt: Date
}

export interface AuthUserQueries {
  findCredentialsByEmail(email: string): Promise<AuthUserCredentials | null>
  findProfileById(id: string): Promise<AuthUserProfile | null>
}
