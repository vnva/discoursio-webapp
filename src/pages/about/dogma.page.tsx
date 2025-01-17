import { PageLayout } from '../../components/_shared/PageLayout'

// const title = t('Dogma')

export const DogmaPage = () => {
  return (
    <PageLayout>
      <article class="wide-container container--static-page">
        <div class="row">
          <div class="col-md-12 col-xl-14 offset-md-5 order-md-first">
            <h4>Редакционные принципы</h4>
            <p>
              Дискурс - журнал с открытой горизонтальной редакцией. Содержание журнала определяется прямым
              голосованием его авторов. Мы нередко занимаем различные позиции по разным проблемам, но
              придерживаемся общих профессиональных принципов:
            </p>
            <ol>
              <li>
                <b>На первое место ставим факты.</b> Наша задача - не судить, а наблюдать и непредвзято
                фиксировать происходящее. Все утверждения и выводы, которые мы делаем, подтверждаются
                фактами, цифрами, мнениями экспертов или ссылками на авторитетные источники.
              </li>
              <li>
                <b>Ответственно относимся к источникам.</b>
                Мы выбираем только надежные источники, проверяем информацию и рассказываем, как и откуда мы
                её получили, кроме случаев, когда это может нанести вред источникам. Тогда мы не раскроем
                их, даже в суде.
              </li>
              <li>
                <b>Выбираем компетентных и независимых экспертов</b>, понимая всю степень ответственности
                перед аудиторией.
              </li>
              <li>
                <b>
                  Даем возможность высказаться всем заинтересованным сторонам, но не присоединяемся ни к
                  чьему лагерю.
                </b>
                Ко всем событиям, компаниям и людям мы относимся с одинаковым скептицизмом.
              </li>
              <li>
                <b>Всегда исправляем ошибки, если мы их допустили.</b>
                Никто не безгрешен, иногда и мы ошибаемся. Заметили ошибку - отправьте{' '}
                <a href="/about/guide#editing">ремарку</a> автору или напишите нам на{' '}
                <a href="mailto:welcome@discours.io" target="_blank">
                  welcome@discours.io
                </a>
                .
              </li>
            </ol>
          </div>
        </div>
      </article>
    </PageLayout>
  )
}

export const Page = DogmaPage
