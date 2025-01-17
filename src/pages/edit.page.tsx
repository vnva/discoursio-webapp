import { createMemo, createSignal, lazy, onMount, Show, Suspense } from 'solid-js'
import { PageLayout } from '../components/_shared/PageLayout'
import { Loading } from '../components/_shared/Loading'
import { useSession } from '../context/session'
import { Shout } from '../graphql/types.gen'
import { useRouter } from '../stores/router'
import { apiClient } from '../utils/apiClient'

const EditView = lazy(() => import('../components/Views/Edit'))

export const EditPage = () => {
  const { isAuthenticated, isSessionLoaded } = useSession()

  const { page } = useRouter()

  const shoutId = createMemo(() => Number((page().params as Record<'shoutId', string>).shoutId))

  const [shout, setShout] = createSignal<Shout>(null)

  onMount(async () => {
    const loadedShout = await apiClient.getShoutById(shoutId())
    setShout(loadedShout)
  })

  return (
    <PageLayout>
      <Show when={isSessionLoaded()}>
        <Show
          when={isAuthenticated()}
          fallback={
            <div class="wide-container">
              <div class="row">
                <div class="col-md-19 col-lg-18 col-xl-16 offset-md-5">Давайте авторизуемся</div>
              </div>
            </div>
          }
        >
          <Show when={shout()}>
            <Suspense fallback={<Loading />}>
              <EditView shout={shout()} />
            </Suspense>
          </Show>
        </Show>
      </Show>
    </PageLayout>
  )
}

export const Page = EditPage
