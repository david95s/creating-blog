import React, { useContext } from 'react';
/* eslint-disable no-param-reassign */
/* eslint-disable react/no-danger */
import { useRouter } from 'next/router';
import Head from 'next/head';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import Link from 'next/link';
import { RichText } from 'prismic-dom';
import Prismic from '@prismicio/client';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import { GetStaticPaths, GetStaticProps } from 'next';
import Header from '../../components/Header';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import Comments from '../../components/Comments';
import { LoadingContext } from '../../components/Contexts/LoadingContext';

interface Post {
  first_publication_date: string | null;
  last_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
  navigation: {
    prevPost: string | null;
    nextPost: string | null;
  };
  preview: boolean;
}

interface ToPrevAndNextProps {
  thePage: number;
  uid: string;
  theTitle: string;
}

export default function Post({
  post,
  navigation,
  preview,
}: PostProps): JSX.Element {
  const [objtPrevAndNext, setObjtPrevAndNext] = React.useState({
    nextObjt: null,
    prevObjt: null,
  });

  async function retunrObjtToPrevAndNext(
    direction: string
  ): Promise<ToPrevAndNextProps> {
    const directionResponse = await fetch(`${direction}`).then(r => r.json());
    return {
      thePage: directionResponse.page,
      uid: directionResponse.results[0].uid,
      theTitle: directionResponse.results[0].data.title,
    };
  }

  const { setLoading } = useContext(LoadingContext);

  React.useEffect(() => {
    async function theIniatlFetch(): Promise<void> {
      if (navigation) {
        const { prevPost, nextPost } = navigation;
        if (prevPost) {
          const prevObjt = await retunrObjtToPrevAndNext(prevPost);
          setObjtPrevAndNext(old => {
            return { ...old, prevObjt };
          });
        }
        if (nextPost) {
          const nextObjt = await retunrObjtToPrevAndNext(nextPost);
          setObjtPrevAndNext(old => {
            return { ...old, nextObjt };
          });
        }
      }
    }
    theIniatlFetch();

    setLoading(false);
    return () => {
      setObjtPrevAndNext({
        nextObjt: null,
        prevObjt: null,
      });
    };
  }, [navigation, setLoading]);

  const router = useRouter();

  if (router.isFallback) {
    return <h1>Carregando...</h1>;
  }

  const totalWords = post.data.content.reduce((acumalator, item) => {
    acumalator += item.heading.split(' ').length;

    item.body.forEach(insideItem => {
      acumalator += insideItem.text.split(' ').length;
    });
    return acumalator;
  }, 0);

  const readTime = Math.ceil(totalWords / 200);

  const formatedDate = format(
    new Date(post.first_publication_date),
    'dd MMM yyyy',
    {
      locale: ptBR,
    }
  );

  const isPostEdited =
    post.first_publication_date !== post.last_publication_date;

  let editionDate;
  if (isPostEdited) {
    editionDate = format(
      new Date(post.last_publication_date),
      "'*editado em' dd MMM yyyy', às' H':'m ",
      {
        locale: ptBR,
      }
    );
  }

  function hadlePassToPage(): void {
    setLoading(true);
  }

  return (
    <>
      <Head>
        <title>{post?.data.title} | spacetraveling</title>
      </Head>
      <Header />
      <img
        src={post?.data.banner.url}
        alt="Banner da pagina post"
        className={styles.bannerImg}
      />
      <main className={commonStyles.container}>
        <div className={styles.post}>
          <div className={styles.postTop}>
            <h1>{post?.data.title}</h1>
            <ul>
              <li>
                <FiCalendar />
                {formatedDate}
              </li>
              <li>
                <FiUser />
                {post.data.author}
              </li>
              <li>
                <FiClock />
                {`${readTime} min`}
              </li>
            </ul>

            {isPostEdited && <span>{editionDate}</span>}
          </div>

          {post?.data.content.map(item => {
            return (
              <article key={item.heading}>
                <h2>{item.heading}</h2>
                <div
                  className={styles.postContent}
                  dangerouslySetInnerHTML={{
                    __html: RichText.asHtml(item.body),
                  }}
                />
              </article>
            );
          })}
        </div>

        {preview && (
          <aside>
            <Link href="/api/exit-preview">
              <a className={commonStyles.preview}>Sair do modo Preview</a>
            </Link>
          </aside>
        )}

        <section className={`${styles.navigation} ${commonStyles.container}`}>
          {objtPrevAndNext.prevObjt && (
            <div>
              <h3>{objtPrevAndNext.prevObjt.theTitle}</h3>
              <button type="button" onClick={hadlePassToPage}>
                <Link
                  href={`/post/${objtPrevAndNext.prevObjt.uid}${objtPrevAndNext.prevObjt.thePage}`}
                >
                  <a>Anterior</a>
                </Link>
              </button>
            </div>
          )}
          {objtPrevAndNext.nextObjt && (
            <div className={styles.rightDiv}>
              <h3>{objtPrevAndNext.nextObjt.theTitle}</h3>
              <button type="button" onClick={hadlePassToPage}>
                <Link
                  href={`/post/${objtPrevAndNext.nextObjt.uid}${objtPrevAndNext.nextObjt.thePage}`}
                >
                  <a>Proximo</a>
                </Link>
              </button>
            </div>
          )}
        </section>

        <Comments />
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query([
    Prismic.predicates.at('document.type', 'posts'),
  ]);

  const paths = posts.results.map(item => {
    return {
      params: {
        slug: item.uid,
      },
    };
  });

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({
  params,
  preview = false,
  previewData,
}) => {
  const prismic = getPrismicClient();
  const { slug } = params;

  const lastIndex = slug.length - 1;

  const thePage = Number(slug[lastIndex]);

  const pureSlug = slug.slice(0, lastIndex);

  const response = await prismic.getByUID('posts', String(pureSlug), {
    ref: previewData?.ref || null,
  });

  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      pageSize: 1,
      page: thePage,
    }
  );

  const { prev_page: prevPost, next_page: nextPost } = postsResponse;

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    last_publication_date: response.last_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      author: response.data.author,
      banner: {
        url: response.data.banner.url,
      },
      content: response.data.content,
    },
  };

  return {
    props: {
      post,
      navigation: {
        prevPost,
        nextPost,
      },
      preview,
    },
    revalidate: 1800,
  };
};
