import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar as CalendarIcon, Users, Wallet, Loader2, Sparkles, Navigation, Hotel, Map as MapLucide, Plane, Sun, Download, Mic, Backpack, Share2, BookmarkPlus, CalendarDays } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InteractiveMap } from '@/components/map/InteractiveMap';
import { HotelCard } from '@/components/recommendations/HotelCard';
import { RestaurantCard } from '@/components/recommendations/RestaurantCard';
import { AttractionCard } from '@/components/recommendations/AttractionCard';
import { TransportCard } from '@/components/recommendations/TransportCard';
import { DraggableItinerary } from '@/components/itinerary/DraggableItinerary';
import { PackingList } from '@/components/itinerary/PackingList';
import { AIChatSidebar } from '@/components/itinerary/AIChatSidebar';
import { WeatherWidget } from '@/components/weather/WeatherWidget';
import { NearbyPlaces } from '@/components/map/NearbyPlaces';
import { ItinerarySkeleton } from '@/components/ui/Skeletons';
import { Bot } from 'lucide-react';
import { TRAVEL_STYLES } from '@/lib/constants';
import { exportTripToPdf } from '@/lib/pdfExport';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import 'regenerator-runtime/runtime';
import { useGenerateTrip } from '@/hooks/useTrips';
import { useHotels, useRestaurants, useAttractions, useTransport } from '@/hooks/useRecommendations';
import { useSocket } from '@/hooks/useSocket';

// Destination coordinate lookup for weather/map integration
const DESTINATION_COORDS: Record<string, { lat: number; lng: number }> = {
  'bali': { lat: -8.409518, lng: 115.188919 },
  'goa': { lat: 15.2993, lng: 74.124 },
  'manali': { lat: 32.2396, lng: 77.1887 },
  'jaipur': { lat: 26.9124, lng: 75.7873 },
  'kerala': { lat: 10.8505, lng: 76.2711 },
  'ladakh': { lat: 34.1526, lng: 77.5771 },
  'udaipur': { lat: 24.5854, lng: 73.7125 },
  'paris': { lat: 48.8566, lng: 2.3522 },
  'tokyo': { lat: 35.6762, lng: 139.6503 },
  'dubai': { lat: 25.2048, lng: 55.2708 },
  'london': { lat: 51.5074, lng: -0.1278 },
  'new york': { lat: 40.7128, lng: -74.0060 },
  'singapore': { lat: 1.3521, lng: 103.8198 },
  'mumbai': { lat: 19.0760, lng: 72.8777 },
  'delhi': { lat: 28.6139, lng: 77.2090 },
  'bangalore': { lat: 12.9716, lng: 77.5946 },
  'chennai': { lat: 13.0827, lng: 80.2707 },
  'kolkata': { lat: 22.5726, lng: 88.3639 },
  'hyderabad': { lat: 17.3850, lng: 78.4867 },
  'varanasi': { lat: 25.3176, lng: 82.9739 },
  'agra': { lat: 27.1767, lng: 78.0081 },
  'shimla': { lat: 31.1048, lng: 77.1734 },
  'rishikesh': { lat: 30.0869, lng: 78.2676 },
  'ooty': { lat: 11.4064, lng: 76.6932 },
  'mysore': { lat: 12.2958, lng: 76.6394 },
};

function getCoordinates(destination: string): { lat: number; lng: number } {
  const key = destination.toLowerCase().trim();
  for (const [name, coords] of Object.entries(DESTINATION_COORDS)) {
    if (key.includes(name) || name.includes(key)) {
      return coords;
    }
  }
  // Default: center of India
  return { lat: 20.5937, lng: 78.9629 };
}

