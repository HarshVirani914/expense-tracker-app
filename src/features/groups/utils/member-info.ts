import type { GroupWithMembers, MemberInfo } from '../types'

/**
 * Converts group members to MemberInfo format
 * @param group - The group with members data
 * @param currentUserClerkId - The Clerk authentication ID of the current user (e.g., "user_abc123")
 */
export const getMembersInfo = (
  group: GroupWithMembers,
  currentUserClerkId: string
): MemberInfo[] => {
  return group.members.map((member) => {
    if (member.userId) {
      return {
        id: member.id,
        name: member.user?.name || 'Unknown User',
        email: member.user?.email,
        isCurrentUser: member.user?.clerkId === currentUserClerkId,
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
