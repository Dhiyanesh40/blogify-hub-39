-- Add verification and image fields to blogs table
ALTER TABLE public.blogs 
ADD COLUMN verification_requested boolean DEFAULT false,
ADD COLUMN verified boolean DEFAULT false,
ADD COLUMN verified_at timestamp with time zone,
ADD COLUMN background_image_url text;

-- Create storage bucket for blog images
INSERT INTO storage.buckets (id, name, public) VALUES ('blog-images', 'blog-images', true);

-- Create storage policies for blog images
CREATE POLICY "Blog images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'blog-images');

CREATE POLICY "Users can upload blog images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'blog-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their blog images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'blog-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete their blog images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'blog-images' AND auth.uid() IS NOT NULL);

-- Add admin role to profiles table
ALTER TABLE public.profiles 
ADD COLUMN role text DEFAULT 'user';

-- Create function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid uuid)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE user_id = user_uuid;
$$;

-- Create policy for admin to view all blogs for verification
CREATE POLICY "Admins can view all blogs for verification" 
ON public.blogs 
FOR SELECT 
USING (public.get_user_role(auth.uid()) = 'admin');

-- Create policy for admin to update blog verification
CREATE POLICY "Admins can verify blogs" 
ON public.blogs 
FOR UPDATE 
USING (public.get_user_role(auth.uid()) = 'admin');