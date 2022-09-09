import type { FollowingEntity } from '../../graphql/types.gen'
import { apiClient } from '../../utils/apiClient'

export const follow = async ({ what, slug }: { what: FollowingEntity; slug: string }) => {
  await apiClient.follow({ what, slug })
  // TODO: _store update code
}
export const unfollow = async ({ what, slug }: { what: FollowingEntity; slug: string }) => {
  await apiClient.unfollow({ what, slug })
  // TODO: store update
}
