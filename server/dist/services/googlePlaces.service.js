"use strict";
// This is a stub for the Google Places API photo enrichment.
// For production, you would need a valid Google Places API key.
// Here we use Unsplash for mock/fallback photos and provide the 
// structure for real Places API calls when the key is available.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.enrichWithPlacePhotos = void 0;
const axios_1 = __importDefault(require("axios"));
const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const enrichWithPlacePhotos = async (activities) => {
    return await Promise.all(activities.map(async (activity) => {
        // If we already have an image URL, skip
        if (activity.imageUrl || activity.photoUrl) {
            return activity;
        }
        // If we have a Google API Key, use it
        if (GOOGLE_PLACES_API_KEY && GOOGLE_PLACES_API_KEY !== 'mock') {
            try {
                const searchQuery = activity.imageSearchQuery || `${activity.name} ${activity.location || ''}`;
                // Step 1: Text Search to get place_id
                const searchRes = await axios_1.default.get(`https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchQuery)}&key=${GOOGLE_PLACES_API_KEY}`);
                if (searchRes.data.results && searchRes.data.results.length > 0) {
                    const place = searchRes.data.results[0];
                    // Step 2: Get photo reference
                    if (place.photos && place.photos.length > 0) {
                        const photoRef = place.photos[0].photo_reference;
                        const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photoRef}&key=${GOOGLE_PLACES_API_KEY}`;
                        return {
                            ...activity,
                            imageUrl: photoUrl,
                            photoUrl: photoUrl,
                            rating: activity.rating || place.rating, // Enrich rating if missing
                        };
                    }
                }
            }
            catch (error) {
                console.error(`Failed to fetch Google Place photo for ${activity.name}`, error);
            }
        }
        // Fallback: Use Unsplash source URL based on category/name
        let keyword = activity.category || 'travel';
        if (['beach', 'restaurant', 'museum', 'shopping'].includes(activity.category)) {
            keyword = activity.category;
        }
        else if (activity.name.toLowerCase().includes('hotel')) {
            keyword = 'hotel';
        }
        // We add a random number to prevent Unsplash from returning the same image for the same keyword
        const randomSeed = Math.floor(Math.random() * 1000);
        return {
            ...activity,
            imageUrl: `https://source.unsplash.com/800x600/?${keyword}&sig=${randomSeed}`,
            photoUrl: `https://source.unsplash.com/800x600/?${keyword}&sig=${randomSeed}`,
        };
    }));
};
exports.enrichWithPlacePhotos = enrichWithPlacePhotos;
