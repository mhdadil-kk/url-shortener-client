import React, { useState, useEffect } from 'react';
import { Copy, Check, Trash2, ExternalLink, PlusCircle, Link as LinkIcon, BarChart2 } from 'lucide-react';
import type { Url } from '../types';
import { api, ApiClientError } from '../services/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const DashboardPage: React.FC = () => {
  const [urls, setUrls] = useState<Url[]>([]);
  const [originalUrl, setOriginalUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchUrls();
  }, []);

  const fetchUrls = async () => {
    setIsLoading(true);
    try {
      const response = await api.urls.getAll();
      if (response.data?.urls) {
        setUrls(response.data.urls);
      }
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError('Failed to load your URLs.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      const response = await api.urls.create(originalUrl);
      if (response.data?.url) {
        setUrls((prev) => [response.data!.url, ...prev]);
        setOriginalUrl('');
        setSuccess('Short URL generated successfully!');
      }
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError('Failed to create short URL.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUrl = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this short URL?')) {
      return;
    }

    try {
      await api.urls.delete(id);
      setUrls((prev) => prev.filter((u) => u._id !== id));
      setSuccess('URL deleted successfully.');
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError('Failed to delete URL.');
      }
    }
  };

  const handleCopy = async (id: string, shortCode: string) => {
    const fullShortUrl = `${API_BASE_URL}/s/${shortCode}`;
    try {
      await navigator.clipboard.writeText(fullShortUrl);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      setError('Failed to copy to clipboard.');
    }
  };

  return (
    <div className="container">
     
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          Your Shortened Links
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Create new short links, manage destinations, and monitor click analytics.
        </p>
      </div>
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      <div className="card" style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.15rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <PlusCircle size={20} color="var(--primary)" />
          <span>Shorten a new URL</span>
        </h2>

        <form onSubmit={handleCreateUrl} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ flex: '1', minWidth: '260px' }}>
            <input
              type="url"
              required
              placeholder="https://example.com/very-long-url-to-shorten"
              value={originalUrl}
              onChange={(e) => setOriginalUrl(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting || !originalUrl.trim()}
          >
            {isSubmitting ? 'Shortening...' : 'Shorten URL'}
          </button>
        </form>
      </div>
      <div>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Active Links ({urls.length})</h2>

        {isLoading ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            Loading your links...
          </div>
        ) : urls.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <LinkIcon size={40} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem', display: 'block' }} />
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>No URLs yet</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Paste a link in the box above to generate your first shortened URL!
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {urls.map((url) => {
              const fullShortUrl = `${API_BASE_URL}/s/${url.shortCode}`;
              const isCopied = copiedId === url._id;

              return (
                <div
                  key={url._id}
                  className="card"
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '1rem',
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ flex: '1', minWidth: '260px', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                      <a
                        href={fullShortUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          color: 'var(--primary)',
                          fontWeight: 600,
                          fontSize: '1.05rem',
                          textDecoration: 'none',
                        }}
                      >
                        {fullShortUrl}
                      </a>
                      <ExternalLink size={14} color="var(--primary)" />
                    </div>

                    <p
                      style={{
                        color: 'var(--text-muted)',
                        fontSize: '0.85rem',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: '500px',
                      }}
                      title={url.originalUrl}
                    >
                      {url.originalUrl}
                    </p>

                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
                      Created: {new Date(url.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        background: 'var(--primary-light)',
                        color: 'var(--primary)',
                        padding: '0.35rem 0.65rem',
                        borderRadius: '20px',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                      }}
                    >
                      <BarChart2 size={15} />
                      <span>{url.clicks} clicks</span>
                    </div>
                    <button
                      onClick={() => handleCopy(url._id, url.shortCode)}
                      className={`btn ${isCopied ? 'btn-primary' : 'btn-outline'}`}
                      style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
                      title="Copy short link"
                    >
                      {isCopied ? <Check size={16} /> : <Copy size={16} />}
                      <span>{isCopied ? 'Copied!' : 'Copy'}</span>
                    </button>

                    <button
                      onClick={() => handleDeleteUrl(url._id)}
                      className="btn btn-outline"
                      style={{ padding: '0.5rem 0.65rem', color: 'var(--danger)', borderColor: '#fecaca' }}
                      title="Delete link"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
