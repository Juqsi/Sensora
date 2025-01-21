import type { User } from '@/models/UserModel.ts'
import type { Room } from '@/models/RoomModel.ts'

interface Group {
  gid: string
  name: string
  avatarRef?: string
  members: User[]
  rooms: Room[]
}

interface CreateGroupModel {
  name: string
  avatarRef?: string
  members: User[]
}

interface UpdateGroupModel {
  name: string
  gid: string
  avatarRef: string
}

export type { Group, CreateGroupModel, UpdateGroupModel }
