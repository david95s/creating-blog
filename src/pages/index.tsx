import Head from 'next/head';
import { useContext, useEffect, useState } from 'react';
import { GetStaticProps } from 'next';
import Link from 'next/link';
import { FiCalendar, FiUser } from 'react-icons/fi';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import Prismic from '@prismicio/client';

import Header from '../components/Header';

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { LoadingContext } from '../components/Contexts/LoadingContext';

interface Post {
  uid?: string;
  page: number;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
  page: number;
}

interface HomeProps {
  postsPagination: PostPagination;
  preview: boolean;
}

export default function Home({
  postsPagination,
  preview,
}: HomeProps): JSX.Element {
  const { page } = postsPagination;

  const formattesPost = postsPagination.results.map(item => {
    return {
      ...item,
      page,
      first_publication_date: format(
        new Date(item.first_publication_date),
        'dd MMM yyyy',
        {
          locale: ptBR,
        }
      ),
    };
  });

  const [posts, setPosts] = useState<Post[]>(formattesPost);
  const [nextPage, setNextPage] = useState(postsPagination.next_page);
  const [currentPage, setCurrentPage] = useState(1);

  const { setLoading } = useContext(LoadingContext);

  useEffect(() => {
    return () => {
      setLoading(false);
    };
  }, [setLoading]);

  function handleInsidePost(): void {
    setLoading(true);
  }

  async function handleNextPage(): Promise<void> {
    if (currentPage !== 1 && nextPage === null) {
      return;
    }

    const postResults = await fetch(`${nextPage}`).then(r => r.json());
    setNextPage(postResults.next_page);

    setCurrentPage(postResults.page);

    const newPosts = postResults.results.map(item => {
      const { data, uid, first_publication_date } = item;
      return {
        uid,
        page: postResults.page,
        first_publication_date: format(
          new Date(first_publication_date),
          'dd MMM yyyy',
          {
            locale: ptBR,
          }
        ),
        data: {
          title: data.title,
          subtitle: data.subtitle,
          author: data.author,
        },
      };
    });
    setPosts([...posts, ...newPosts]);
  }

  return (
    <>
      <Head>
        <title>Home | Spacetraveling</title>
      </Head>
      <main className={commonStyles.container}>
        <Header />
        <div className={styles.posts}>
          {posts.map(item => (
            <Link href={`/post/${item.uid}${item.page}`} key={item.uid}>
              <button
                onClick={handleInsidePost}
                className={styles.btnTothePost}
                type="button"
              >
                <a>
                  <strong>{item.data.title}</strong>
                  <p>{item.data.subtitle}</p>
                  <ul>
                    <li>
                      <FiCalendar />
                      {item.first_publication_date}
                    </li>
                    <li>
                      <FiUser />
                      {item.data.author}
                    </li>
                  </ul>
                </a>
              </button>
            </Link>
          ))}

          {nextPage && (
            <button type="button" onClick={handleNextPage}>
              Carregar mais posts
            </button>
          )}
        </div>
        {preview && (
          <aside>
            <Link href="/api/exit-preview">
              <a className={commonStyles.preview}>Sair do modo Preview</a>
            </Link>
          </aside>
        )}
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ preview = false }) => {
  const prismic = getPrismicClient();

  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      pageSize: 1,
      // page: 2,
    }
  );

  const posts = postsResponse.results.map(item => {
    const { data, uid, first_publication_date } = item;
    return {
      uid,
      first_publication_date,
      data: {
        title: data.title,
        subtitle: data.subtitle,
        author: data.author,
      },
    };
  });

  const { page } = postsResponse;

  const postsPagination = {
    next_page: postsResponse.next_page,
    results: posts,
    page,
  };

  return {
    props: {
      postsPagination,
      preview,
    },
    revalidate: 1800,
  };
};
