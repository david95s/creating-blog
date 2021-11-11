import Document, { Head, Html, Main, NextScript } from 'next/document';

export default class MyDocument extends Document {
  render() {
    return (
      <Html lang="pt-Br">
        <Head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" />
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Roboto:wght@100;400;500&display=swap" 
            rel="stylesheet"
          />
        </Head>
        <body>
          <Main />
          <NextScript />
          <script
            async
            defer
            src="https://static.cdn.prismic.io/prismic.js?new=true&repo=spacetravellingmyblog"
          />
        </body>
      </Html>
    );
  }
}
