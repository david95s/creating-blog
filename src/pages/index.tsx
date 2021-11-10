import { useEffect, useState } from 'react';
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

interface Post {
  uid?: string;
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
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  const formattesPost = postsPagination.results.map(item => {
    return {
      ...item,
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

  useEffect(() => {
    console.log(nextPage);
  }, [nextPage]);

  async function handleNextPage(): Promise<void> {
    if (currentPage !== 1 && nextPage === null) {
      return;
    }

    const postResults = await fetch(`${nextPage}`).then(r => r.json());
    setNextPage(postResults.next_page);
    setCurrentPage(postResults.page);

    const newPosts = postResults.results.map(item => {
      const { data, id, first_publication_date } = item;
      return {
        uid: id,
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

  /*
  SpaceTravellingMyBlog
  */
  return (
    <>
      <main className={commonStyles.container}>
        <Header />

        <div className={styles.posts}>
          {posts.map(item => (
            // <p >{item.first_publication_date}</p>
            <Link href={`/post/${item.uid}`} key={item.uid}>
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
            </Link>
          ))}

          {nextPage && (
            <button type="button" onClick={handleNextPage}>
              Carregar mais posts
            </button>
          )}
        </div>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = await getPrismicClient();

  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      // fetch: ['posts.title', 'posts.banner'], <= Caso eu queira campos especificos
      pageSize: 1,
    }
  );

  const posts = postsResponse.results.map(item => {
    const { data, id, first_publication_date } = item;
    return {
      uid: id,
      first_publication_date,
      data: {
        title: data.title,
        subtitle: data.subtitle,
        author: data.author,
      },
    };
  });

  const postsPagination = {
    next_page: postsResponse.next_page,
    results: posts,
  };

  return {
    props: {
      postsPagination,
    },
  };
};
