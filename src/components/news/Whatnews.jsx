import React, { useState } from 'react';
import './App.css'

export default function Whatnews() {
  const [blogs, setBlogs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [activeBlogId, setActiveBlogId] = useState(null);
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');

  const handleCreateClick = () => {
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setFormTitle('');
    setFormContent('');
  };

  const handleAddBlog = () => {
    if (formTitle.trim()) {
      const newBlog = {
        id: Date.now(),
        title: formTitle,
        content: formContent,
        views: 0,
        date: new Date().toLocaleDateString('uz-UZ'),
      };
      setBlogs([...blogs, newBlog]);
      setActiveBlogId(newBlog.id);
      setFormTitle('');
      setFormContent('');
      setShowForm(false);
    }
  };

  const handleBlogClick = (id) => {
    setActiveBlogId(id);
    const blog = blogs.find(b => b.id === id);
    if (blog) {
      setBlogs(blogs.map(b => 
        b.id === id ? { ...b, views: b.views + 1 } : b
      ));
    }
  };

  const activeBlog = blogs.find(b => b.id === activeBlogId);

  return (
    <div className="whatnews-wrapper">
      {/* Header */}
      <div className="whatnews-header">
        <h2>Blog: Nima yangiliklar?</h2>
        <button className="create-btn" onClick={handleCreateClick}>
          Yaratish
        </button>
      </div>

      {/* Main Content */}
      <div className="whatnews-container">
        {/* Left Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-label">Blogs</div>
          
          {blogs.length === 0 ? (
            <div className="empty-sidebar">
              <p>Hali bloglar yo'q</p>
            </div>
          ) : (
            blogs.map(blog => (
              <div
                key={blog.id}
                className={`blog-item ${activeBlogId === blog.id ? 'active' : ''}`}
                onClick={() => handleBlogClick(blog.id)}
              >
                <div className="blog-item-content">
                  <p className="blog-title">{blog.title}</p>
                </div>
                <div className="blog-item-footer">
                  <span className="view-count">👁️ {blog.views}</span>
                </div>
              </div>
            ))
          )}
        </aside>

        {/* Right Main Content */}
        <div className="main-content">
          {!showForm && blogs.length === 0 ? (
            // Bomboš varoq
            <div className="empty-page">
              <p>Hali bloglar yo'q</p>
              <p className="empty-hint">"Yaratish" tugmasini bosing blog qo'shish uchun</p>
            </div>
          ) : showForm ? (
            // Form ko'rinishi
            <div className="add-blog-form">
              <div className="form-header">
                <h3>Blog Qo'shish</h3>
                <span className="form-words">{formContent.length}/1000</span>
              </div>

              <div className="form-group">
                <label>Sarlavhasi</label>
                <input
                  type="text"
                  placeholder="Blog sarlavhasini kiriting..."
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Matn</label>
                <textarea
                  placeholder="Insert text here"
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  className="form-textarea"
                  maxLength="1000"
                ></textarea>
              </div>

              <div className="form-toolbar">
                <span className="toolbar-label">Normal</span>
                <span className="toolbar-label">Sans Serif</span>
                <div className="toolbar-icons">
                  <button>B</button>
                  <button>I</button>
                  <button>U</button>
                  <button>≡</button>
                  <button>•</button>
                  <button>🔗</button>
                  <button>📋</button>
                  <button>🖼️</button>
                  <button>A</button>
                  <button>∑</button>
                </div>
              </div>

              <div className="form-actions">
                <button className="cancel-btn" onClick={handleCancelForm}>
                  Bekor qilish
                </button>
                <button className="submit-btn" onClick={handleAddBlog}>
                  Saqlash
                </button>
              </div>
            </div>
          ) : activeBlog ? (
            // Blog ma'lumotlari ko'rinishi
            <div className="post-display">
              <div className="post-header">
                <div className="post-title-section">
                  <span className="flag-large">🚩</span>
                  <h3>{activeBlog.title}</h3>
                </div>
                <div className="post-actions">
                  <span className="emoji">🔔</span>
                  <span className="emoji">⭕</span>
                </div>
              </div>

              <div className="post-meta">
                <span className="meta-date">{activeBlog.date}</span>
                <span className="meta-divider">·</span>
                <span className="meta-comments">👁️ {activeBlog.views}</span>
              </div>

              <div className="post-body">
                <p>{activeBlog.content}</p>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}