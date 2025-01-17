import type { Author } from '../../graphql/types.gen'
import Userpic from './Userpic'
import { Icon } from '../_shared/Icon'
import styles from './AuthorCard.module.scss'
import { createMemo, createSignal, For, Show } from 'solid-js'
import { translit } from '../../utils/ru2en'
import { follow, unfollow } from '../../stores/zine/common'
import { clsx } from 'clsx'
import { useSession } from '../../context/session'
import { StatMetrics } from '../_shared/StatMetrics'
import { ShowOnlyOnClient } from '../_shared/ShowOnlyOnClient'
import { FollowingEntity } from '../../graphql/types.gen'
import { router, useRouter } from '../../stores/router'
import { openPage } from '@nanostores/router'
import { useLocalize } from '../../context/localize'

interface AuthorCardProps {
  caption?: string
  hideWriteButton?: boolean
  hideDescription?: boolean
  hideFollow?: boolean
  hasLink?: boolean
  subscribed?: boolean
  author: Author
  isAuthorPage?: boolean
  noSocialButtons?: boolean
  isAuthorsList?: boolean
  truncateBio?: boolean
  liteButtons?: boolean
  isComments?: boolean
  isFeedMode?: boolean
  isNowrap?: boolean
}

export const AuthorCard = (props: AuthorCardProps) => {
  const { t, lang } = useLocalize()

  const {
    session,
    isSessionLoaded,
    actions: { loadSession }
  } = useSession()

  const [isSubscribing, setIsSubscribing] = createSignal(false)

  const subscribed = createMemo<boolean>(() => {
    return session()?.news?.authors?.some((u) => u === props.author.slug) || false
  })

  const subscribe = async (really = true) => {
    setIsSubscribing(true)

    await (really
      ? follow({ what: FollowingEntity.Author, slug: props.author.slug })
      : unfollow({ what: FollowingEntity.Author, slug: props.author.slug }))

    await loadSession()
    setIsSubscribing(false)
  }

  const canFollow = createMemo(() => !props.hideFollow && session()?.user?.slug !== props.author.slug)

  const name = createMemo(() => {
    if (lang() !== 'ru') {
      if (props.author.name === 'Дискурс') {
        return 'Discours'
      }

      return translit(props.author.name)
    }

    return props.author.name
  })

  // TODO: reimplement AuthorCard
  const { changeSearchParam } = useRouter()
  const initChat = () => {
    openPage(router, `inbox`)
    changeSearchParam('initChat', `${props.author.id}`)
  }
  return (
    <div
      class={clsx(styles.author)}
      classList={{
        [styles.authorPage]: props.isAuthorPage,
        [styles.authorComments]: props.isComments,
        [styles.authorsListItem]: props.isAuthorsList,
        [styles.feedMode]: props.isFeedMode,
        [styles.nowrapView]: props.isNowrap
      }}
    >
      <Userpic
        user={props.author}
        hasLink={props.hasLink}
        isBig={props.isAuthorPage}
        isAuthorsList={props.isAuthorsList}
        class={styles.circlewrap}
      />

      <div class={styles.authorDetails}>
        <div class={styles.authorDetailsWrapper}>
          <Show when={props.hasLink}>
            <a class={styles.authorName} href={`/author/${props.author.slug}`}>
              {name()}
            </a>
          </Show>
          <Show when={!props.hasLink}>
            <div class={styles.authorName}>{name()}</div>
          </Show>

          <Show when={!props.hideDescription && props.author.bio}>
            {props.isAuthorsList}
            <div
              class={styles.authorAbout}
              classList={{ 'text-truncate': props.truncateBio }}
              innerHTML={props.author.bio}
            />
          </Show>

          <Show when={props.author.stat}>
            <StatMetrics fields={['shouts', 'followers', 'comments']} stat={props.author.stat} />
          </Show>
        </div>
        <ShowOnlyOnClient>
          <Show when={isSessionLoaded()}>
            <Show when={canFollow()}>
              <div class={styles.authorSubscribe}>
                <Show
                  when={subscribed()}
                  fallback={
                    <button
                      onClick={() => subscribe(true)}
                      class={clsx('button', styles.button)}
                      classList={{
                        [styles.buttonSubscribe]: !props.isAuthorsList,
                        'button--subscribe': !props.isAuthorsList,
                        'button--subscribe-topic': props.isAuthorsList,
                        [styles.buttonWrite]: props.isAuthorsList,
                        [styles.isSubscribing]: isSubscribing()
                      }}
                      disabled={isSubscribing()}
                    >
                      <Show when={!props.isAuthorsList}>
                        <Icon name="author-subscribe" class={styles.icon} />
                      </Show>
                      <span class={styles.buttonLabel}>{t('Follow')}</span>
                    </button>
                  }
                >
                  <button
                    onClick={() => subscribe(false)}
                    class={clsx('button', styles.button)}
                    classList={{
                      [styles.buttonSubscribe]: !props.isAuthorsList,
                      'button--subscribe': !props.isAuthorsList,
                      'button--subscribe-topic': props.isAuthorsList,
                      [styles.buttonWrite]: props.isAuthorsList,
                      [styles.isSubscribing]: isSubscribing()
                    }}
                    disabled={isSubscribing()}
                  >
                    <Show when={!props.isAuthorsList}>
                      <Icon name="author-unsubscribe" class={styles.icon} />
                    </Show>
                    <span class={styles.buttonLabel}>{t('Unfollow')}</span>
                  </button>
                </Show>

                <Show when={!props.hideWriteButton}>
                  <button
                    class={styles.button}
                    classList={{
                      [styles.buttonSubscribe]: !props.isAuthorsList,
                      'button--subscribe': !props.isAuthorsList,
                      'button--subscribe-topic': props.isAuthorsList,
                      [styles.buttonWrite]: props.liteButtons && props.isAuthorsList
                    }}
                    onClick={initChat}
                  >
                    <Icon name="comment" class={styles.icon} />
                    <Show when={!props.liteButtons}>{t('Write')}</Show>
                  </button>

                  <Show when={!props.noSocialButtons}>
                    <div class={styles.authorSubscribeSocial}>
                      <For each={props.author.links}>{(link) => <a href={link} />}</For>
                    </div>
                  </Show>
                </Show>
              </div>
            </Show>
          </Show>
        </ShowOnlyOnClient>
      </div>
    </div>
  )
}
