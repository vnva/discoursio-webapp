import { Show, createMemo, createSignal, onMount, For } from 'solid-js'
import { Comment } from './Comment'
import styles from '../../styles/Article.module.scss'
import { clsx } from 'clsx'
import { Author, Reaction, ReactionKind } from '../../graphql/types.gen'
import { useSession } from '../../context/session'
import CommentEditor from '../_shared/CommentEditor'
import { Button } from '../_shared/Button'
import { useReactions } from '../../context/reactions'
import { byCreated } from '../../utils/sortby'
import { ShowIfAuthenticated } from '../_shared/ShowIfAuthenticated'
import { useLocalize } from '../../context/localize'
import Cookie from 'js-cookie'

type CommentsOrder = 'createdAt' | 'rating' | 'newOnly'

const sortCommentsByRating = (a: Reaction, b: Reaction): -1 | 0 | 1 => {
  if (a.replyTo && b.replyTo) {
    return 0
  }

  const x = (a?.stat && a.stat.rating) || 0
  const y = (b?.stat && b.stat.rating) || 0

  if (x > y) {
    return 1
  }

  if (x < y) {
    return -1
  }

  return 0
}

type Props = {
  commentAuthors: Author[]
  shoutSlug: string
  shoutId: number
}

export const CommentsTree = (props: Props) => {
  const [commentsOrder, setCommentsOrder] = createSignal<CommentsOrder>('createdAt')
  const {
    reactionEntities,
    actions: { createReaction }
  } = useReactions()

  const { t } = useLocalize()
  const [newReactions, setNewReactions] = createSignal<Reaction[]>([])

  const comments = createMemo(() =>
    Object.values(reactionEntities).filter((reaction) => reaction.kind === 'COMMENT')
  )

  const sortedComments = createMemo(() => {
    let newSortedComments = [...comments()]
    newSortedComments = newSortedComments.sort(byCreated)

    if (commentsOrder() === 'newOnly') {
      return newReactions().reverse()
    }

    if (commentsOrder() === 'rating') {
      newSortedComments = newSortedComments.sort(sortCommentsByRating)
    }

    newSortedComments.reverse()

    return newSortedComments
  })

  const dateFromLocalStorage = new Date(localStorage.getItem(`${props.shoutSlug}`))
  const currentDate = new Date()
  const setCookie = () => localStorage.setItem(`${props.shoutSlug}`, `${currentDate}`)

  onMount(() => {
    if (!dateFromLocalStorage) {
      setCookie()
    } else if (currentDate > dateFromLocalStorage) {
      const newComments = comments().filter((c) => {
        if (c.replyTo) {
          return
        }
        const created = new Date(c.createdAt)
        return created > dateFromLocalStorage
      })
      setNewReactions(newComments)
      setCookie()
    }
  })

  const { session } = useSession()
  const [submitted, setSubmitted] = createSignal<boolean>(false)
  const handleSubmitComment = async (value) => {
    try {
      await createReaction({
        kind: ReactionKind.Comment,
        body: value,
        shout: props.shoutId
      })
      setSubmitted(true)
    } catch (error) {
      console.error('[handleCreate reaction]:', error)
    }
  }

  return (
    <>
      <div class={styles.commentsHeaderWrapper}>
        <h2 id="comments" class={styles.commentsHeader}>
          {t('Comments')} {comments().length.toString() || ''}
          <Show when={newReactions().length > 0}>
            <span class={styles.newReactions}>&nbsp;+{newReactions().length}</span>
          </Show>
        </h2>

        <ul class={clsx(styles.commentsViewSwitcher, 'view-switcher')}>
          <Show when={newReactions().length > 0}>
            <li classList={{ selected: commentsOrder() === 'newOnly' }}>
              <Button
                variant="inline"
                value={t('New only')}
                onClick={() => {
                  setCommentsOrder('newOnly')
                }}
              />
            </li>
          </Show>
          <li classList={{ selected: commentsOrder() === 'createdAt' }}>
            <Button
              variant="inline"
              value={t('By time')}
              onClick={() => {
                setCommentsOrder('createdAt')
              }}
            />
          </li>
          <li classList={{ selected: commentsOrder() === 'rating' }}>
            <Button
              variant="inline"
              value={t('By rating')}
              onClick={() => {
                setCommentsOrder('rating')
              }}
            />
          </li>
        </ul>
      </div>
      <ul class={styles.comments}>
        <For each={sortedComments().filter((r) => !r.replyTo)}>
          {(reaction) => (
            <Comment
              sortedComments={sortedComments()}
              isArticleAuthor={Boolean(props.commentAuthors.some((a) => a.slug === session()?.user.slug))}
              comment={reaction}
              lastSeen={dateFromLocalStorage}
            />
          )}
        </For>
      </ul>
      <ShowIfAuthenticated
        fallback={
          <div class={styles.signInMessage} id="comments">
            {t('To write a comment, you must')}{' '}
            <a href="?modal=auth&mode=register" class={styles.link}>
              {t('sign up')}
            </a>{' '}
            {t('or')}&nbsp;
            <a href="?modal=auth&mode=login" class={styles.link}>
              {t('sign in')}
            </a>
          </div>
        }
      >
        <CommentEditor
          placeholder={t('Write a comment...')}
          clear={submitted()}
          onSubmit={(value) => handleSubmitComment(value)}
        />
      </ShowIfAuthenticated>
    </>
  )
}
