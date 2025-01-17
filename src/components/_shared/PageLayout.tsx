import type { JSX } from 'solid-js'
import { Header } from '../Nav/Header'
import { Footer } from '../Discours/Footer'

import { createEffect, createSignal, Show } from 'solid-js'
import { clsx } from 'clsx'
import '../../styles/app.scss'
import styles from './PageLayout.module.scss'
import { Meta } from '@solidjs/meta'

type PageLayoutProps = {
  headerTitle?: string
  slug?: string
  articleBody?: string
  cover?: string
  children: JSX.Element
  isHeaderFixed?: boolean
  hideFooter?: boolean
  class?: string
  withPadding?: boolean
  scrollToComments?: (value: boolean) => void
}

export const PageLayout = (props: PageLayoutProps) => {
  const isHeaderFixed = props.isHeaderFixed === undefined ? true : props.isHeaderFixed
  const [scrollToComments, setScrollToComments] = createSignal<boolean>(false)

  createEffect(() => {
    if (props.scrollToComments) {
      props.scrollToComments(scrollToComments())
    }
  })

  return (
    <>
      <Meta name="viewport" content="width=device-width, initial-scale=1" />
      <Header
        slug={props.slug}
        title={props.headerTitle}
        articleBody={props.articleBody}
        cover={props.articleBody}
        isHeaderFixed={isHeaderFixed}
        scrollToComments={(value) => setScrollToComments(value)}
      />
      <main
        class={clsx('main-content', {
          [styles.withPadding]: props.withPadding
        })}
        classList={{ 'main-content--no-padding': !isHeaderFixed }}
      >
        {props.children}
      </main>
      <Show when={props.hideFooter !== true}>
        <Footer />
      </Show>
    </>
  )
}
