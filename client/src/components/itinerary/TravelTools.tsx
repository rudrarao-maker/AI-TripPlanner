import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Globe, Plane, Briefcase, Calculator, Landmark, ShieldAlert } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function TravelTools({ destination }: { destination: string }) {
  const [currencyAmount, setCurrencyAmount] = useState('100');
  const [convertedAmount, setConvertedAmount] = useState('8300'); // Mock INR rate

  const handleConvert = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCurrencyAmount(val);
    if (!isNaN(Number(val))) {
      setConvertedAmount((Number(val) * 83).toString());
    }
  };

  return (
    <Card className="glass-card overflow-hidden">
      <CardHeader className="bg-primary/5 pb-4 border-b border-border/50">
        <CardTitle className="text-lg flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-primary" /> Live Travel Tools
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5 space-y-6">
        
        {/* Visa & Passport */}
        <div className="space-y-2 border border-border/50 rounded-xl p-4 bg-card">
          <h4 className="font-semibold text-sm flex items-center gap-2">
            <Globe className="h-4 w-4 text-blue-500" /> Visa Requirements
          </h4>
          <p className="text-xs text-muted-foreground">For Indian Citizens traveling to {destination}</p>
          <div className="mt-2 flex items-center gap-2">
            <span className="px-2 py-1 bg-green-500/10 text-green-600 rounded-md text-xs font-bold uppercase">
              E-Visa / Visa on Arrival
            </span>
          </div>
          <a href="#" className="text-xs text-primary hover:underline mt-2 inline-block">Check official requirements →</a>
        </div>

        {/* Currency Converter */}
        <div className="space-y-3 border border-border/50 rounded-xl p-4 bg-card">
          <h4 className="font-semibold text-sm flex items-center gap-2">
            <Calculator className="h-4 w-4 text-emerald-500" /> Currency Converter
          </h4>
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
              <Input 
                type="number" 
                value={currencyAmount} 
                onChange={handleConvert}
                className="pl-7 bg-background h-10"
              />
            </div>
            <span className="text-muted-foreground">=</span>
            <div className="flex-1 relative">
              <span className="absolute left-3 top-2.5 text-muted-foreground">₹</span>
              <Input 
                type="text" 
                value={convertedAmount} 
                readOnly
                className="pl-7 bg-muted text-muted-foreground h-10 border-none font-medium"
              />
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground text-right">1 USD = 83.00 INR (Mid-market rate)</p>
        </div>

        {/* Live Trackers */}
        <div className="space-y-3 border border-border/50 rounded-xl p-4 bg-card">
          <h4 className="font-semibold text-sm flex items-center gap-2">
            <Plane className="h-4 w-4 text-indigo-500" /> Live Trackers
          </h4>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="w-full text-xs h-8">
              Flight Status
            </Button>
            <Button variant="outline" size="sm" className="w-full text-xs h-8">
              Train PNR
            </Button>
          </div>
        </div>

        {/* Emergency Info */}
        <div className="p-3 bg-red-500/5 rounded-xl border border-red-500/20">
          <h4 className="font-semibold text-sm flex items-center gap-2 text-red-600 dark:text-red-400 mb-1">
            <ShieldAlert className="h-4 w-4" /> Emergency
          </h4>
          <div className="text-xs text-muted-foreground space-y-1">
            <div className="flex justify-between"><span>Police:</span> <span className="font-mono font-medium">100 / 112</span></div>
            <div className="flex justify-between"><span>Ambulance:</span> <span className="font-mono font-medium">108</span></div>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}
