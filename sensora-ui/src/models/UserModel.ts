export interface User {
  uid: string
  username: string
  mail: string
  firstname?: string
  lastname?: string
  avatarRef?: string
  groupIds: string[]
}
