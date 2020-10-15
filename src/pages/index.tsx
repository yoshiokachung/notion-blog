import Link from 'next/link'
import Header from '../components/header'
import ExtLink from '../components/ext-link'
import Features from '../components/features'
import GitHub from '../components/svgs/github'
import sharedStyles from '../styles/shared.module.css'

import blogStyles from '../styles/blog.module.css'

import { getBlogLink, getDateStr, postIsPublished } from '../lib/blog-helpers'
import { textBlock } from '../lib/notion/renderers'
import getNotionUsers from '../lib/notion/getNotionUsers'
import getBlogIndex from '../lib/notion/getBlogIndex'

export async function getStaticProps({ preview }) {
  const postsTable = await getBlogIndex()

  const authorsToGet: Set<string> = new Set()
  const posts: any[] = Object.keys(postsTable)
    .map(slug => {
      const post = postsTable[slug]
      // remove draft posts in production
      if (!preview && !postIsPublished(post)) {
        return null
      }
      post.Authors = post.Authors || []
      for (const author of post.Authors) {
        authorsToGet.add(author)
      }
      return post
    })
    .filter(Boolean)

  const { users } = await getNotionUsers([...authorsToGet])

  posts.map(post => {
    post.Authors = post.Authors.map(id => users[id].full_name)
  })

  return {
    props: {
      preview: preview || false,
      posts,
    },
    unstable_revalidate: 10,
  }
}

export default ({ posts = [], preview }) => (
  <>
    <Header titlePre="Blog" />
    {preview && (
      <div className={blogStyles.previewAlertContainer}>
        <div className={blogStyles.previewAlert}>
          <b>Note:</b>
          {` `}Viewing in preview mode{' '}
          <Link href={`/api/clear-preview`}>
            <button className={blogStyles.escapePreview}>Exit Preview</button>
          </Link>
        </div>
      </div>
    )}
    <div className={`${sharedStyles.layout} ${blogStyles.blogIndex}`}>
      <h1>My Notion Blog</h1>
      {posts.length === 0 && (
        <p className={blogStyles.noPosts}>There are no posts yet</p>
      )}
      {posts.map(post => {
        return (
          <div className={blogStyles.postPreview} key={post.Slug}>
            <h3>
              <Link href="/blog/[slug]" as={getBlogLink(post.Slug)}>
                <div className={blogStyles.titleContainer}>
                  {!post.Published && (
                    <span className={blogStyles.draftBadge}>Draft</span>
                  )}
                  <a>{post.Page}</a>
                </div>
              </Link>
            </h3>
            {post.Authors.length > 0 && (
              <div className="authors">By: {post.Authors.join(' ')}</div>
            )}
            {post.Date && (
              <div className="posted">Posted: {getDateStr(post.Date)}</div>
            )}
            <p>
              {(!post.preview || post.preview.length === 0) &&
                'No preview available'}
              {(post.preview || []).map((block, idx) =>
                textBlock(block, true, `${post.Slug}${idx}`)
              )}
            </p>
          </div>
        )
      })}
      <Header titlePre="Home" />
      <div className={sharedStyles.layout}>
        <img
          src="/vercel-and-notion.png"
          height="85"
          width="250"
          alt="Vercel + Notion"
        />
        <h1>My Notion Blog</h1>
        <h2>
          Blazing Fast Notion Blog with Next.js'{' '}
          <ExtLink
            href="https://github.com/vercel/next.js/issues/9524"
            className="dotted"
            style={{ color: 'inherit' }}
          >
            SSG
          </ExtLink>
        </h2>

        <Features />

        <div className="explanation">
          <p>
            This is a statically generated{' '}
            <ExtLink href="https://nextjs.org">Next.js</ExtLink> site with a{' '}
            <ExtLink href="https://notion.so">Notion</ExtLink> powered blog that
            is deployed with <ExtLink href="https://vercel.com">Vercel</ExtLink>
            . It leverages some upcoming features in Next.js like{' '}
            <ExtLink href="https://github.com/vercel/next.js/issues/9524">
              SSG support
            </ExtLink>{' '}
            and{' '}
            <ExtLink href="https://github.com/vercel/next.js/issues/8626">
              built-in CSS support
            </ExtLink>{' '}
            which allow us to achieve all of the benefits listed above including
            blazing fast speeds, great local editing experience, and always
            being available!
          </p>

          <p>
            Get started by creating a new page in Notion and clicking the deploy
            button below. After you supply your token and the blog index id (the
            page's id in Notion) we will automatically create the table for you!
            See{' '}
            <ExtLink href="https://github.com/ijjk/notion-blog#getting-blog-index-and-token">
              here in the readme
            </ExtLink>{' '}
            for finding the new page's id. To get your token from Notion, login
            and look for a cookie under www.notion.so with the name `token_v2`.
            After finding your token and your blog's page id you should be good
            to go!
          </p>
        </div>
      </div>
    </div>
  </>
)
