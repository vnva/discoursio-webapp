import { clsx } from 'clsx'
import styles from './Draft.module.scss'
import type { Shout } from '../../graphql/types.gen'
import { Icon } from '../_shared/Icon'
import { formatDate } from '../../utils'
import formatDateTime from '../../utils/formatDateTime'
import { useLocalize } from '../../context/localize'
import { getPagePath } from '@nanostores/router'
import { router } from '../../stores/router'

type Props = {
  class?: string
  shout: Shout
  onPublish: (shout: Shout) => void
  onDelete: (shout: Shout) => void
}

export const Draft = (props: Props) => {
  const { t } = useLocalize()

  const handlePublishLinkClick = (e) => {
    e.preventDefault()
    props.onPublish(props.shout)
  }

  const handleDeleteLinkClick = (e) => {
    e.preventDefault()
    props.onDelete(props.shout)
  }

  return (
    <div class={clsx(props.class)}>
      <div class={styles.created}>
        <Icon name="pencil-outline" class={styles.icon} /> {formatDate(new Date(props.shout.createdAt))}
        &nbsp;{formatDateTime(props.shout.createdAt)()}
      </div>
      <div class={styles.titleContainer}>
        <span class={styles.title}>{props.shout.title || t('Unnamed draft')}</span> {props.shout.subtitle}
      </div>
      <div class={styles.actions}>
        <a href={getPagePath(router, 'edit', { shoutId: props.shout.id.toString() })}>{t('Edit')}</a>
        <a href="#" onClick={handlePublishLinkClick} class={styles.publishLink}>
          {t('Publish')}
        </a>
        <a href="#" onClick={handleDeleteLinkClick} class={styles.deleteLink}>
          {t('Delete')}
        </a>
      </div>
    </div>
  )
}
