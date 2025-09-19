import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Save, Eye, Upload, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export const CreateBlog = () => {
  const { user, loading: authLoading } = useAuth();
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    published: false,
    verification_requested: false
  });
  const [backgroundImage, setBackgroundImage] = useState<File | null>(null);
  const [backgroundImageUrl, setBackgroundImageUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleImageUpload = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user?.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('blog-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('blog-images')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent, shouldPublish = false) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError("");

    try {
      let imageUrl = backgroundImageUrl;
      
      if (backgroundImage) {
        imageUrl = await handleImageUpload(backgroundImage);
        if (!imageUrl) {
          throw new Error('Failed to upload background image');
        }
      }

      const { data, error: insertError } = await supabase
        .from('blogs')
        .insert({
          title: formData.title,
          content: formData.content,
          excerpt: formData.excerpt || formData.content.substring(0, 200),
          author_id: user.id,
          published: shouldPublish || formData.published,
          verification_requested: formData.verification_requested,
          background_image_url: imageUrl
        })
        .select()
        .single();

      if (insertError) throw insertError;

      const statusMessage = formData.verification_requested 
        ? "Blog published and sent for verification!" 
        : shouldPublish ? "Blog published!" : "Draft saved!";

      toast({
        title: statusMessage,
        description: formData.verification_requested
          ? "Your blog post has been published and submitted for admin verification."
          : shouldPublish 
            ? "Your blog post has been published successfully."
            : "Your blog post has been saved as a draft.",
      });

      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
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
              <h1 className="text-3xl font-bold">Create New Post</h1>
              <p className="text-muted-foreground">Share your thoughts with the world</p>
            </div>
          </div>

          <Card className="bg-gradient-card shadow-elegant border border-border/50">
            <CardHeader>
              <CardTitle>Write Your Blog Post</CardTitle>
              <CardDescription>
                Fill in the details below to create your blog post
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
                  <Label className="text-sm font-medium">
                    Background Image (Optional)
                  </Label>
                  <div className="flex items-center gap-4">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setBackgroundImage(file);
                          setBackgroundImageUrl(URL.createObjectURL(file));
                        }
                      }}
                      className="hidden"
                      id="background-image"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('background-image')?.click()}
                      className="flex items-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      Upload Image
                    </Button>
                    {backgroundImageUrl && (
                      <div className="flex items-center gap-2">
                        <img
                          src={backgroundImageUrl}
                          alt="Background preview"
                          className="w-16 h-16 object-cover rounded"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setBackgroundImage(null);
                            setBackgroundImageUrl("");
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
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

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="published"
                      checked={formData.published}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({ ...prev, published: checked as boolean }))
                      }
                    />
                    <Label htmlFor="published" className="text-sm">
                      Publish immediately
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="verification"
                      checked={formData.verification_requested}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({ ...prev, verification_requested: checked as boolean }))
                      }
                    />
                    <Label htmlFor="verification" className="text-sm">
                      Apply for Verification ✅
                    </Label>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    variant="outline"
                    disabled={loading}
                    className="flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {loading ? "Saving..." : "Save as Draft"}
                  </Button>
                  
                  <Button
                    type="button"
                    onClick={(e) => handleSubmit(e, true)}
                    disabled={loading}
                    className="bg-gradient-primary hover:shadow-elegant transition-all duration-300 flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    {loading ? "Publishing..." : "Publish Post"}
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