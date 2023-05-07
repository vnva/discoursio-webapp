import { createSignal, onMount, Show } from 'solid-js'
import { useLocalize } from '../../context/localize'
import { clsx } from 'clsx'
import styles from './Edit.module.scss'
import { Title } from '@solidjs/meta'
import type { Shout, Topic } from '../../graphql/types.gen'
import { apiClient } from '../../utils/apiClient'
import { TopicSelect } from '../Editor/TopicSelect/TopicSelect'
import { useRouter } from '../../stores/router'
import { Editor } from '../Editor/Editor'
import { Panel } from '../Editor/Panel'
import { useEditorContext } from '../../context/editor'
import { Icon } from '../_shared/Icon'

type EditViewProps = {
  shout: Shout
}

export const EditView = (props: EditViewProps) => {
  const { t } = useLocalize()

  const [topics, setTopics] = createSignal<Topic[]>(null)
  const { page } = useRouter()

  const {
    form,
    formErrors,
    actions: { setForm, setFormErrors }
  } = useEditorContext()

  const [isSlugChanged, setIsSlugChanged] = createSignal(false)

  setForm({
    shoutId: props.shout.id,
    slug: props.shout.slug,
    title: props.shout.title,
    subtitle: props.shout.subtitle,
    selectedTopics: props.shout.topics || [],
    mainTopic: props.shout.mainTopic,
    body: props.shout.body,
    coverImageUrl: props.shout.cover
  })

  onMount(async () => {
    const allTopics = await apiClient.getAllTopics()
    setTopics(allTopics)
  })

  const handleTitleInputChange = (e) => {
    const title = e.currentTarget.value
    setForm('title', title)

    if (title) {
      setFormErrors('title', '')
    }

    // if (!isSlugChanged()) {
    //   const slug = translit(title).replaceAll(' ', '-')
    //   setForm('slug', slug)
    // }
  }

  const handleSlugInputChange = (e) => {
    const slug = e.currentTarget.value

    if (slug !== form.slug) {
      setIsSlugChanged(true)
    }
    setForm('slug', slug)
  }

  const scrollTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  return (
    <>
      <button class={styles.scrollTopButton} onClick={scrollTop}>
        <Icon name="up-button" class={styles.icon} />
        <span class={styles.scrollTopButtonLabel}>{t('Scroll up')}</span>
      </button>

      <div class={styles.container}>
        <Title>{t('Write an article')}</Title>
        <form>
          <div class="wide-container">
            <div class="row">
              <div class="col-md-19 col-lg-18 col-xl-16 offset-md-5">
                <div
                  class={clsx(styles.edit, {
                    [styles.visible]: page().route === 'edit'
                  })}
                >
                  <div class={styles.inputContainer}>
                    <input
                      class={styles.titleInput}
                      type="text"
                      name="title"
                      id="title"
                      placeholder="Заголовок"
                      autocomplete="off"
                      value={form.title}
                      onInput={handleTitleInputChange}
                    />
                    <Show when={formErrors.title}>
                      <div class={styles.validationError}>{formErrors.title}</div>
                    </Show>
                  </div>

                  <input
                    class={styles.subtitleInput}
                    type="text"
                    name="subtitle"
                    id="subtitle"
                    autocomplete="off"
                    placeholder="Подзаголовок"
                    value={form.subtitle}
                    onChange={(e) => setForm('subtitle', e.currentTarget.value)}
                  />
                  <Editor
                    shoutId={props.shout.id}
                    initialContent={props.shout.body}
                    onChange={(body) => setForm('body', body)}
                  />
                </div>
                <div
                  class={clsx(styles.editSettings, {
                    [styles.visible]: page().route === 'editSettings'
                  })}
                >
                  <h1>Настройки публикации</h1>

                  <h4>Slug</h4>
                  <div class="pretty-form__item">
                    <input
                      type="text"
                      name="slug"
                      id="slug"
                      value={form.slug}
                      onChange={handleSlugInputChange}
                    />
                    <label for="slug">Slug</label>
                  </div>

                  {/*<h4>Лид</h4>*/}
                  {/*<div class="pretty-form__item">*/}
                  {/*  <textarea name="lead" id="lead" placeholder="Лид"></textarea>*/}
                  {/*  <label for="lead">Лид</label>*/}
                  {/*</div>*/}

                  {/*<h4>Выбор сообщества</h4>*/}
                  {/*<p class="description">Сообщества можно перечислить через запятую</p>*/}
                  {/*<div class="pretty-form__item">*/}
                  {/*  <input*/}
                  {/*    type="text"*/}
                  {/*    name="community"*/}
                  {/*    id="community"*/}
                  {/*    placeholder="Сообщества"*/}
                  {/*    class="nolabel"*/}
                  {/*  />*/}
                  {/*</div>*/}

                  <h4>Темы</h4>
                  {/*<p class="description">*/}
                  {/*  Добавьте несколько тем, чтобы читатель знал, о&nbsp;чем ваш материал, и&nbsp;мог найти*/}
                  {/*  его на&nbsp;страницах интересных ему тем. Темы можно менять местами, первая тема*/}
                  {/*  становится заглавной*/}
                  {/*</p>*/}
                  <div class="pretty-form__item">
                    <Show when={topics()}>
                      <TopicSelect
                        topics={topics()}
                        onChange={(newSelectedTopics) => setForm('selectedTopics', newSelectedTopics)}
                        selectedTopics={form.selectedTopics}
                      />
                    </Show>
                    {/*<input type="text" name="topics" id="topics" placeholder="Темы" class="nolabel" />*/}
                  </div>

                  {/*<h4>Соавторы</h4>*/}
                  {/*<p class="description">У каждого соавтора можно добавить роль</p>*/}
                  {/*<div class="pretty-form__item--with-button">*/}
                  {/*  <div class="pretty-form__item">*/}
                  {/*    <input type="text" name="authors" id="authors" placeholder="Введите имя или e-mail" />*/}
                  {/*    <label for="authors">Введите имя или e-mail</label>*/}
                  {/*  </div>*/}
                  {/*  <button class="button button--submit">Добавить</button>*/}
                  {/*</div>*/}

                  {/*<div class="row">*/}
                  {/*  <div class="col-md-6">Михаил Драбкин</div>*/}
                  {/*  <div class="col-md-6">*/}
                  {/*    <input type="text" name="coauthor" id="coauthor1" class="nolabel" />*/}
                  {/*  </div>*/}
                  {/*</div>*/}

                  <h4>Карточка материала на&nbsp;главной</h4>
                  <p class="description">
                    Выберите заглавное изображение для статьи, тут сразу можно увидеть как карточка будет
                    выглядеть на&nbsp;главной странице
                  </p>
                  <div class={styles.articlePreview} />
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
      <Panel shoutSlug={props.shout.slug} />
    </>
  )
}

export default EditView
