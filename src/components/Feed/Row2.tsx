import { createComputed, createSignal, Show, For } from 'solid-js'
import type { Shout } from '../../graphql/types.gen'
import { ArticleCard } from './ArticleCard'

const x = [
  ['12', '12'],
  ['8', '16'],
  ['16', '8']
]

export const Row2 = (props: { articles: Shout[]; isEqual?: boolean; nodate?: boolean }) => {
  const [y, setY] = createSignal(0)

  createComputed(() => setY(Math.floor(Math.random() * x.length)))

  return (
    <div class="floor">
      <div class="wide-container">
        <div class="row">
          <For each={props.articles}>
            {(a, i) => {
              return (
                <Show when={!!a}>
                  <div class={`col-md-${props.isEqual ? '12' : x[y()][i()]}`}>
                    <ArticleCard
                      article={a}
                      settings={{
                        isWithCover: props.isEqual || x[y()][i()] === '16',
                        nodate: props.isEqual || props.nodate
                      }}
                    />
                  </div>
                </Show>
              )
            }}
          </For>
        </div>
      </div>
    </div>
  )
}
