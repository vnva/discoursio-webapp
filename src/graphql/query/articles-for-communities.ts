import { gql } from '@urql/core'

export default gql`
  query ShoutsForCommunitiesQuery($slugs: [String]!, $page: Int!, $size: Int!) {
    shoutsByCommunities(slugs: $slugs, page: $page, size: $size) {
      _id: slug
      title
      subtitle
      layout
      slug
      cover
      # community { ... }
      mainTopic
      topics {
        title
        body
        slug
        stat {
          _id: shouts
          shouts
          authors
          followers
        }
      }
      authors {
        _id: slug
        name
        slug
        userpic
      }
      createdAt
      publishedAt
      stat {
        _id: viewed
        viewed
        reacted
      }
    }
  }
`
