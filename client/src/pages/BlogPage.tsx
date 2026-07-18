import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function BlogPage() {
  const posts = [
    { title: '10 Hidden Gems in Bali', date: 'Jul 15, 2026', excerpt: 'Discover the untouched beaches and serene temples away from the tourist crowds.' },
    { title: 'Mastering the Art of Lightweight Packing', date: 'Jul 10, 2026', excerpt: 'How to fit a two-week European vacation into a single carry-on.' },
    { title: 'The Ultimate Guide to Tokyo Street Food', date: 'Jul 5, 2026', excerpt: 'From Takoyaki to Yakitori, navigate the vibrant food alleys of Japan.' },
  ];

  return (
    <div className="container mx-auto px-4 py-24 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto space-y-8"
      >
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Travel Blog</h1>
          <p className="text-xl text-muted-foreground">Insights, tips, and inspiration for your next adventure.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post, idx) => (
            <Card key={idx} className="glass hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer">
              <div className="h-48 bg-muted rounded-t-lg"></div>
              <CardHeader>
                <div className="text-sm text-primary mb-2">{post.date}</div>
                <CardTitle className="line-clamp-2">{post.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm line-clamp-3">{post.excerpt}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
