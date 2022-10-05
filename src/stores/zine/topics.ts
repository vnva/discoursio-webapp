import { createMemo, createSignal } from 'solid-js'
import { apiClient } from '../../utils/apiClient'
import type { Topic } from '../../graphql/types.gen'
import { byCreated, byTopicStatDesc } from '../../utils/sortby'
import { getLogger } from '../../utils/logger'
import { createLazyMemo } from '@solid-primitives/memo'

const log = getLogger('topics store')

export type TopicsSortBy = 'created' | 'title' | 'authors' | 'shouts'

const [sortAllBy, setSortAllBy] = createSignal<TopicsSortBy>('shouts')

export { setSortAllBy }

const [topicEntities, setTopicEntities] = createSignal<{ [topicSlug: string]: Topic }>({})
const [randomTopics, setRandomTopics] = createSignal<Topic[]>([])
const [topicsByAuthor, setTopicByAuthor] = createSignal<{ [authorSlug: string]: Topic[] }>({})

const sortedTopics = createLazyMemo<Topic[]>(() => {
  const topics = Object.values(topicEntities())

  switch (sortAllBy()) {
    case 'created':
      // log.debug('sorted by created')
      topics.sort(byCreated)
      break
    case 'shouts':
      // log.debug(`sorted by shouts`)
      topics.sort(byTopicStatDesc('shouts'))
      break
    case 'authors':
      // log.debug(`sorted by authors`)
      topics.sort(byTopicStatDesc('authors'))
      break
    case 'title':
      // log.debug('sorted by title')
      topics.sort((a, b) => a.title.localeCompare(b.title))
      break
    default:
      log.error(`Unknown sort: ${sortAllBy()}`)
  }

  return topics
})

const topTopics = createMemo(() => {
  const topics = Object.values(topicEntities())
  topics.sort(byTopicStatDesc('shouts'))
  return topics
})

const addTopics = (...args: Topic[][]) => {
  const allTopics = args.flatMap((topics) => topics || [])

  const newTopicEntities = allTopics.reduce((acc, topic) => {
    acc[topic.slug] = topic
    return acc
  }, {} as Record<string, Topic>)

  setTopicEntities((prevTopicEntities) => {
    return {
      ...prevTopicEntities,
      ...newTopicEntities
    }
  })
}

export const addTopicsByAuthor = (newTopicsByAuthors: { [authorSlug: string]: Topic[] }) => {
  const allTopics = Object.values(newTopicsByAuthors).flat()
  addTopics(allTopics)

  setTopicByAuthor((prevTopicsByAuthor) => {
    return Object.entries(newTopicsByAuthors).reduce((acc, [authorSlug, topics]) => {
      if (!acc[authorSlug]) {
        acc[authorSlug] = []
      }

      topics.forEach((topic) => {
        if (!acc[authorSlug].some((t) => t.slug === topic.slug)) {
          acc[authorSlug].push(topic)
        }
      })

      return acc
    }, prevTopicsByAuthor)
  })
}

export const loadAllTopics = async (): Promise<void> => {
  const topics = await apiClient.getAllTopics()
  addTopics(topics)
}

export const loadRandomTopics = async (): Promise<void> => {
  const topics = await apiClient.getRandomTopics({ amount: 12 })
  setRandomTopics(topics)
}

export const loadTopic = async ({ slug }: { slug: string }): Promise<void> => {
  // TODO:
  const articles = await apiClient.getArticlesForTopics({ topicSlugs: [slug], limit: 1 })
  const topic = articles[0].topics.find(({ slug: topicSlug }) => topicSlug === slug)
  addTopics([topic])
}

type InitialState = {
  topics?: Topic[]
  randomTopics?: Topic[]
  sortBy?: TopicsSortBy
}

export const useTopicsStore = (initialState: InitialState = {}) => {
  if (initialState.sortBy) {
    setSortAllBy(initialState.sortBy)
  }

  addTopics(initialState.topics, initialState.randomTopics)

  if (initialState.randomTopics) {
    setRandomTopics(initialState.randomTopics)
  }

  return { topicEntities, sortedTopics, randomTopics, topTopics, topicsByAuthor }
}
