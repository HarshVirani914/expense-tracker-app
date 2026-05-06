import type { GroupWithMembers, MemberInfo } from '../types'

export const getMembersInfo = (
  group: GroupWithMembers,
  currentUserId: string
): MemberInfo[] => {
  return group.members.map((member) => {
    if (member.userId) {
      return {
        id: member.id,
        name: member.user?.name || 'Unknown User',
        email: member.user?.email,
        isCurrentUser: member.userId === currentUserId,
        userId: member.userId,
        contactId: null,
      }
    } else {
      return {
        id: member.id,
        name: member.contact?.name || 'Unknown Contact',
        email: member.contact?.email,
        isCurrentUser: false,
        userId: null,
        contactId: member.contactId,
      }
    }
  })
}
