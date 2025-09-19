import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, Clock, User, Calendar, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export const AdminVerification = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading) {
      if (!user || profile?.role !== 'admin') {
        navigate('/');
        return;
      }
      fetchBlogsForVerification();
    }
  }, [user, profile, authLoading, navigate]);

  const fetchBlogsForVerification = async () => {
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
        .eq('verification_requested', true)
        .eq('verified', false)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setBlogs(data || []);
    } catch (error) {
      console.error('Error fetching blogs for verification:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyBlog = async (blogId: string) => {
    setVerifying(blogId);
    try {
      const { error } = await supabase
        .from('blogs')
        .update({ 
          verified: true, 
          verified_at: new Date().toISOString() 
        })
        .eq('id', blogId);

      if (error) throw error;

      toast({
        title: "Blog Verified!",
        description: "The blog has been successfully verified.",
      });

      fetchBlogsForVerification();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setVerifying(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="outline"
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Admin Verification</h1>
              <p className="text-muted-foreground">Review and verify blog posts</p>
            </div>
          </div>

          {blogs.length === 0 ? (
            <Card className="bg-gradient-card border border-border/50">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle className="w-16 h-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Blogs Pending Verification</h3>
                <p className="text-muted-foreground text-center">
                  All verification requests have been processed.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {blogs.map((blog, index) => (
                <motion.div
                  key={blog.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
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
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                              <Clock className="w-3 h-3 mr-1" />
                              Pending Verification
                            </Badge>
                          </div>
                          <CardTitle className="text-2xl mb-2">{blog.title}</CardTitle>
                          <CardDescription className="flex items-center gap-4 text-sm">
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {blog.profiles?.display_name || blog.profiles?.username || 'Anonymous'}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(blog.created_at)}
                            </span>
                          </CardDescription>
                        </div>
                        <Button
                          onClick={() => handleVerifyBlog(blog.id)}
                          disabled={verifying === blog.id}
                          className="bg-gradient-primary hover:shadow-elegant transition-all duration-300"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          {verifying === blog.id ? "Verifying..." : "Verify Blog"}
                        </Button>
                      </div>
                    </CardHeader>

                    <CardContent className="relative z-10">
                      <div className="space-y-4">
                        {blog.excerpt && (
                          <div>
                            <h4 className="font-semibold mb-2">Excerpt:</h4>
                            <p className="text-muted-foreground">{blog.excerpt}</p>
                          </div>
                        )}
                        
                        <div>
                          <h4 className="font-semibold mb-2">Content Preview:</h4>
                          <div className="bg-muted/50 rounded-lg p-4 max-h-40 overflow-y-auto">
                            <p className="text-sm whitespace-pre-wrap">
                              {blog.content.substring(0, 500)}
                              {blog.content.length > 500 && "..."}
                            </p>
                          </div>
                        </div>

                        {blog.tags && blog.tags.length > 0 && (
                          <div>
                            <h4 className="font-semibold mb-2">Tags:</h4>
                            <div className="flex flex-wrap gap-2">
                              {blog.tags.map((tag: string, tagIndex: number) => (
                                <Badge key={tagIndex} variant="outline">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
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