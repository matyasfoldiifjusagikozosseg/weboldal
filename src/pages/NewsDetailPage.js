import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import newsData from '../news.json'; // To find the markdown file path

const NewsDetailPage = () => {
  const { newsId } = useParams();
  const [markdown, setMarkdown] = useState('');
  const [newsItem, setNewsItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Find the news item from newsData using newsId (which will be the title or a unique ID)
    // For this example, we'll assume newsId matches the 'title' for simplicity,
    // or an 'id' field if you add one to your news.json.
    // Let's assume newsId will be an index for now for easier lookup.
    const item = newsData.find(n => n.id === newsId || n.title.toLowerCase().replace(/\s+/g, '-') === newsId);

    if (item && item.markdownFile) {
      setNewsItem(item);
      fetch(process.env.PUBLIC_URL + '/' + item.markdownFile)
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.text();
        })
        .then(text => {
          setMarkdown(text);
          setLoading(false);
        })
        .catch(err => {
          console.error("Failed to fetch markdown:", err);
          setError('Hír nem található vagy hiba történt a betöltés közben.');
          setLoading(false);
        });
    } else {
      setError('Hír nem található.');
      setLoading(false);
    }
  }, [newsId]);

  if (loading) {
    return <div className="p-8 text-center">Betöltés...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 bg-mik-white text-mik-dark-blue shadow-xl rounded-lg my-8">
      {newsItem && (
        <div className="mb-6 pb-4 border-b border-mik-light-gray">
          <h1 className="text-3xl md:text-4xl font-bold text-mik-blue mb-2">{newsItem.title}</h1>
          <p className="text-sm text-mik-gray">Publikálva: {new Date(newsItem.date).toLocaleDateString('hu-HU', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      )}
      <article className="prose lg:prose-xl max-w-none prose-headings:text-mik-blue prose-strong:text-mik-dark-blue prose-a:text-mik-orange hover:prose-a:text-mik-yellow">
        <ReactMarkdown>{markdown}</ReactMarkdown>
      </article>
    </div>
  );
};

export default NewsDetailPage;
