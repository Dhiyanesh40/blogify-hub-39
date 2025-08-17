import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, User, Edit3, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface Blog {
  id: string;
  title: string;
  content: string;
  excerpt: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
  author_id: string;
  profiles: {
    username: string;
    display_name: string;
  };
}

export const BlogDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      fetchBlog();
    }
  }, [id]);

  const fetchBlog = async () => {
    try {
      const { data, error } = await supabase
        .from('blogs')
        .select(`
          *,
          profiles (
            username,
            display_name
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setBlog(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteBlog = async () => {
    if (!blog || !user || blog.author_id !== user.id) return;

    try {
      const { error } = await supabase
        .from('blogs')
        .delete()
        .eq('id', blog.id);

      if (error) throw error;
      
      toast({
        title: "Blog deleted",
        description: "Your blog post has been deleted successfully.",
      });
      navigate("/dashboard");
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="animate-pulse text-xl">Loading...</div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-gradient-hero">
        <div className="container mx-auto px-4 py-8">
          <Alert variant="destructive" className="max-w-2xl mx-auto">
            <AlertDescription>
              {error || "Blog post not found"}
            </AlertDescription>
          </Alert>
          <div className="text-center mt-6">
            <Button onClick={() => navigate("/")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const isAuthor = user && blog.author_id === user.id;

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <div className="flex items-center justify-between mb-8">
            <Button
              variant="outline"
              onClick={() => navigate("/")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
            
            {isAuthor && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => navigate(`/edit/${blog.id}`)}
                  className="flex items-center gap-2"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  onClick={deleteBlog}
                  className="flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </Button>
              </div>
            )}
          </div>

          <Card className="bg-gradient-card shadow-elegant border border-border/50">
            <CardContent className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <Badge variant={blog.published ? "default" : "secondary"}>
                  {blog.published ? "Published" : "Draft"}
                </Badge>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4 mr-1" />
                  {new Date(blog.created_at).toLocaleDateString()}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <User className="w-4 h-4 mr-1" />
                  {blog.profiles.display_name || blog.profiles.username}
                </div>
              </div>

              <h1 className="text-4xl font-bold mb-6">{blog.title}</h1>
              
              {blog.excerpt && (
                <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                  {blog.excerpt}
                </p>
              )}

              <div className="prose prose-lg max-w-none">
                {blog.content.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-4 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>

              <div className="mt-8 pt-8 border-t border-border">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div>
                    Written by {blog.profiles.display_name || blog.profiles.username}
                  </div>
                  <div>
                    {blog.updated_at !== blog.created_at && (
                      <>Updated {new Date(blog.updated_at).toLocaleDateString()}</>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};