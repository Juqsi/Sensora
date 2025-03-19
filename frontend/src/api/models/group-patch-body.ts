import type { Group } from '@/api'

/**
 *
 *
 * @export
 * @interface GroupPatchBody
 */
export interface GroupPatchBody extends Omit<Group, 'gid' | 'members' | 'name' | 'rooms'> {
  name?: string
}
