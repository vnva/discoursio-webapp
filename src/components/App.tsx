// FIXME: breaks on vercel, research
// import 'solid-devtools'

import { MODALS, showModal } from '../stores/ui'
import { Component, createEffect, createMemo, Suspense } from 'solid-js'
import { ROUTES, useRouter } from '../stores/router'
import { Dynamic } from 'solid-js/web'

import type { PageProps, RootSearchParams } from '../pages/types'
import { HomePage } from '../pages/index.page'
import { AllTopicsPage } from '../pages/allTopics.page'
import { TopicPage } from '../pages/topic.page'
import { AllAuthorsPage } from '../pages/allAuthors.page'
import { AuthorPage } from '../pages/author.page'
import { FeedPage } from '../pages/feed.page'
import { ArticlePage } from '../pages/article.page'
import { SearchPage } from '../pages/search.page'
import { FourOuFourPage } from '../pages/fourOuFour.page'
import { DiscussionRulesPage } from '../pages/about/discussionRules.page'
import { DogmaPage } from '../pages/about/dogma.page'
import { GuidePage } from '../pages/about/guide.page'
import { HelpPage } from '../pages/about/help.page'
import { ManifestPage } from '../pages/about/manifest.page'
import { PartnersPage } from '../pages/about/partners.page'
import { PrinciplesPage } from '../pages/about/principles.page'
import { ProjectsPage } from '../pages/about/projects.page'
import { TermsOfUsePage } from '../pages/about/termsOfUse.page'
import { ThanksPage } from '../pages/about/thanks.page'
import { CreatePage } from '../pages/create.page'
import { ConnectPage } from '../pages/connect.page'
import { InboxPage } from '../pages/inbox.page'
import { LayoutShoutsPage } from '../pages/layoutShouts.page'
import { SessionProvider } from '../context/session'
import { ProfileSettingsPage } from '../pages/profile/profileSettings.page'
import { ProfileSecurityPage } from '../pages/profile/profileSecurity.page'
import { ProfileSubscriptionsPage } from '../pages/profile/profileSubscriptions.page'
import { CreateSettingsPage } from '../pages/createSettings.page'
import { SnackbarProvider } from '../context/snackbar'
import { LocalizeProvider } from '../context/localize'

// TODO: lazy load
// const SomePage = lazy(() => import('./Pages/SomePage'))

const pagesMap: Record<keyof typeof ROUTES, Component<PageProps>> = {
  inbox: InboxPage,
  expo: LayoutShoutsPage,
  connect: ConnectPage,
  create: CreatePage,
  createSettings: CreateSettingsPage,
  home: HomePage,
  topics: AllTopicsPage,
  topic: TopicPage,
  authors: AllAuthorsPage,
  author: AuthorPage,
  feed: FeedPage,
  article: ArticlePage,
  search: SearchPage,
  discussionRules: DiscussionRulesPage,
  dogma: DogmaPage,
  guide: GuidePage,
  help: HelpPage,
  manifest: ManifestPage,
  projects: ProjectsPage,
  partners: PartnersPage,
  principles: PrinciplesPage,
  termsOfUse: TermsOfUsePage,
  thanks: ThanksPage,
  profileSettings: ProfileSettingsPage,
  profileSecurity: ProfileSecurityPage,
  profileSubscriptions: ProfileSubscriptionsPage
}

export const App = (props: PageProps) => {
  const { page, searchParams } = useRouter<RootSearchParams>()
  // console.debug(page())
  createEffect(() => {
    const modal = MODALS[searchParams().modal]
    if (modal) {
      showModal(modal)
    }
  })
  // console.debug(pagesMap)
  const pageComponent = createMemo(() => {
    const result = pagesMap[page()?.route || 'home']

    if (!result || page()?.path === '/404') {
      return FourOuFourPage
    }

    return result
  })

  return (
    <LocalizeProvider>
      <SnackbarProvider>
        <SessionProvider>
          <Dynamic component={pageComponent()} {...props} />
        </SessionProvider>
      </SnackbarProvider>
    </LocalizeProvider>
  )
}