import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BlogCard } from "@/components/ui/blog-card";
import { Badge } from "@/components/ui/badge";
import { Users, BookOpen, TrendingUp, ArrowRight, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export const Home = () => {
  const { user } = useAuth();
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBlogs: 0,
    totalWriters: 0,
    verifiedBlogs: 0
  });

  useEffect(() => {
    fetchBlogs();
    fetchStats();
    
    // Set up realtime subscriptions
    const blogsChannel = supabase
      .channel('blogs-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'blogs' }, 
        () => {
          fetchBlogs();
          fetchStats();
        }
      )
      .subscribe();

    const profilesChannel = supabase
      .channel('profiles-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'profiles' }, 
        () => {
          fetchStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(blogsChannel);
      supabase.removeChannel(profilesChannel);
    };
  }, []);

  const fetchBlogs = async () => {
    try {
      const { data, error } = await supabase
        .from('blogs')
        .select(`
          *,
          profiles:profiles!blogs_author_id_fkey (
            display_name,
            username
          )
        `)
        .eq('published', true)
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;

      setBlogs(data || []);
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const [blogsResponse, profilesResponse, verifiedResponse] = await Promise.all([
        supabase.from('blogs').select('id', { count: 'exact' }).eq('published', true),
        supabase.from('profiles').select('id', { count: 'exact' }),
        supabase.from('blogs').select('id', { count: 'exact' }).eq('published', true).eq('verified', true)
      ]);

      setStats({
        totalBlogs: blogsResponse.count || 0,
        totalWriters: profilesResponse.count || 0,
        verifiedBlogs: verifiedResponse.count || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero relative overflow-hidden">
      {/* Background Video */}
      <div className="absolute inset-0 w-full h-full">
        <video
          autoPlay
          muted
          loop
          className="w-full h-full object-cover opacity-30"
        >
          <source
            src="https://videos.pexels.com/video-files/3571264/3571264-uhd_2560_1440_30fps.mp4"
            type="video/mp4"
          />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-text bg-clip-text text-transparent">
            Welcome to Blogify
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Discover amazing stories, share your thoughts, and connect with writers from around the world.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <Button asChild size="lg" className="bg-gradient-primary hover:shadow-elegant transition-all duration-300">
                <Link to="/dashboard">Go to Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button asChild size="lg" className="bg-gradient-primary hover:shadow-elegant transition-all duration-300">
                  <Link to="/register">Get Started</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/login">Sign In</Link>
                </Button>
              </>
            )}
          </div>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
        >
          <Card className="bg-gradient-card border border-border/50 backdrop-blur-sm">
            <CardHeader className="text-center pb-3">
              <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-3">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-2xl">{stats.totalBlogs}</CardTitle>
              <CardDescription>Blog Posts</CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="bg-gradient-card border border-border/50 backdrop-blur-sm">
            <CardHeader className="text-center pb-3">
              <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-2xl">{stats.totalWriters}</CardTitle>
              <CardDescription>Writers</CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="bg-gradient-card border border-border/50 backdrop-blur-sm">
            <CardHeader className="text-center pb-3">
              <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-2xl">{stats.verifiedBlogs}</CardTitle>
              <CardDescription>Verified Blogs</CardDescription>
            </CardHeader>
          </Card>
        </motion.div>

        {/* Featured Blogs Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
            Latest Blog Posts
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover the most recent and engaging content from our community
          </p>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-muted/50 rounded-lg h-64 backdrop-blur-sm"></div>
              </div>
            ))}
          </div>
        ) : blogs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Card className="bg-gradient-card/90 border border-border/50 backdrop-blur-sm max-w-md mx-auto">
              <CardContent className="p-8">
                <h3 className="text-xl font-semibold mb-4">No blogs yet</h3>
                <p className="text-muted-foreground mb-6">
                  Be the first to share your story with the world!
                </p>
                <Button asChild className="bg-gradient-primary hover:shadow-elegant transition-all duration-300">
                  <Link to="/register">
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Get Started
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((blog, index) => (
              <BlogCard
                key={blog.id}
                id={blog.id}
                title={blog.title}
                content={blog.content}
                author={blog.profiles?.display_name || blog.profiles?.username || 'Anonymous'}
                createdAt={blog.created_at}
                tags={blog.tags || []}
                index={index}
                verified={blog.verified}
                backgroundImageUrl={blog.background_image_url}
              />
            ))}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center mt-16"
        >
          <Button asChild variant="outline" size="lg" className="backdrop-blur-sm">
            <Link to="/register">
              View All Posts
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </div>
  );
};