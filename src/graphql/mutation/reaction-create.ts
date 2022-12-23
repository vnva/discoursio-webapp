import { gql } from '@urql/core'

export default gql`
  mutation CreateReactionMutation($reaction: ReactionInput!) {
    createReaction(reaction: $reaction) {
      error
      reaction {
        id
        createdBy {
          slug
          name
          userpic
        }
        body
        kind
        range
        createdAt
        shout {
          id
          slug
        }
        replyTo
      }
    }
  }
`
