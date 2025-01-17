import { clsx } from 'clsx'
import { Button } from '../../_shared/Button'
import { Icon } from '../../_shared/Icon'
import { useLocalize } from '../../../context/localize'
import styles from './Panel.module.scss'
import { useEditorContext } from '../../../context/editor'
import { useOutsideClickHandler } from '../../../utils/useOutsideClickHandler'
import { useEscKeyDownHandler } from '../../../utils/useEscKeyDownHandler'
import { getPagePath } from '@nanostores/router'
import { router } from '../../../stores/router'
import { useEditorHTML } from 'solid-tiptap'
import Typograf from 'typograf'

const typograf = new Typograf({ locale: ['ru', 'en-US'] })

type Props = {
  shoutId: number
}

export const Panel = (props: Props) => {
  const { t } = useLocalize()
  const {
    isEditorPanelVisible,
    wordCounter,
    editorRef,
    actions: { toggleEditorPanel, saveShout, publishShout }
  } = useEditorContext()

  const containerRef: { current: HTMLElement } = {
    current: null
  }

  useOutsideClickHandler({
    containerRef,
    predicate: () => isEditorPanelVisible(),
    handler: () => toggleEditorPanel()
  })

  useEscKeyDownHandler(() => {
    if (isEditorPanelVisible()) {
      toggleEditorPanel()
    }
  })

  const handleSaveClick = () => {
    saveShout()
  }

  const handlePublishClick = () => {
    publishShout()
  }

  const handleFixTypographyClick = () => {
    const html = useEditorHTML(() => editorRef.current())
    editorRef.current().commands.setContent(typograf.execute(html()))
  }

  return (
    <aside
      ref={(el) => (containerRef.current = el)}
      class={clsx('col-md-6', styles.Panel, { [styles.hidden]: !isEditorPanelVisible() })}
    >
      <div class={styles.actionsHolder}>
        <Button
          value={<Icon name="close" />}
          variant={'inline'}
          class={styles.close}
          onClick={() => toggleEditorPanel()}
        />
      </div>
      <div class={clsx(styles.actionsHolder, styles.scrolled)}>
        <section>
          <p>
            <span class={styles.link} onClick={handlePublishClick}>
              {t('Publish')}
            </span>
          </p>
          <p>
            <span class={styles.link} onClick={handleSaveClick}>
              {t('Save draft')}
            </span>
          </p>
        </section>

        <section>
          <p>
            <a class={clsx(styles.link, styles.linkWithIcon)}>
              <Icon name="eye" class={styles.icon} />
              {t('Preview')}
            </a>
          </p>
          <p>
            <a
              class={clsx(styles.link, styles.linkWithIcon)}
              onClick={() => toggleEditorPanel()}
              href={getPagePath(router, 'edit', { shoutId: props.shoutId.toString() })}
            >
              <Icon name="pencil-outline" class={styles.icon} />
              {t('Editing')}
            </a>
          </p>
          <p>
            <a class={clsx(styles.link, styles.linkWithIcon)}>
              <Icon name="feed-discussion" class={styles.icon} />
              {t('FAQ')}
            </a>
          </p>
        </section>

        <section>
          <p>
            <a class={styles.link}>{t('Invite co-authors')}</a>
          </p>
          <p>
            <a
              class={styles.link}
              onClick={() => toggleEditorPanel()}
              href={getPagePath(router, 'editSettings', { shoutId: props.shoutId.toString() })}
            >
              {t('Publication settings')}
            </a>
          </p>
          <p>
            <span class={styles.link} onClick={handleFixTypographyClick}>
              {t('Fix typography')}
            </span>
          </p>
          <p>
            <a class={styles.link}>{t('Corrections history')}</a>
          </p>
        </section>

        <section>
          <p>
            <a class={styles.link} href="/how-to-write-a-good-article">
              {t('How to write a good article')}
            </a>
          </p>
          <p>
            <a class={styles.link} href="#">
              {t('Hotkeys')}
            </a>
          </p>
          <p>
            <a class={styles.link} href="#">
              {t('Help')}
            </a>
          </p>
        </section>

        <div class={styles.stats}>
          <div>
            {t('Characters')}: <em>{wordCounter().characters}</em>
          </div>
          <div>
            {t('Words')}: <em>{wordCounter().words}</em>
          </div>
          {/*<div>*/}
          {/*  {t('Last rev.')}: <em>22.03.22 в 18:20</em>*/}
          {/*</div>*/}
        </div>
      </div>
    </aside>
  )
}
