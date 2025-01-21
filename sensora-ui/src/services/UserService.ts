import HttpClient from '@/utils/HttpClient'
import type { User } from '@/models/UserModel'

const BASE_URL = '/user'

export const UserService = {
  async getUser(id?: string): Promise<User> {
    const params = id ? { id } : {}
    return HttpClient.get<User>(BASE_URL, { params })
  },

  async updateUser(data: Partial<User>): Promise<User> {
    return HttpClient.patch<User>(BASE_URL, data)
  },

  async deleteUser(): Promise<void> {
    return HttpClient.delete(BASE_URL)
  },
}
