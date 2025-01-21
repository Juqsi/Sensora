// services/GroupService.ts
import HttpClient from '../utils/HttpClient'
import type { CreateGroupModel, Group, UpdateGroupModel } from '../models/GroupModel'

const BASE_URL = '/groups'

export const GroupService = {
  /**
   * Fetch all groups
   * @returns Promise<Group[]>
   */
  async getAllGroups(): Promise<Group[]> {
    return HttpClient.get<Group[]>(BASE_URL)
  },

  /**
   * Fetch a single group by ID
   * @param id - Group ID
   * @returns Promise<Group>
   */
  async getGroupById(id: string): Promise<Group> {
    return HttpClient.get<Group>(`${BASE_URL}/${id}`)
  },

  /**
   * Create a new group
   * @param data - Group creation data
   * @returns Promise<Group>
   */
  async createGroup(data: CreateGroupModel): Promise<Group> {
    return HttpClient.post<Group>(BASE_URL, data)
  },

  /**
   * Update an existing group
   * @param id - Group ID
   * @param data - Group update data
   * @returns Promise<Group>
   */
  async updateGroup(id: string, data: UpdateGroupModel): Promise<Group> {
    return HttpClient.patch<Group>(`${BASE_URL}/${id}`, data)
  },

  /**
   * Delete a group
   * @param id - Group ID
   * @returns Promise<void>
   */
  async deleteGroup(id: string): Promise<void> {
    return HttpClient.delete(`${BASE_URL}/${id}`)
  },
}
