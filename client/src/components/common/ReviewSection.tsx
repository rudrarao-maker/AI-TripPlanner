import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, ThumbsUp, Camera, SortAsc, SortDesc } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface Review {
  id: string;
  author: string;
  avatar?: string;
  rating: number;
  date: string;
  content: string;
  photos?: string[];
  helpful: number;
  isHelpful?: boolean;
}

const MOCK_REVIEWS: Review[] = [
  {
    id: 'r1',
    author: 'Priya Sharma',
    rating: 5,
    date: '2 weeks ago',
    content: 'Absolutely magical experience! The AI-planned itinerary was spot on — every restaurant recommendation was a hidden gem. Saved us hours of planning.',
    photos: ['https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=200', 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=200'],
    helpful: 24,
  },
  {
    id: 'r2',
    author: 'Rahul Mehta',
    rating: 4,
    date: '1 month ago',
    content: 'Great tool for quick planning. The budget optimization feature helped us save nearly 20% on our Goa trip. Would love to see more international destinations.',
    helpful: 18,
  },
  {
    id: 'r3',
    author: 'Ananya Reddy',
    rating: 5,
    date: '3 weeks ago',
    content: 'Used TripCraft for our honeymoon in Kerala. The day-by-day timeline was incredibly detailed and the hotel suggestions were dreamy. Highly recommended!',
    photos: ['https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=200'],
    helpful: 31,
  },
  {
    id: 'r4',
    author: 'Vikram Singh',
    rating: 5,
    date: '1 week ago',
    content: 'The collaborative trip planning feature is a game changer. Our group of 6 could vote on activities and the AI adjusted the itinerary in real-time.',
    helpful: 15,
  },
];

export function ReviewSection() {
  const [reviews, setReviews] = useState(MOCK_REVIEWS);
  const [sortBy, setSortBy] = useState<'newest' | 'highest'>('newest');
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [showForm, setShowForm] = useState(false);

  const averageRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;

  const sortedReviews = [...reviews].sort((a, b) => {
    if (sortBy === 'highest') return b.rating - a.rating;
    return 0; // newest first (default order)
  });

  const handleSubmitReview = () => {
    if (!reviewText.trim() || userRating === 0) return;
    const newReview: Review = {
      id: `r${Date.now()}`,
      author: 'You',
      rating: userRating,
      date: 'Just now',
      content: reviewText,
      helpful: 0,
    };
    setReviews([newReview, ...reviews]);
    setReviewText('');
    setUserRating(0);
    setShowForm(false);
  };

  const toggleHelpful = (id: string) => {
    setReviews(reviews.map(r => 
      r.id === id ? { ...r, helpful: r.isHelpful ? r.helpful - 1 : r.helpful + 1, isHelpful: !r.isHelpful } : r
    ));
  };

  return (
    <section className="py-20 bg-card/50">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-14"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Traveler Reviews</h2>
          <p className="text-muted-foreground text-lg">Hear what fellow travelers are saying</p>
        </motion.div>

        {/* Summary */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10 max-w-4xl mx-auto">
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-5xl font-bold text-foreground">{averageRating.toFixed(1)}</div>
              <div className="flex gap-0.5 mt-1 justify-center">
                {[1, 2, 3, 4, 5].map(s => (
                  <Star key={s} className={`h-5 w-5 ${s <= Math.round(averageRating) ? 'fill-amber-400 text-amber-400' : 'text-border'}`} />
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-1">{reviews.length} reviews</p>
            </div>

            {/* Rating Bars */}
            <div className="space-y-1.5">
              {[5, 4, 3, 2, 1].map(star => {
                const count = reviews.filter(r => r.rating === star).length;
                const pct = (count / reviews.length) * 100;
                return (
                  <div key={star} className="flex items-center gap-2">
                    <span className="text-xs font-medium w-3">{star}</span>
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    <div className="w-32 h-2 bg-border rounded-full overflow-hidden">
                      <div className="h-full bg-amber-400 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs text-muted-foreground w-6">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant={sortBy === 'newest' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy('newest')}
              className="rounded-full"
            >
              <SortDesc className="h-4 w-4 mr-1" /> Newest
            </Button>
            <Button
              variant={sortBy === 'highest' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy('highest')}
              className="rounded-full"
            >
              <SortAsc className="h-4 w-4 mr-1" /> Highest
            </Button>
            <Button variant="gradient" size="sm" className="rounded-full" onClick={() => setShowForm(!showForm)}>
              Write Review
            </Button>
          </div>
        </div>

        {/* Write Review Form */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="max-w-2xl mx-auto mb-10"
          >
            <Card className="border-primary/20">
              <CardContent className="p-6 space-y-4">
                <div>
                  <p className="text-sm font-medium mb-2">Your Rating</p>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(s => (
                      <button
                        key={s}
                        onMouseEnter={() => setHoverRating(s)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setUserRating(s)}
                        className="transition-transform hover:scale-110"
                      >
                        <Star className={`h-8 w-8 transition-colors ${s <= (hoverRating || userRating) ? 'fill-amber-400 text-amber-400' : 'text-border'}`} />
                      </button>
                    ))}
                  </div>
                </div>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Share your experience..."
                  className="w-full h-24 bg-muted/50 border border-border rounded-xl p-4 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <div className="flex items-center justify-between">
                  <Button variant="outline" size="sm" className="rounded-full gap-2">
                    <Camera className="h-4 w-4" /> Add Photos
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setShowForm(false)} className="rounded-full">Cancel</Button>
                    <Button variant="gradient" size="sm" onClick={handleSubmitReview} className="rounded-full">Submit Review</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Reviews List */}
        <div className="max-w-4xl mx-auto space-y-6">
          {sortedReviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="border-border/50 hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="h-11 w-11 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {review.author[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-bold text-sm">{review.author}</h4>
                        <span className="text-xs text-muted-foreground">{review.date}</span>
                      </div>
                      <div className="flex gap-0.5 mb-3">
                        {[1, 2, 3, 4, 5].map(s => (
                          <Star key={s} className={`h-4 w-4 ${s <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-border'}`} />
                        ))}
                      </div>
                      <p className="text-sm text-foreground/80 leading-relaxed">{review.content}</p>

                      {/* Review Photos */}
                      {review.photos && review.photos.length > 0 && (
                        <div className="flex gap-2 mt-3">
                          {review.photos.map((photo, i) => (
                            <img key={i} src={photo} alt="" className="h-16 w-16 rounded-lg object-cover border border-border/50" />
                          ))}
                        </div>
                      )}

                      <button
                        onClick={() => toggleHelpful(review.id)}
                        className={`mt-4 flex items-center gap-1.5 text-xs font-medium transition-colors ${
                          review.isHelpful ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <ThumbsUp className={`h-3.5 w-3.5 ${review.isHelpful ? 'fill-primary' : ''}`} />
                        Helpful ({review.helpful})
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
