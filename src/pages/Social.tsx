import { useState, useEffect } from 'react';
import { Instagram, Facebook } from 'lucide-react';
import { supabase, SocialPost } from '../lib/supabase';
import PageHeader from '../components/PageHeader';
import Section from '../components/Section';
import Card from '../components/Card';

export default function Social() {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSocialPosts();
  }, []);

  async function fetchSocialPosts() {
    try {
      const { data, error } = await supabase
        .from('social_posts')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching social posts:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Social"
        subtitle="See recent work and updates from the field"
      />

      <Section className="bg-hero animate-gradient text-white">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xl text-white mb-8 drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
            Stay updated with our latest projects and tree care tips
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a
              href="https://www.instagram.com/treetek?igsh=MXhjbGx5bGZ6MHht&utm_source=qr"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-600 hover:bg-emerald-700 flex items-center justify-center text-white font-semibold py-4 px-8 rounded-md shadow-lg transition-all"
            >
              <Instagram className="w-6 h-6 mr-3" />
              Follow on Instagram
            </a>
            <a
              href="https://www.facebook.com/share/1BLrG5a8eB/?mibextid=wwXIfr"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-600 hover:bg-emerald-700 flex items-center justify-center text-white font-semibold py-4 px-8 rounded-md shadow-lg transition-all"
            >
              <Facebook className="w-6 h-6 mr-3" />
              Follow on Facebook
            </a>
          </div>
        </div>
      </Section>

      <Section variant="white">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Recent Posts
          </h2>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent"></div>
              <p className="mt-4 text-gray-600">Loading posts...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg mb-4">
                No posts yet. Follow us on social media to see our latest updates!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <a
                  key={post.id}
                  href={post.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group"
                >
                  <Card className="h-full hover:shadow-xl transition">
                    <div className="flex items-center mb-4">
                      {post.platform === 'instagram' ? (
                        <Instagram className="w-6 h-6 text-pink-600 mr-2" />
                      ) : (
                        <Facebook className="w-6 h-6 text-blue-600 mr-2" />
                      )}
                      <span className="font-semibold text-gray-900 capitalize">
                        {post.platform}
                      </span>
                    </div>

                    <p className="text-gray-700 line-clamp-4 mb-4">{post.caption}</p>

                    <span className="text-emerald-600 font-semibold group-hover:underline">
                      View Post →
                    </span>
                  </Card>
                </a>
              ))}
            </div>
          )}
      </Section>
    </div>
  );
}
