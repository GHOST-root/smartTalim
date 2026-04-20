import React, { useState, useEffect } from 'react';
// import './Nimayangilik.css';

export default function Nimayangilik() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/posts');
      const data = await response.json();
      setPosts(data);
      setLoading(false);
    } catch (error) {
      console.error('Xato:', error);
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('O\'chirilsinmi?')) {
      try {
        await fetch(`http://localhost:5000/api/posts/${id}`, {
          method: 'DELETE',
        });
        setPosts(posts.filter((post) => post.id !== id));
      } catch (error) {
        console.error('O\'chirish xatosi:', error);
      }
    }
  };

  const handleEdit = (id) => {
    alert(`Post tahrir qilish: ${id}`);
  };

  const filteredPosts = filter === 'all' 
    ? posts 
    : posts.filter((post) => post.category === filter);

  return (
    <div className="nimayangilik-container">
      <h1>Nima yangiliklar?</h1>
      
      <div className="filters">
        <button 
          className={filter === 'all' ? 'active' : ''}
          onClick={() => setFilter('all')}
        >
          Hammasi
        </button>
        <button 
          className={filter === 'yangilik' ? 'active' : ''}
          onClick={() => setFilter('yangilik')}
        >
          Yangiliklar
        </button>
        <button 
          className={filter === 'blog' ? 'active' : ''}
          onClick={() => setFilter('blog')}
        >
          Blog
        </button>
      </div>

      {loading ? (
        <p className="loading">Yuklanmoqda...</p>
      ) : filteredPosts.length === 0 ? (
        <p className="empty">Hech qanday post topilmadi</p>
      ) : (
        <div className="posts-list">
          {filteredPosts.map((post) => (
            <div key={post.id} className="post-card">
              <div className="post-header">
                <h2>{post.title}</h2>
                <span className="category">{post.category}</span>
              </div>
              <p className="date">
                📅 {new Date(post.createdAt).toLocaleDateString('uz-UZ')}
              </p>
              <p className="content">{post.description}</p>
              <div className="post-actions">
                <button 
                  className="edit-btn"
                  onClick={() => handleEdit(post.id)}
                >
                  ✏️ Tahrir
                </button>
                <button 
                  className="delete-btn"
                  onClick={() => handleDelete(post.id)}
                >
                  🗑️ O'chirish
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
