import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, Clock, User } from "lucide-react";
import { motion } from "framer-motion";

interface BlogCardProps {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  readTime?: number;
  tags?: string[];
  index?: number;
}

export const BlogCard = ({ 
  id, 
  title, 
  content, 
  author, 
  createdAt, 
  readTime = 5,
  tags = [],
  index = 0 
}: BlogCardProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getExcerpt = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength).trim() + '...';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      className="group"
    >
      <Link to={`/blog/${id}`}>
        <Card className="h-full bg-gradient-card hover:shadow-card transition-all duration-300 border border-border/50 hover:border-primary/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-gradient-primary text-white text-xs font-medium">
                    {author.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                  <User className="w-3 h-3" />
                  <span className="font-medium">{author}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <Calendar className="w-3 h-3" />
                <span>{formatDate(createdAt)}</span>
              </div>
            </div>
            
            <h3 className="font-bold text-xl leading-tight group-hover:text-primary transition-colors duration-200 line-clamp-2">
              {title}
            </h3>
          </CardHeader>
          
          <CardContent className="pt-0">
            <p className="text-muted-foreground leading-relaxed mb-4 line-clamp-3">
              {getExcerpt(content)}
            </p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>{readTime} min read</span>
              </div>
              
              {tags.length > 0 && (
                <div className="flex space-x-1">
                  {tags.slice(0, 2).map((tag, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary" 
                      className="text-xs bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                    >
                      {tag}
                    </Badge>
                  ))}
                  {tags.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{tags.length - 2}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
};