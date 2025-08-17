import { motion } from "framer-motion";
import { BlogCard } from "@/components/ui/blog-card";
import { Button } from "@/components/ui/button";
import { ArrowRight, PenTool, Users, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

// Mock data for demonstration
const featuredBlogs = [
  {
    id: "1",
    title: "Getting Started with React and TypeScript",
    content: "Learn how to build modern web applications using React with TypeScript. We'll cover component creation, type safety, and best practices for scalable development.",
    author: "Alex Chen",
    createdAt: "2024-01-15",
    readTime: 8,
    tags: ["React", "TypeScript", "Web Development"]
  },
  {
    id: "2", 
    title: "The Future of Web Development",
    content: "Exploring the latest trends and technologies shaping the future of web development. From AI integration to progressive web apps, discover what's coming next.",
    author: "Sarah Johnson",
    createdAt: "2024-01-12",
    readTime: 6,
    tags: ["Future Tech", "AI", "PWA"]
  },
  {
    id: "3",
    title: "Mastering CSS Grid and Flexbox",
    content: "A comprehensive guide to modern CSS layout techniques. Learn when to use CSS Grid vs Flexbox and how to create responsive, beautiful layouts.",
    author: "David Park",
    createdAt: "2024-01-10",
    readTime: 10,
    tags: ["CSS", "Layout", "Design"]
  }
];

const stats = [
  { icon: BookOpen, label: "Blog Posts", value: "1,200+" },
  { icon: Users, label: "Writers", value: "500+" },
  { icon: PenTool, label: "Articles Published", value: "50+" }
];

export const Home = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-5"></div>
        <div className="container mx-auto px-4 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Share Your{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Stories
              </span>
              <br />
              With the World
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed max-w-2xl mx-auto">
              Join thousands of writers sharing their thoughts, experiences, and expertise on Blogify - the modern blogging platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/register">
                <Button 
                  size="lg" 
                  className="bg-gradient-primary hover:shadow-elegant transition-all duration-300 text-lg px-8 py-6 h-auto"
                >
                  Start Writing Today
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/blogs">
                <Button 
                  variant="outline" 
                  size="lg"
                  className="text-lg px-8 py-6 h-auto border-2 hover:bg-muted/50"
                >
                  Explore Blogs
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-glow">
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-3xl font-bold mb-2">{stat.value}</h3>
                <p className="text-muted-foreground font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Blogs Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Featured <span className="text-primary">Stories</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover the latest and most engaging blog posts from our community of writers.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {featuredBlogs.map((blog, index) => (
              <BlogCard
                key={blog.id}
                {...blog}
                index={index}
              />
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Link to="/blogs">
              <Button 
                variant="outline" 
                size="lg"
                className="border-2 hover:bg-primary hover:text-primary-foreground transition-all duration-300"
              >
                View All Blogs
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-background/95"></div>
        <div className="container mx-auto px-4 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Ready to Share Your Story?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Join our community of passionate writers and start building your audience today.
            </p>
            <Link to="/register">
              <Button 
                size="lg"
                className="bg-gradient-primary hover:shadow-elegant transition-all duration-300 text-lg px-8 py-6 h-auto"
              >
                <PenTool className="w-5 h-5 mr-2" />
                Start Your Blog
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};