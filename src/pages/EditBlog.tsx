import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Save, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface Blog {
  id: string;
  title: string;
  content: string;
  excerpt: string | null;
  published: boolean;
  author_id: string;
}

export const EditBlog = () => {
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    published: false
  });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    } else if (user && id) {
      fetchBlog();
    }
  }, [user, authLoading, id, navigate]);

  const fetchBlog = async () => {
    try {
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      if (data.author_id !== user?.id) {
        toast({
          title: "Access denied",
          description: "You can only edit your own blog posts.",
          variant: "destructive",
        });
        navigate("/dashboard");
        return;
      }

      setBlog(data);
      setFormData({
        title: data.title,
        content: data.content,
        excerpt: data.excerpt || "",
        published: data.published
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent, shouldPublish = false) => {
    e.preventDefault();
    if (!user || !blog) return;

    setLoading(true);
    setError("");

    try {
      const { error: updateError } = await supabase
        .from('blogs')
        .update({
          title: formData.title,
          content: formData.content,
          excerpt: formData.excerpt || formData.content.substring(0, 200),
          published: shouldPublish !== undefined ? shouldPublish : formData.published
        })
        .eq('id', blog.id);

      if (updateError) throw updateError;

      toast({
        title: "Blog updated!",
        description: "Your blog post has been updated successfully.",
      });

      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-hero">
        <div className="animate-pulse text-xl">Loading...</div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-gradient-hero">
        <div className="container mx-auto px-4 py-8">
          <Alert variant="destructive" className="max-w-2xl mx-auto">
            <AlertDescription>Blog post not found or access denied</AlertDescription>
          </Alert>
        </div>
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
          className="max-w-4xl mx-auto"
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
              <h1 className="text-3xl font-bold">Edit Post</h1>
              <p className="text-muted-foreground">Update your blog post</p>
            </div>
          </div>

          <Card className="bg-gradient-card shadow-elegant border border-border/50">
            <CardHeader>
              <CardTitle>Edit Your Blog Post</CardTitle>
              <CardDescription>
                Make changes to your blog post below
              </CardDescription>
            </CardHeader>

            <form onSubmit={(e) => handleSubmit(e, false)}>
              <CardContent className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-medium">
                    Title *
                  </Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="Enter your blog title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="h-12"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="excerpt" className="text-sm font-medium">
                    Excerpt (Optional)
                  </Label>
                  <Textarea
                    id="excerpt"
                    name="excerpt"
                    placeholder="Write a brief description of your blog post"
                    value={formData.excerpt}
                    onChange={handleInputChange}
                    className="min-h-[80px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content" className="text-sm font-medium">
                    Content *
                  </Label>
                  <Textarea
                    id="content"
                    name="content"
                    placeholder="Write your blog content here..."
                    value={formData.content}
                    onChange={handleInputChange}
                    className="min-h-[300px]"
                    required
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="published"
                    checked={formData.published}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, published: checked as boolean }))
                    }
                  />
                  <Label htmlFor="published" className="text-sm">
                    Published
                  </Label>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    variant="outline"
                    disabled={loading}
                    className="flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {loading ? "Saving..." : "Save Changes"}
                  </Button>
                  
                  <Button
                    type="button"
                    onClick={(e) => handleSubmit(e, true)}
                    disabled={loading}
                    className="bg-gradient-primary hover:shadow-elegant transition-all duration-300 flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    {loading ? "Publishing..." : "Save & Publish"}
                  </Button>
                </div>
              </CardContent>
            </form>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};