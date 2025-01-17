import { PageLayout } from '../components/_shared/PageLayout'
import { AuthorView, PRERENDERED_ARTICLES_COUNT } from '../components/Views/Author'
import type { PageProps } from './types'
import { createMemo, createSignal, onCleanup, onMount, Show } from 'solid-js'
import { loadShouts, resetSortedArticles } from '../stores/zine/articles'
import { useRouter } from '../stores/router'
import { loadAuthor } from '../stores/zine/authors'
import { Loading } from '../components/_shared/Loading'
import { ReactionsProvider } from '../context/reactions'

export const AuthorPage = (props: PageProps) => {
  const [isLoaded, setIsLoaded] = createSignal(Boolean(props.authorShouts) && Boolean(props.author))

  const slug = createMemo(() => {
    const { page: getPage } = useRouter()

    const page = getPage()

    if (page.route !== 'author') {
      throw new Error('ts guard')
    }

    return page.params.slug
  })

  onMount(async () => {
    if (isLoaded()) {
      return
    }

    await loadShouts({
      filters: { author: slug(), visibility: 'community' },
      limit: PRERENDERED_ARTICLES_COUNT
    })
    await loadAuthor({ slug: slug() })

    setIsLoaded(true)
  })

  onCleanup(() => resetSortedArticles())

  return (
    <PageLayout>
      <ReactionsProvider>
        <Show when={isLoaded()} fallback={<Loading />}>
          <AuthorView author={props.author} shouts={props.authorShouts} authorSlug={slug()} />
        </Show>
      </ReactionsProvider>
    </PageLayout>
  )
}

export const Page = AuthorPage