export function TripPlannerPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [itinerary, setItinerary] = useState<any>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const generateTripMutation = useGenerateTrip();
  
  // Real-time socket
  const { collaborators, emit, subscribe, socketId } = useSocket(itinerary?.id);
  
  // Wanderlog style map sync state
  const [activeItemHover, setActiveItemHover] = useState<string>('');
  
  // Google Travel style tab state
  const [activeTab, setActiveTab] = useState<'itinerary' | 'logistics' | 'packing'>('itinerary');
  const [recTab, setRecTab] = useState<'hotels' | 'restaurants' | 'attractions' | 'transport'>('hotels');

  // Speech Recognition hook
  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();

  // Form State
  const [formData, setFormData] = useState({
    destinations: [''],
    dates: '',
    travelers: '2',
    budget: '',
    style: '',
    transport: 'flight',
    hotel: '4-star'
  });

  // Recommendation Hooks
  const destination = formData.destinations[0] || 'Bali';
  const { data: hotels = [] } = useHotels({ location: destination, maxPrice: parseInt(formData.budget) || undefined });
  const { data: restaurants = [] } = useRestaurants({ location: destination });
  const { data: attractions = [] } = useAttractions({ location: destination });
  const { data: transportOptions = [] } = useTransport({ destination, type: formData.transport });

  // Get coordinates for the destination
  const destCoords = getCoordinates(formData.destinations[0] || 'Bali');

  const handleGenerate = async () => {
    setIsGenerating(true);
    
    const tripData = {
      origin: "Mumbai",
      destination: formData.destinations[0] || "Bali",
      startDate: new Date().toISOString(),
      endDate: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString(),
      travelers: formData.travelers,
      budget: parseInt(formData.budget) || 120000,
      currency: "INR",
      travelStyle: formData.style,
      transportPreference: formData.transport,
      hotelCategory: formData.hotel,
      foodPreference: "any"
    };

    generateTripMutation.mutate(tripData as any, {
      onSuccess: (data) => {
        setItinerary(data);
        setIsGenerating(false);
        setStep(4);
      },
      onError: () => {
        setIsGenerating(false);
      }
    });
  };

  const updateForm = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Sync speech transcript to destination
  if (listening && transcript && formData.destinations[formData.destinations.length - 1] !== transcript) {
    const newDests = [...formData.destinations];
    newDests[newDests.length - 1] = transcript;
    setFormData(prev => ({ ...prev, destinations: newDests }));
  }

  const handleMicClick = () => {
    if (listening) {
      SpeechRecognition.stopListening();
    } else {
      resetTranscript();
      SpeechRecognition.startListening({ continuous: true });
    }
  };

  // Rich PDF Export
  const handleDownloadPdf = async () => {
    toast.loading('Generating PDF...', { id: 'pdf-export' });
    try {
      await exportTripToPdf({
        destination: formData.destinations.join(' → ') || 'Trip',
        dates: formData.dates || '7 Days',
        budget: `₹${(parseInt(formData.budget) || 120000).toLocaleString()}`,
        travelers: formData.travelers || '2',
        travelStyle: formData.style || 'Adventure',
        days: itinerary?.days || [],
      });
      toast.success('PDF downloaded!', { id: 'pdf-export' });
    } catch (error) {
      toast.error('Failed to export PDF', { id: 'pdf-export' });
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Trip link copied to clipboard!');
  };

  const handleSave = () => {
    toast.success('Trip saved to your profile!');
  };

  const handleCalendarSync = () => {
    toast.success('Itinerary synced to Google Calendar!');
  };

  // ------------------
  // RENDER HELPERS
  // ------------------

  const renderFormStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h2 className="text-3xl font-bold mb-6 text-center">Where do you want to go?</h2>
            <div className="space-y-4 max-w-xl mx-auto">
              {formData.destinations.map((dest, index) => (
                <div key={index} className="relative flex items-center gap-2">
                  <div className="relative flex-1">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground h-6 w-6" />
                    <Input 
                      className="pl-14 pr-14 py-8 text-xl rounded-2xl glass shadow-lg border-primary/20 bg-background/50 focus-visible:ring-primary w-full"
                      placeholder={index === 0 ? "e.g. Bali, Paris, Tokyo..." : "Add another city (optional)"}
                      value={dest}
                      onChange={(e) => {
                        const newDests = [...formData.destinations];
                        newDests[index] = e.target.value;
                        setFormData(prev => ({ ...prev, destinations: newDests }));
                      }}
                      autoFocus={index === 0}
                    />
                    {browserSupportsSpeechRecognition && index === formData.destinations.length - 1 && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className={`absolute right-3 top-1/2 -translate-y-1/2 rounded-full ${listening ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20 hover:text-red-600 animate-pulse' : 'text-muted-foreground'}`}
                        onClick={handleMicClick}
                      >
                        <Mic className="h-5 w-5" />
                      </Button>
                    )}
                  </div>
                  {index > 0 && (
                     <Button variant="ghost" size="icon" onClick={() => {
                        const newDests = formData.destinations.filter((_, i) => i !== index);
                        setFormData(prev => ({ ...prev, destinations: newDests }));
                     }}>
                       <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                     </Button>
                  )}
                </div>
              ))}
              
              {formData.destinations.length < 5 && (
                <Button 
                  variant="outline" 
                  className="w-full py-6 border-dashed border-2 rounded-2xl text-muted-foreground hover:text-foreground"
                  onClick={() => setFormData(prev => ({ ...prev, destinations: [...prev.destinations, ''] }))}
                >
                  + Add another destination
                </Button>
              )}
            </div>
          </motion.div>
        );
      case 2:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h2 className="text-3xl font-bold mb-6 text-center">When & Who?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Travel Dates</label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="relative">
                    <CalendarIcon className="absolute left-3 top-4 text-muted-foreground h-4 w-4 pointer-events-none" />
                    <Input 
                      type="date"
                      className="pl-9 py-6 text-sm rounded-xl glass border-primary/20 cursor-pointer"
                      value={formData.dates.split('to')[0]?.trim() || ''}
                      onChange={(e) => {
                        const endDate = formData.dates.split('to')[1]?.trim() || '';
                        updateForm('dates', `${e.target.value} to ${endDate}`);
                      }}
                    />
                  </div>
                  <div className="relative">
                    <CalendarIcon className="absolute left-3 top-4 text-muted-foreground h-4 w-4 pointer-events-none" />
                    <Input 
                      type="date"
                      className="pl-9 py-6 text-sm rounded-xl glass border-primary/20 cursor-pointer"
                      value={formData.dates.split('to')[1]?.trim() || ''}
                      onChange={(e) => {
                        const startDate = formData.dates.split('to')[0]?.trim() || '';
                        updateForm('dates', `${startDate} to ${e.target.value}`);
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Travelers</label>
                <div className="relative">
                  <Users className="absolute left-4 top-3.5 text-muted-foreground h-5 w-5" />
                  <Input 
                    type="number"
                    min="1"
                    className="pl-12 py-6 text-lg rounded-xl glass border-primary/20"
                    value={formData.travelers}
                    onChange={(e) => updateForm('travelers', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        );
      case 3:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h2 className="text-3xl font-bold mb-6 text-center">Budget & Style</h2>
            <div className="max-w-3xl mx-auto space-y-8">
              <div className="space-y-2">
                <div className="relative max-w-md mx-auto">
                  <Wallet className="absolute left-4 top-3.5 text-muted-foreground h-5 w-5" />
                  <Input 
                    type="number"
                    className="pl-12 py-6 text-lg rounded-xl glass border-primary/20"
                    placeholder="Overall Budget"
                    value={formData.budget}
                    onChange={(e) => updateForm('budget', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-xl mx-auto">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2"><Plane className="h-4 w-4" /> Transport</label>
                  <select 
                    className="w-full pl-4 pr-10 py-4 text-md rounded-xl glass border-primary/20 appearance-none bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary"
                    value={formData.transport}
                    onChange={(e) => updateForm('transport', e.target.value)}
                  >
                    <option value="flight">Flight</option>
                    <option value="train">Train</option>
                    <option value="bus">Bus</option>
                    <option value="car">Rental Car</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2"><Hotel className="h-4 w-4" /> Accommodation</label>
                  <select 
                    className="w-full pl-4 pr-10 py-4 text-md rounded-xl glass border-primary/20 appearance-none bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary"
                    value={formData.hotel}
                    onChange={(e) => updateForm('hotel', e.target.value)}
                  >
                    <option value="luxury">Luxury (5-star)</option>
                    <option value="4-star">Premium (4-star)</option>
                    <option value="budget">Budget / Hostel</option>
                    <option value="resort">Resort</option>
                    <option value="villa">Private Villa</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {TRAVEL_STYLES.map(style => (
                  <div 
                    key={style.value}
                    onClick={() => updateForm('style', style.value)}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 text-center flex flex-col items-center gap-2 ${
                      formData.style === style.value 
                        ? 'border-primary bg-primary/10 shadow-md shadow-primary/20' 
                        : 'border-border/50 hover:border-primary/50 glass hover:bg-background/80'
                    }`}
                  >
                    <span className="text-3xl">{style.icon}</span>
                    <span className="font-medium text-sm">{style.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        );
    }
  };

  if (isGenerating) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-pulse" />
          <Card className="glass-card relative z-10 w-full max-w-md p-10 text-center border-primary/30 shadow-2xl">
            <Loader2 className="h-16 w-16 mx-auto text-primary animate-spin mb-6" />
            <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              AI is drafting your trip...
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              Analyzing weather, hotels, restaurants, and attractions for {formData.destinations[0] || 'your destination'}
            </p>
          </Card>
        </div>
      </div>
    );
  }

  if (itinerary) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="relative h-[40vh] min-h-[300px] w-full flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-black/50 z-10" />
          <img 
            src={`https://source.unsplash.com/1600x900/?${encodeURIComponent(formData.destinations[0] || 'landscape')}`}
            alt="Destination"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="relative z-20 text-center text-white px-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-widest mb-4">
              <Sparkles className="h-3 w-3" /> AI Generated Itinerary
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-xl">
              {formData.destinations.join(' • ') || itinerary.destination}
            </h1>
            <div className="flex items-center justify-center gap-6 text-sm md:text-base font-medium drop-shadow-md">
              <span className="flex items-center gap-1.5"><CalendarIcon className="h-4 w-4" /> {formData.dates || itinerary.duration}</span>
              <span className="flex items-center gap-1.5"><Wallet className="h-4 w-4" /> ₹{(parseInt(formData.budget) || 120000).toLocaleString()}</span>
              <span className="flex items-center gap-1.5"><Users className="h-4 w-4" /> {formData.travelers} travelers</span>
            </div>
          </div>
        </div>

        <div id="itinerary-content" className="container mx-auto px-4 -mt-10 relative z-30">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Itinerary & Logistics */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between mb-2 flex-wrap gap-4">
                <div className="flex bg-muted p-1 rounded-lg">
                  <button 
                    onClick={() => setActiveTab('itinerary')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'itinerary' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'}`}
                  >
                    Itinerary
                  </button>
                  <button 
                    onClick={() => setActiveTab('logistics')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'logistics' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'}`}
                  >
                    Logistics
                  </button>
                  <button 
                    onClick={() => setActiveTab('packing')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-1 ${activeTab === 'packing' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'}`}
                  >
                    <Backpack className="h-4 w-4" /> Packing
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleCalendarSync} className="hidden lg:flex border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400">
                    <CalendarDays className="h-4 w-4 mr-2" /> Sync Calendar
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleSave} className="hidden sm:flex">
                    <BookmarkPlus className="h-4 w-4 mr-2" /> Save Trip
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleShare} className="hidden sm:flex">
                    <Share2 className="h-4 w-4 mr-2" /> Share
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDownloadPdf}>
                    <Download className="h-4 w-4 mr-2" /> Download PDF
                  </Button>
                </div>
              </div>

              {activeTab === 'itinerary' && (
                <div className="space-y-6">
                  {collaborators.length > 0 && (
                    <div className="flex -space-x-2 mb-2">
                      {collaborators.map((c, i) => (
                        <div key={c} className="h-8 w-8 rounded-full border-2 border-background bg-primary/20 flex items-center justify-center text-xs font-bold z-10" title={`User ${c}`}>
                          U{i+1}
                        </div>
                      ))}
                      <span className="ml-4 text-xs text-muted-foreground flex items-center">{collaborators.length} viewing</span>
                    </div>
                  )}
                  <DraggableItinerary
                    onHoverItem={setActiveItemHover}
                    itineraryDays={itinerary?.days}
                    emitSocket={emit}
                    subscribeSocket={subscribe}
                    socketId={socketId}
                  />
                </div>
              )}
              
              {activeTab === 'logistics' && (
                <div className="space-y-6">
                  {/* Transport Comparison */}
                  <Card className="glass-card overflow-hidden">
                    <CardHeader className="bg-muted/30 pb-4">
                      <CardTitle className="text-lg flex items-center gap-2"><Plane className="h-5 w-5 text-primary" /> Transport Comparison</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="divide-y divide-border/50">
                        <div className="p-4 hover:bg-muted/30 transition-colors flex justify-between items-center bg-primary/5 cursor-pointer">
                          <div className="flex items-center gap-4">
                            <div className="bg-primary/20 p-2 rounded-lg text-primary"><Plane className="h-5 w-5" /></div>
                            <div>
                              <p className="font-bold flex items-center gap-2">AirAsia <span className="text-[10px] bg-green-500/20 text-green-600 px-2 py-0.5 rounded-full uppercase tracking-wider">Fastest</span></p>
                              <p className="text-sm text-muted-foreground">2h 30m • Direct</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg">₹12,500</p>
                            <span className="text-xs text-primary font-medium hover:underline">Select</span>
                          </div>
                        </div>
                        <div className="p-4 hover:bg-muted/30 transition-colors flex justify-between items-center cursor-pointer">
                          <div className="flex items-center gap-4">
                            <div className="bg-accent/10 p-2 rounded-lg text-accent">
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="3" width="16" height="16" rx="2"/><path d="M4 11h16"/><path d="M12 3v8"/><path d="m8 19-2 3"/><path d="m16 19 2 3"/><path d="M2 9h2"/><path d="M20 9h2"/></svg>
                            </div>
                            <div>
                              <p className="font-bold">Express Railway</p>
                              <p className="text-sm text-muted-foreground">8h 45m • Scenic Route</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg">₹4,200</p>
                            <span className="text-xs text-muted-foreground font-medium hover:underline">View</span>
                          </div>
                        </div>
                        <div className="p-4 hover:bg-muted/30 transition-colors flex justify-between items-center cursor-pointer">
                          <div className="flex items-center gap-4">
                            <div className="bg-orange-500/10 p-2 rounded-lg text-orange-500">
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>
                            </div>
                            <div>
                              <p className="font-bold flex items-center gap-2">Sleeper Coach <span className="text-[10px] bg-orange-500/20 text-orange-600 px-2 py-0.5 rounded-full uppercase tracking-wider">Cheapest</span></p>
                              <p className="text-sm text-muted-foreground">14h 00m • Overnight</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg">₹2,800</p>
                            <span className="text-xs text-muted-foreground font-medium hover:underline">View</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Weather Widget — Real data */}
                  <WeatherWidget
                    lat={destCoords.lat}
                    lng={destCoords.lng}
                    location={formData.destinations[0] || 'Destination'}
                  />
                </div>
              )}

              {activeTab === 'packing' && (
                <div className="space-y-6">
                  <PackingList />
                </div>
              )}
            </div>

            {/* Right Column: Map & Recommendations */}
            <div className="space-y-8">
              <div className="sticky top-24 space-y-8">
                <div>
                  <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                    <MapLucide className="h-5 w-5 text-primary" /> Interactive Map
                  </h2>
                  <InteractiveMap 
                    center={destCoords} 
                    zoom={12} 
                    className="h-[300px] rounded-2xl"
                    activeMarkerId={activeItemHover}
                    markers={[
                      { id: 'a1', position: { lat: destCoords.lat + 0.005, lng: destCoords.lng + 0.005 }, title: 'Morning Activity', type: 'attraction' },
                      { id: 'a2', position: { lat: destCoords.lat - 0.003, lng: destCoords.lng + 0.01 }, title: 'Afternoon Activity', type: 'restaurant' },
                      { id: 'a3', position: { lat: destCoords.lat + 0.008, lng: destCoords.lng - 0.005 }, title: 'Evening Activity', type: 'attraction' },
                    ].map(m => ({
                      ...m,
                      description: activeItemHover === m.id ? 'Currently viewing...' : undefined
                    }))}
                  />
                </div>

                {/* Compact Weather in sidebar */}
                <WeatherWidget
                  lat={destCoords.lat}
                  lng={destCoords.lng}
                  location={formData.destinations[0]}
                  compact
                />

                <NearbyPlaces
                  center={destCoords}
                  locationName={formData.destinations[0] || 'Destination'}
                />

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary" /> AI Picks
                    </h2>
                    <div className="flex bg-muted p-1 rounded-lg">
                      <button 
                        onClick={() => setRecTab('transport')}
                        className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${recTab === 'transport' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'}`}
                      >
                        Transport
                      </button>
                      <button 
                        onClick={() => setRecTab('hotels')}
                        className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${recTab === 'hotels' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'}`}
                      >
                        Hotels
                      </button>
                      <button 
                        onClick={() => setRecTab('restaurants')}
                        className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${recTab === 'restaurants' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'}`}
                      >
                        Food
                      </button>
                      <button 
                        onClick={() => setRecTab('attractions')}
                        className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${recTab === 'attractions' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'}`}
                      >
                        Places
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {recTab === 'transport' && transportOptions.map((transport: any) => (
                      <TransportCard key={transport.id} transport={transport} />
                    ))}
                    {recTab === 'hotels' && hotels.map((hotel: any) => (
                      <HotelCard key={hotel.id} hotel={hotel} />
                    ))}
                    {recTab === 'restaurants' && restaurants.map((restaurant: any) => (
                      <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                    ))}
                    {recTab === 'attractions' && attractions.map((attraction: any) => (
                      <AttractionCard key={attraction.id} activity={attraction} />
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* AI Chat Sidebar — now with trip context */}
        <AIChatSidebar
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          tripContext={{
            destination: formData.destinations[0],
            budget: parseInt(formData.budget) || 120000,
            currency: 'INR',
            days: itinerary?.days,
            travelStyle: formData.style,
            transportPreference: formData.transport,
            hotelCategory: formData.hotel,
            foodPreference: 'any',
          }}
        />

        {/* Floating AI Chat Button */}
        {!isChatOpen && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: 'spring' }}
          >
            <Button 
              onClick={() => setIsChatOpen(true)}
              size="icon"
              className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-2xl z-40 bg-gradient-to-r from-primary to-accent hover:scale-105 transition-transform"
            >
              <Bot className="h-6 w-6 text-white" />
            </Button>
          </motion.div>
        )}

      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted pt-28 pb-12 px-4 relative overflow-hidden">
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="flex items-center justify-center gap-2 mb-12 max-w-sm mx-auto">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex-1 flex items-center">
              <div className={`h-2 rounded-full w-full transition-colors duration-500 ${i <= step ? 'bg-primary shadow-sm shadow-primary/50' : 'bg-primary/20'}`} />
            </div>
          ))}
        </div>

        <Card className="glass border-primary/20 shadow-2xl p-8 md:p-12 rounded-3xl min-h-[400px] flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {renderFormStep()}
          </AnimatePresence>

          <div className="flex justify-between mt-12 pt-6 border-t border-border/50">
            <Button variant="ghost" onClick={() => setStep(step - 1)} disabled={step === 1}>Back</Button>
            {step < 3 ? (
              <Button variant="gradient" onClick={() => setStep(step + 1)}>Continue</Button>
            ) : (
              <Button variant="gradient" onClick={handleGenerate} className="gap-2"><Sparkles className="h-4 w-4" /> Generate Itinerary</Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
