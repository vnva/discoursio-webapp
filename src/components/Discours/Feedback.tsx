import { hideModal } from '../../stores/ui'
import { useLocalize } from '../../context/localize'

export const Feedback = () => {
  const { t } = useLocalize()

  const action = '/user/feedback'
  const method = 'post'
  let msgElement: HTMLTextAreaElement | undefined
  let contactElement: HTMLInputElement | undefined
  const submit = async () => {
    await fetch(action, {
      method,
      headers: {
        accept: 'application/json',
        'content-type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify({ contact: contactElement?.value, message: msgElement?.textContent })
    })
    hideModal()
  }

  return (
    <form method={method} action={action}>
      <input type="text" name="contact" placeholder="email" ref={contactElement} />
      <textarea cols="12" name="message" rows="3" placeholder={t('Write to us')} ref={msgElement} />
      <input type="submit" onClick={submit} />
    </form>
  )
}
