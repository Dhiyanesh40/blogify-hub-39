import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Edit, Trash2, Eye, Shield, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Link, useNavigate } from "react-router-dom";

export const Dashboard = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    } else if (user) {
      fetchUserBlogs();
    }
  }, [user, authLoading, navigate]);

  const fetchUserBlogs = async () => {
    try {
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .eq('author_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setBlogs(data || []);
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBlog = async (blogId: string) => {
    try {
      const { error } = await supabase
        .from('blogs')
        .delete()
        .eq('id', blogId);

      if (error) throw error;

      setBlogs(blogs.filter(blog => blog.id !== blogId));
      toast({
        title: "Blog deleted!",
        description: "Your blog post has been deleted successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-hero">
        <div className="animate-pulse text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-6xl mx-auto"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">
                Welcome back, {profile?.display_name || profile?.username || 'Writer'}!
              </h1>
              <p className="text-muted-foreground">Manage your blog posts</p>
            </div>
            <div className="flex gap-2">
              <Button asChild className="bg-gradient-primary hover:shadow-elegant transition-all duration-300">
                <Link to="/create-blog">
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Create New Post
                </Link>
              </Button>
              {profile?.role === 'admin' && (
                <Button asChild variant="outline">
                  <Link to="/admin/verification">
                    <Shield className="w-4 h-4 mr-2" />
                    Admin Panel
                  </Link>
                </Button>
              )}
            </div>
          </div>

          {blogs.length === 0 ? (
            <Card className="bg-gradient-card border border-border/50">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <PlusCircle className="w-16 h-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No blog posts yet</h3>
                <p className="text-muted-foreground text-center mb-6">
                  Start your blogging journey by creating your first post
                </p>
                <Button asChild className="bg-gradient-primary hover:shadow-elegant transition-all duration-300">
                  <Link to="/create-blog">
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Create Your First Post
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {blogs.map((blog, index) => (
                <motion.div
                  key={blog.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="bg-gradient-card border border-border/50 relative overflow-hidden">
                    {blog.background_image_url && (
                      <div className="absolute inset-0 w-full h-full">
                        <img
                          src={blog.background_image_url}
                          alt="Blog background"
                          className="w-full h-full object-cover opacity-10"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/90 to-background/70" />
                      </div>
                    )}
                    <CardHeader className="relative z-10">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <CardTitle className="line-clamp-2 flex-1">{blog.title}</CardTitle>
                            {blog.verified && (
                              <span className="text-green-500 text-xl flex-shrink-0">✅</span>
                            )}
                          </div>
                          <CardDescription className="mt-2">
                            Created: {formatDate(blog.created_at)}
                            {blog.updated_at !== blog.created_at && (
                              <span className="block">Updated: {formatDate(blog.updated_at)}</span>
                            )}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant={blog.published ? "default" : "secondary"}>
                            {blog.published ? "Published" : "Draft"}
                          </Badge>
                          {blog.verification_requested && !blog.verified && (
                            <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                              Pending Verification
                            </Badge>
                          )}
                          {blog.verified && (
                            <Badge variant="outline" className="bg-green-100 text-green-800">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="relative z-10">
                      <p className="text-muted-foreground line-clamp-2 mb-4">
                        {blog.excerpt || blog.content.substring(0, 150) + "..."}
                      </p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Button asChild variant="outline" size="sm">
                          <Link to={`/blog/${blog.id}`}>
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </Link>
                        </Button>
                        <Button asChild variant="outline" size="sm">
                          <Link to={`/edit-blog/${blog.id}`}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteBlog(blog.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};