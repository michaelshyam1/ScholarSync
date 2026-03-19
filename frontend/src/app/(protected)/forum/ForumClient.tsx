'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Profile } from '@/types/Profile';

type Post = {
  id: string;
  title: string;
  content: string;
  author_email: string;
  created_at: string;
};

type Reply = {
  id: string;
  post_id: string;
  content: string;
  author_email: string;
  created_at: string;
};

export function ForumClient({ user }: { user: Profile }) {
  const supabase = createClient();

  const [posts, setPosts] = useState<Post[]>([]);
  const [replies, setReplies] = useState<Record<string, Reply[]>>({});
  const [replyContent, setReplyContent] = useState<Record<string, string>>({});
  const [newPost, setNewPost] = useState({ title: '', content: '' });

  const fetchPostsAndReplies = useCallback(async () => {
    const { data: postData } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });

    setPosts((postData as Post[]) || []);

    const { data: replyData } = await supabase
      .from('replies')
      .select('*')
      .order('created_at', { ascending: true });

    const groupedReplies: Record<string, Reply[]> = {};
    (replyData as Reply[] | null)?.forEach(reply => {
      if (!groupedReplies[reply.post_id]) groupedReplies[reply.post_id] = [];
      groupedReplies[reply.post_id].push(reply);
    });

    setReplies(groupedReplies);
  }, [supabase]);

  useEffect(() => {
    fetchPostsAndReplies();
  }, [fetchPostsAndReplies]);

  if (!user) {
    return <div>Please log in to view the forum.</div>;
  }

  const handlePostSubmit = async () => {
    const { error } = await supabase.from('posts').insert([
      {
        title: newPost.title,
        content: newPost.content,
        author_email: user.full_name || 'Unknown',
        scholarship_tag: 'general',
      },
    ]);

    if (!error) {
      setNewPost({ title: '', content: '' });
      fetchPostsAndReplies();
    }
  };

  const handleReplySubmit = async (postId: string) => {
    const content = replyContent[postId];
    if (!content) return;

    const { error } = await supabase.from('replies').insert([
      {
        post_id: postId,
        content,
        author_email: user.full_name || 'Unknown',
      },
    ]);

    if (!error) {
      setReplyContent(prev => ({ ...prev, [postId]: '' }));
      fetchPostsAndReplies();
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-[#6b3fa0] mb-6">💬 Forum</h1>

      {/* Create Post */}
      <div className="mb-8 bg-white p-4 shadow rounded">
        <h2 className="font-semibold mb-2">Create a Post</h2>
        <input
          className="border p-2 w-full mb-2"
          placeholder="Post title"
          value={newPost.title}
          onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
        />
        <textarea
          className="border p-2 w-full mb-2"
          placeholder="Write your content here..."
          value={newPost.content}
          onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
        />
        <button onClick={handlePostSubmit} className="bg-[#6b3fa0] text-white px-4 py-2 rounded">
          Submit
        </button>
      </div>

      {/* Posts List */}
      {posts.map((post) => (
        <div key={post.id} className="mb-6 p-4 border bg-white rounded">
          <h3 className="font-semibold text-[#6b3fa0]">{post.title}</h3>
          <p className="text-sm text-gray-700">{post.content}</p>
          <div className="flex items-center justify-between mt-1">
            <p className="text-xs text-gray-500">By {post.author_email}</p>
            {post.author_email === (user.full_name || 'Unknown') && (
              <button
                onClick={async () => {
                  const { error } = await supabase.from('posts').delete().eq('id', post.id);
                  if (!error) fetchPostsAndReplies();
                }}
                className="bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1 rounded"
              >
                Delete
              </button>
            )}
          </div>
          {/* Replies */}
          <div className="ml-4 mt-4 border-l-2 border-gray-200 pl-4">
            {(replies[post.id] || []).map((reply) => (
              <div key={reply.id} className="mb-2">
                <p className="text-sm text-gray-700">{reply.content}</p>
                <p className="text-xs text-gray-500">— {reply.author_email}</p>
              </div>
            ))}

            <textarea
              className="border p-2 w-full mt-2 text-sm"
              placeholder="Write a reply..."
              value={replyContent[post.id] || ''}
              onChange={(e) =>
                setReplyContent((prev) => ({ ...prev, [post.id]: e.target.value }))
              }
            />
            <button
              onClick={() => handleReplySubmit(post.id)}
              className="mt-2 bg-gray-800 text-white text-sm px-3 py-1 rounded"
            >
              Reply
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
