import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Calendar as CalendarIcon, Wallet, Mic, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TRAVEL_STYLES } from "@/lib/constants";
import { Plane, Hotel } from "lucide-react";

export function TripPlannerForm({
  step,
  setStep,
  formData,
  setFormData,
  updateForm,
  handleGenerate,
  isGenerating,
  AVAILABLE_INTERESTS,
  toggleInterest,
  browserSupportsSpeechRecognition,
  listening,
  handleMicClick,
}: any) {
  const renderFormStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <h2 className="text-3xl font-bold mb-6 text-center">
              Where do you want to go?
            </h2>
            <div className="space-y-4 max-w-xl mx-auto">
              {formData.destinations.map((dest: string, index: number) => (
                <div key={index} className="relative flex items-center gap-2">
                  <div className="relative flex-1">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground h-6 w-6" />
                    <Input
                      className="pl-14 pr-14 py-8 text-xl rounded-2xl glass shadow-lg border-primary/20 bg-background/50 focus-visible:ring-primary w-full"
                      placeholder={
                        index === 0
                          ? "e.g. Bali, Paris, Tokyo..."
                          : "Add another city (optional)"
                      }
                      value={dest}
                      onChange={(e) => {
                        const newDests = [...formData.destinations];
                        newDests[index] = e.target.value;
                        setFormData((prev: any) => ({
                          ...prev,
                          destinations: newDests,
                        }));
                      }}
                      autoFocus={index === 0}
                    />
                    {browserSupportsSpeechRecognition &&
                      index === formData.destinations.length - 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`absolute right-3 top-1/2 -translate-y-1/2 rounded-full ${listening ? "bg-red-500/10 text-red-500 hover:bg-red-500/20 hover:text-red-600 animate-pulse" : "text-muted-foreground"}`}
                          onClick={handleMicClick}
                        >
                          <Mic className="h-5 w-5" />
                        </Button>
                      )}
                  </div>
                  {index > 0 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        const newDests = formData.destinations.filter(
                          (_: any, i: number) => i !== index,
                        );
                        setFormData((prev: any) => ({
                          ...prev,
                          destinations: newDests,
                        }));
                      }}
                    >
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M18 6 6 18" />
                        <path d="m6 6 12 12" />
                      </svg>
                    </Button>
                  )}
                </div>
              ))}

              {formData.destinations.length < 5 && (
                <Button
                  variant="outline"
                  className="w-full py-6 border-dashed border-2 rounded-2xl text-muted-foreground hover:text-foreground"
                  onClick={() =>
                    setFormData((prev: any) => ({
                      ...prev,
                      destinations: [...prev.destinations, ""],
                    }))
                  }
                >
                  + Add another destination
                </Button>
              )}
            </div>
          </motion.div>
        );
      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <h2 className="text-3xl font-bold mb-6 text-center">When & Who?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Travel Dates
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="relative">
                    <CalendarIcon className="absolute left-3 top-4 text-muted-foreground h-4 w-4 pointer-events-none" />
                    <Input
                      type="date"
                      className="pl-9 py-6 text-sm rounded-xl glass border-primary/20 cursor-pointer"
                      value={formData.dates.split("to")[0]?.trim() || ""}
                      onChange={(e) => {
                        const endDate =
                          formData.dates.split("to")[1]?.trim() || "";
                        updateForm("dates", `${e.target.value} to ${endDate}`);
                      }}
                    />
                  </div>
                  <div className="relative">
                    <CalendarIcon className="absolute left-3 top-4 text-muted-foreground h-4 w-4 pointer-events-none" />
                    <Input
                      type="date"
                      className="pl-9 py-6 text-sm rounded-xl glass border-primary/20 cursor-pointer"
                      value={formData.dates.split("to")[1]?.trim() || ""}
                      onChange={(e) => {
                        const startDate =
                          formData.dates.split("to")[0]?.trim() || "";
                        updateForm(
                          "dates",
                          `${startDate} to ${e.target.value}`,
                        );
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                    <span>Adults (12+ yrs)</span>
                    <span className="text-xl font-bold">{formData.adults}</span>
                  </label>
                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full"
                      onClick={() =>
                        updateForm("adults", Math.max(1, formData.adults - 1))
                      }
                    >
                      -
                    </Button>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${(formData.adults / 10) * 100}%` }}
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full"
                      onClick={() =>
                        updateForm("adults", Math.min(10, formData.adults + 1))
                      }
                    >
                      +
                    </Button>
                  </div>
                </div>

                <div className="space-y-2 pt-4">
                  <label className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                    <span>Children (0-11 yrs)</span>
                    <span className="text-xl font-bold">
                      {formData.children}
                    </span>
                  </label>
                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full"
                      onClick={() =>
                        updateForm(
                          "children",
                          Math.max(0, formData.children - 1),
                        )
                      }
                    >
                      -
                    </Button>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${(formData.children / 10) * 100}%` }}
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full"
                      onClick={() =>
                        updateForm(
                          "children",
                          Math.min(10, formData.children + 1),
                        )
                      }
                    >
                      +
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );
      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <h2 className="text-3xl font-bold mb-6 text-center">
              Budget & Style
            </h2>
            <div className="max-w-3xl mx-auto space-y-8">
              <div className="space-y-2">
                <div className="relative max-w-md mx-auto">
                  <Wallet className="absolute left-4 top-3.5 text-muted-foreground h-5 w-5" />
                  <Input
                    type="number"
                    className="pl-12 py-6 text-lg rounded-xl glass border-primary/20"
                    placeholder="Overall Budget"
                    value={formData.budget}
                    onChange={(e) => updateForm("budget", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-xl mx-auto">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Plane className="h-4 w-4" /> Transport
                  </label>
                  <select
                    className="w-full pl-4 pr-10 py-4 text-md rounded-xl glass border-primary/20 appearance-none bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary"
                    value={formData.transport}
                    onChange={(e) => updateForm("transport", e.target.value)}
                  >
                    <option value="flight">Flight</option>
                    <option value="train">Train</option>
                    <option value="bus">Bus</option>
                    <option value="car">Rental Car</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Hotel className="h-4 w-4" /> Accommodation
                  </label>
                  <select
                    className="w-full pl-4 pr-10 py-4 text-md rounded-xl glass border-primary/20 appearance-none bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary"
                    value={formData.hotel}
                    onChange={(e) => updateForm("hotel", e.target.value)}
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
                {TRAVEL_STYLES.map((style) => (
                  <div
                    key={style.value}
                    onClick={() => updateForm("style", style.value)}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 text-center flex flex-col items-center gap-2 ${
                      formData.style === style.value
                        ? "border-primary bg-primary/10 shadow-md shadow-primary/20"
                        : "border-border/50 hover:border-primary/50 glass hover:bg-background/80"
                    }`}
                  >
                    <span className="text-3xl">{style.icon}</span>
                    <span className="font-medium text-sm">{style.label}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-4 pt-6 border-t border-border/50">
                <h3 className="text-lg font-medium text-center text-muted-foreground">
                  What are your interests?
                </h3>
                <div className="flex flex-wrap justify-center gap-3">
                  {AVAILABLE_INTERESTS.map((interest: string) => (
                    <button
                      key={interest}
                      onClick={() => toggleInterest(interest)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        formData.interests.includes(interest)
                          ? "bg-primary text-primary-foreground shadow-md"
                          : "bg-muted hover:bg-muted/80 text-muted-foreground"
                      }`}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted pt-28 pb-12 px-4 relative overflow-hidden">
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="flex items-center justify-center gap-2 mb-12 max-w-sm mx-auto">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex-1 flex items-center">
              <div
                className={`h-2 rounded-full w-full transition-colors duration-500 ${i <= step ? "bg-primary shadow-sm shadow-primary/50" : "bg-primary/20"}`}
              />
            </div>
          ))}
        </div>

        <Card className="glass border-primary/20 shadow-2xl p-8 md:p-12 rounded-3xl min-h-[400px] flex flex-col justify-center">
          <AnimatePresence mode="wait">{renderFormStep()}</AnimatePresence>

          <div className="flex justify-between mt-12 pt-6 border-t border-border/50">
            <Button
              variant="ghost"
              onClick={() => setStep(step - 1)}
              disabled={step === 1}
            >
              Back
            </Button>
            {step < 3 ? (
              <Button
                variant="gradient"
                onClick={() => setStep(step + 1)}
                disabled={
                  (step === 1 && formData.destinations[0].trim().length < 2) ||
                  (step === 2 &&
                    (!formData.dates.includes("to") ||
                      formData.dates.split("to")[1]?.trim().length === 0))
                }
              >
                Continue
              </Button>
            ) : (
              <Button
                variant="gradient"
                onClick={handleGenerate}
                className="gap-2"
                disabled={!formData.budget || !formData.style || isGenerating}
              >
                <Sparkles className="h-4 w-4" /> Generate Itinerary
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
