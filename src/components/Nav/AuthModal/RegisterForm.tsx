import { Show } from 'solid-js/web'
import type { JSX } from 'solid-js'
import { t } from '../../../utils/intl'
import styles from './AuthModal.module.scss'
import { clsx } from 'clsx'
import { SocialProviders } from './SocialProviders'
import { checkEmail, register, useAuthStore } from '../../../stores/auth'
import { createSignal } from 'solid-js'
import { isValidEmail } from './validators'
import { ApiError } from '../../../utils/apiClient'
import { email, setEmail } from './sharedLogic'
import { useRouter } from '../../../stores/router'
import type { AuthModalSearchParams } from './types'

type FormFields = {
  name: string
  email: string
  password: string
}

type ValidationErrors = Partial<Record<keyof FormFields, string | JSX.Element>>

export const RegisterForm = () => {
  const { changeSearchParam } = useRouter<AuthModalSearchParams>()

  const { emailChecks } = useAuthStore()

  const [submitError, setSubmitError] = createSignal('')
  const [name, setName] = createSignal('')
  const [password, setPassword] = createSignal('')
  const [isSubmitting, setIsSubmitting] = createSignal(false)
  const [validationErrors, setValidationErrors] = createSignal<ValidationErrors>({})

  const handleEmailInput = (newEmail: string) => {
    setValidationErrors(({ email: _notNeeded, ...rest }) => rest)
    setEmail(newEmail)
  }

  const handleEmailBlur = () => {
    if (isValidEmail(email())) {
      checkEmail(email())
    }
  }

  const handlePasswordInput = (newPassword: string) => {
    setValidationErrors(({ password: _notNeeded, ...rest }) => rest)
    setPassword(newPassword)
  }

  const handleNameInput = (newPasswordCopy: string) => {
    setValidationErrors(({ name: _notNeeded, ...rest }) => rest)
    setName(newPasswordCopy)
  }

  const handleSubmit = async (event: Event) => {
    event.preventDefault()

    setSubmitError('')

    const newValidationErrors: ValidationErrors = {}

    if (!name()) {
      newValidationErrors.name = t('Please enter a name to sign your comments and publication')
    }

    if (!email()) {
      newValidationErrors.email = t('Please enter email')
    } else if (!isValidEmail(email())) {
      newValidationErrors.email = t('Invalid email')
    }

    if (!password()) {
      newValidationErrors.password = t('Please enter password')
    }

    setValidationErrors(newValidationErrors)

    const emailCheckResult = await checkEmail(email())

    const isValid = Object.keys(newValidationErrors).length === 0 && !emailCheckResult

    if (!isValid) {
      return
    }

    setIsSubmitting(true)

    try {
      await register({
        name: name(),
        email: email(),
        password: password()
      })
    } catch (error) {
      if (error instanceof ApiError && error.code === 'user_already_exists') {
        return
      }

      setSubmitError(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h4>{t('Create account')}</h4>
      <Show when={submitError()}>
        <div class={styles.authInfo}>
          <ul>
            <li class={styles.warn}>{submitError()}</li>
          </ul>
        </div>
      </Show>
      <div class="pretty-form__item">
        <input
          id="name"
          name="name"
          type="text"
          placeholder={t('Full name')}
          autocomplete=""
          onInput={(event) => handleNameInput(event.currentTarget.value)}
        />
        <label for="name">{t('Full name')}</label>
      </div>
      <Show when={validationErrors().name}>
        <div class={styles.validationError}>{validationErrors().name}</div>
      </Show>
      <div class="pretty-form__item">
        <input
          id="email"
          name="email"
          autocomplete="email"
          type="text"
          value={email()}
          placeholder={t('Email')}
          onInput={(event) => handleEmailInput(event.currentTarget.value)}
          onBlur={handleEmailBlur}
        />
        <label for="email">{t('Email')}</label>
      </div>
      <Show when={validationErrors().email}>
        <div class={styles.validationError}>{validationErrors().email}</div>
      </Show>
      <Show when={emailChecks()[email()]}>
        <div class={styles.validationError}>
          {t("This email is already taken. If it's you")},{' '}
          <a
            href="#"
            onClick={(event) => {
              event.preventDefault()
              changeSearchParam('mode', 'login')
            }}
          >
            {t('enter')}
          </a>
        </div>
      </Show>
      <div class="pretty-form__item">
        <input
          id="password"
          name="password"
          autocomplete="current-password"
          type="password"
          placeholder={t('Password')}
          onInput={(event) => handlePasswordInput(event.currentTarget.value)}
        />
        <label for="password">{t('Password')}</label>
      </div>
      <Show when={validationErrors().password}>
        <div class={styles.validationError}>{validationErrors().password}</div>
      </Show>

      <div>
        <button class={clsx('button', styles.submitButton)} disabled={isSubmitting()} type="submit">
          {isSubmitting() ? '...' : t('Join')}
        </button>
      </div>

      <SocialProviders />

      <div class={styles.authControl}>
        <span class={styles.authLink} onClick={() => changeSearchParam('mode', 'login')}>
          {t('I have an account')}
        </span>
      </div>
    </form>
  )
}
