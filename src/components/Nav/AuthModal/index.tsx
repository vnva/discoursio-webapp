import { Show } from 'solid-js/web'
import { createEffect, createMemo, onMount } from 'solid-js'
import { t } from '../../../utils/intl'
import { hideModal } from '../../../stores/ui'
import { handleClientRouteLinkClick, useRouter } from '../../../stores/router'
import { clsx } from 'clsx'
import styles from './AuthModal.module.scss'
import { LoginForm } from './LoginForm'
import { RegisterForm } from './RegisterForm'
import { ForgotPasswordForm } from './ForgotPasswordForm'
import { EmailConfirm } from './EmailConfirm'
import type { AuthModalMode, AuthModalSearchParams } from './types'

const AUTH_MODAL_MODES: Record<AuthModalMode, AuthModalMode> = {
  login: 'login',
  register: 'register',
  'forgot-password': 'forgot-password',
  // eslint-disable-next-line sonarjs/no-duplicate-string
  'confirm-email': 'confirm-email'
}

export const AuthModal = () => {
  let rootRef: HTMLDivElement

  const { searchParams } = useRouter<AuthModalSearchParams>()

  const mode = createMemo<AuthModalMode>(() => {
    return AUTH_MODAL_MODES[searchParams().mode] || 'login'
  })

  createEffect((oldMode) => {
    if (oldMode !== mode()) {
      rootRef?.querySelector('input')?.focus()
    }
  }, null)

  return (
    <div
      ref={rootRef}
      class={clsx('row', styles.view)}
      classList={{ [styles.signUp]: mode() === 'register' || mode() === 'confirm-email' }}
    >
      <div class={clsx('col-sm-6', 'd-md-none', styles.authImage)}>
        <div
          class={styles.authImageText}
          classList={{ [styles.hidden]: mode() !== 'register' && mode() !== 'confirm-email' }}
        >
          <h2>{t('Discours')}</h2>
          <h4>{t(`Join the global community of authors!`)}</h4>
          <p class={styles.authBenefits}>
            {t(
              'Get to know the most intelligent people of our time, edit and discuss the articles, share your expertise, rate and decide what to publish in the magazine'
            )}
            .&nbsp;
            {t('New stories every day and even more!')}
          </p>
          <p class={styles.disclaimer}>
            {t('By signing up you agree with our')}{' '}
            <a
              href="/about/terms-of-use"
              onClick={(event) => {
                hideModal()
                handleClientRouteLinkClick(event)
              }}
            >
              {t('terms of use')}
            </a>
            , {t('personal data usage and email notifications')}.
          </p>
        </div>
      </div>
      <div class={clsx('col-sm-6', styles.auth)}>
        <Show when={mode() === 'login'}>
          <LoginForm />
        </Show>
        <Show when={mode() === 'register'}>
          <RegisterForm />
        </Show>
        <Show when={mode() === 'forgot-password'}>
          <ForgotPasswordForm />
        </Show>
        <Show when={mode() === 'confirm-email'}>
          <EmailConfirm />
        </Show>
      </div>
    </div>
  )
}