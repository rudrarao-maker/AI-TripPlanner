import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar as CalendarIcon, Users, Wallet, Loader2, Sparkles, Navigation, Hotel, Map as MapLucide, Plane, Sun, Download, Mic, Backpack } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InteractiveMap } from '@/components/map/InteractiveMap';
import { HotelCard } from '@/components/recommendations/HotelCard';
import { DraggableItinerary } from '@/components/itinerary/DraggableItinerary';
import { PackingList } from '@/components/itinerary/PackingList';
import { TRAVEL_STYLES } from '@/lib/constants';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import 'regenerator-runtime/runtime';
import html2pdf from 'html2pdf.js';

// Mock Generated Data for demo
const MOCK_ITINERARY = {
  destination: "Bali, Indonesia",
  duration: "7 Days",
  budget: "₹1,20,000",
  mapCenter: { lat: -8.409518, lng: 115.188919 },
  hotels: [
    { id: '1', name: 'Ayana Resort', location: 'Jimbaran', rating: 4.8, pricePerNight: 22000, amenities: ['Pool', 'Spa', 'Wifi', 'Beachfront'], image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800' },
  ]
};

export function TripPlannerPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [itinerary, setItinerary] = useState<any>(null);
  
  // Wanderlog style map sync state
  const [activeItemHover, setActiveItemHover] = useState<string>('');
  
  // Google Travel style tab state
  const [activeTab, setActiveTab] = useState<'itinerary' | 'logistics' | 'packing'>('itinerary');

  // Speech Recognition hook
  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();

  // Form State
  const [formData, setFormData] = useState({
    destination: '',
    dates: '',
    travelers: '2',
    budget: '',
    style: ''
  });

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setItinerary(MOCK_ITINERARY);
    }, 4000);
  };

  const updateForm = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Sync speech transcript to destination
  if (listening && transcript && formData.destination !== transcript) {
    updateForm('destination', transcript);
  }

  const handleMicClick = () => {
    if (listening) {
      SpeechRecognition.stopListening();
    } else {
      resetTranscript();
      SpeechRecognition.startListening({ continuous: true });
    }
  };

  const handleDownloadPdf = () => {
    const element = document.getElementById('itinerary-content');
    if (!element) return;
    
    const opt = {
      margin:       10,
      filename:     `TripCraft-${formData.destination || 'Itinerary'}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    html2pdf().set(opt).from(element).save();
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
            <div className="relative max-w-xl mx-auto flex items-center">
              <MapPin className="absolute left-4 text-muted-foreground h-6 w-6" />
              <Input 
                className="pl-14 pr-14 py-8 text-xl rounded-2xl glass shadow-lg border-primary/20 bg-background/50 focus-visible:ring-primary w-full"
                placeholder="e.g. Bali, Paris, Tokyo..."
                value={formData.destination}
                onChange={(e) => updateForm('destination', e.target.value)}
                autoFocus
              />
              {browserSupportsSpeechRecognition && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={`absolute right-3 rounded-full ${listening ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20 hover:text-red-600 animate-pulse' : 'text-muted-foreground'}`}
                  onClick={handleMicClick}
                >
                  <Mic className="h-5 w-5" />
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
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {TRAVEL_STYLES.map(style => (
                  <div 
                    key={style.id}
                    onClick={() => updateForm('style', style.id)}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 text-center flex flex-col items-center gap-2 ${
                      formData.style === style.id 
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
            src={`https://source.unsplash.com/1600x900/?${encodeURIComponent(formData.destination || 'landscape')}`}
            alt="Destination"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="relative z-20 text-center text-white px-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-widest mb-4">
              <Sparkles className="h-3 w-3" /> AI Generated Itinerary
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-xl">
              {formData.destination || itinerary.destination}
            </h1>
            <div className="flex items-center justify-center gap-6 text-sm md:text-base font-medium drop-shadow-md">
              <span className="flex items-center gap-1.5"><CalendarIcon className="h-4 w-4" /> {formData.dates || itinerary.duration}</span>
              <span className="flex items-center gap-1.5"><Wallet className="h-4 w-4" /> {formData.budget || itinerary.budget}</span>
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
                  <Button variant="outline" size="sm" onClick={handleDownloadPdf}>
                    <Download className="h-4 w-4 mr-2" /> Download PDF
                  </Button>
                </div>
              </div>

              {activeTab === 'itinerary' && (
                <div className="space-y-6">
                  {/* Wanderlog style drag and drop itinerary */}
                  <DraggableItinerary onHoverItem={setActiveItemHover} />
                  <DraggableItinerary onHoverItem={setActiveItemHover} />
                </div>
              )}
              
              {activeTab === 'logistics' && (
                <div className="space-y-6">
                  {/* Transport Comparison (Google Travel Style) */}
                  <Card className="glass-card overflow-hidden">
                    <CardHeader className="bg-muted/30 pb-4">
                      <CardTitle className="text-lg flex items-center gap-2"><Plane className="h-5 w-5 text-primary" /> Transport Comparison</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="divide-y divide-border/50">
                        {/* Flight Option */}
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

                        {/* Train Option */}
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

                        {/* Bus Option */}
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

                  <Card className="glass-card">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2"><Sun className="h-5 w-5 text-yellow-500" /> Weather-Aware Adjustments</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-yellow-700 dark:text-yellow-400">
                        <Sun className="h-6 w-6 shrink-0" />
                        <div>
                          <p className="font-bold">Sunny & 28°C expected.</p>
                          <p className="text-sm mt-1">Perfect conditions for your Day 1 City Tour. Remember to pack sunscreen from your checklist!</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
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
                    center={itinerary.mapCenter} 
                    zoom={12} 
                    className="h-[300px] rounded-2xl"
                    activeMarkerId={activeItemHover}
                    markers={[
                      { id: 'a1', position: { lat: -8.409518, lng: 115.188919 }, title: 'Cultural City Tour', type: 'attraction' },
                      { id: 'a2', position: { lat: -8.420000, lng: 115.200000 }, title: 'Local Cuisine Lunch', type: 'restaurant' }
                    ].map(m => ({
                      ...m,
                      description: activeItemHover === m.id ? 'Currently viewing...' : undefined
                    }))}
                  />
                </div>

                <div>
                  <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                    <Hotel className="h-5 w-5 text-accent" /> Recommended Stays
                  </h2>
                  <div className="grid grid-cols-1 gap-4">
                    {itinerary.hotels.map((hotel: any) => (
                      <HotelCard key={hotel.id} hotel={hotel} />
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
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
