// ============================================================
// Curated Destination Data for Smart Itinerary Generation
// Covers 25+ popular Indian & international destinations
// ============================================================

export interface DestinationInfo {
  places: { title: string; desc: string; location: string; type: string }[];
  foods: { name: string; desc: string; spot: string; cost: number }[];
  hotels: { budget: string; standard: string; luxury: string };
  coverImage: string;
}

export const DESTINATION_DATA: Record<string, DestinationInfo> = {

  // ==================== GOA ====================
  goa: {
    places: [
      { title: 'Basilica of Bom Jesus', desc: 'UNESCO World Heritage church with the relics of St. Francis Xavier. A must-visit for history lovers.', location: 'Old Goa', type: 'cultural' },
      { title: 'Dudhsagar Waterfalls Trek', desc: 'Trek through lush forests to one of India\'s tallest waterfalls cascading in milky white streams.', location: 'Mollem National Park', type: 'adventure' },
      { title: 'Anjuna Flea Market', desc: 'Browse colorful stalls selling handmade jewelry, clothes, spices, and local art every Wednesday.', location: 'Anjuna Beach', type: 'shopping' },
      { title: 'Palolem Beach Kayaking', desc: 'Paddle through calm waters and explore hidden coves and Butterfly Island.', location: 'Palolem, South Goa', type: 'adventure' },
      { title: 'Fort Aguada Sunset', desc: 'Watch a breathtaking sunset from the 17th-century Portuguese fort overlooking the Arabian Sea.', location: 'Sinquerim, North Goa', type: 'relaxation' },
      { title: 'Spice Plantation Tour', desc: 'Walk through aromatic plantations of cardamom, vanilla, and pepper. Includes a traditional Goan lunch.', location: 'Ponda, Goa', type: 'cultural' },
      { title: 'Scuba Diving at Grande Island', desc: 'Dive 12m deep to explore vibrant coral reefs, tropical fish, and a sunken ship.', location: 'Grande Island', type: 'adventure' },
      { title: 'Chapora Fort Viewpoint', desc: 'The famous "Dil Chahta Hai" fort with panoramic views of Vagator beach below.', location: 'Chapora, North Goa', type: 'cultural' },
      { title: 'Ashwem Beach Yoga Retreat', desc: 'Morning yoga session on a pristine, uncrowded beach followed by a detox smoothie.', location: 'Ashwem Beach', type: 'relaxation' },
      { title: 'Latin Quarter Heritage Walk', desc: 'Stroll through colorful Portuguese-era houses, art cafés, and bakeries in Fontainhas.', location: 'Panaji, Goa', type: 'cultural' },
    ],
    foods: [
      { name: 'Fish Thali at Ritz Classic', desc: 'Iconic Goan fish curry rice thali — crispy fried fish, sol kadhi, and kokum.', spot: 'Panaji', cost: 0.04 },
      { name: 'Pork Vindaloo at Mum\'s Kitchen', desc: 'Authentic spicy Goan pork vindaloo, a must-try local delicacy.', spot: 'Panaji', cost: 0.05 },
      { name: 'Bebinca at Café Bodega', desc: 'Traditional 16-layer Goan dessert paired with artisanal coffee in a heritage house.', spot: 'Fontainhas', cost: 0.03 },
      { name: 'Seafood at Martin\'s Corner', desc: 'Legendary open-air restaurant serving butter garlic prawns and crab xec xec.', spot: 'Betalbatim', cost: 0.06 },
      { name: 'Veg Thali at Bean Me Up', desc: 'Plant-based Goan cuisine with jackfruit curry and coconut rice.', spot: 'Vagator', cost: 0.03 },
    ],
    hotels: { budget: 'OYO Goa Beach Hostel', standard: 'Treehouse Neptune Hotel', luxury: 'Taj Exotica Resort & Spa' },
    coverImage: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800',
  },

  // ==================== BALI ====================
  bali: {
    places: [
      { title: 'Tegallalang Rice Terraces', desc: 'Walk through iconic emerald-green rice paddies with stunning valley views and jungle swings.', location: 'Ubud, Bali', type: 'cultural' },
      { title: 'Uluwatu Temple Sunset', desc: 'Watch a Kecak fire dance performance at this dramatic clifftop temple above the Indian Ocean.', location: 'Uluwatu, South Bali', type: 'cultural' },
      { title: 'Mount Batur Sunrise Trek', desc: 'Hike an active volcano in the dark and watch the sunrise above the clouds at 1,717m.', location: 'Kintamani, Bali', type: 'adventure' },
      { title: 'Tirta Empul Holy Spring', desc: 'Participate in a Balinese purification ritual at this sacred 1000-year-old water temple.', location: 'Tampaksiring', type: 'cultural' },
      { title: 'Nusa Penida Island Hopping', desc: 'Speedboat to Kelingking Beach (T-Rex cliff), Angel\'s Billabong, and Crystal Bay snorkeling.', location: 'Nusa Penida', type: 'adventure' },
      { title: 'Ubud Monkey Forest', desc: 'Walk through an ancient forest sanctuary home to 700+ Balinese long-tailed macaques.', location: 'Ubud, Bali', type: 'relaxation' },
      { title: 'White Water Rafting Ayung', desc: '10km rafting through river gorges surrounded by waterfalls and tropical vegetation.', location: 'Ayung River, Ubud', type: 'adventure' },
      { title: 'Seminyak Beach Club', desc: 'Spend the afternoon at Potato Head or Ku De Ta with cocktails and infinity pool.', location: 'Seminyak, Bali', type: 'relaxation' },
    ],
    foods: [
      { name: 'Babi Guling at Ibu Oka', desc: 'Famous Balinese roast suckling pig, crispy skin with spiced rice. Anthony Bourdain\'s pick.', spot: 'Ubud', cost: 0.03 },
      { name: 'Nasi Goreng at Warung Babi', desc: 'Classic Indonesian fried rice with egg, prawn crackers, and sambal.', spot: 'Seminyak', cost: 0.02 },
      { name: 'Smoothie Bowl at Kynd Community', desc: 'Instagram-famous acai bowl topped with dragon fruit, granola, and coconut flakes.', spot: 'Seminyak', cost: 0.02 },
      { name: 'Seafood at Jimbaran Bay', desc: 'Grilled lobster and prawns on the beach at sunset with your feet in the sand.', spot: 'Jimbaran', cost: 0.06 },
    ],
    hotels: { budget: 'Capsule Hotel Bali', standard: 'Alaya Resort Ubud', luxury: 'Ayana Resort & Spa' },
    coverImage: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800',
  },

  // ==================== MANALI ====================
  manali: {
    places: [
      { title: 'Rohtang Pass Excursion', desc: 'Drive up to 13,050 ft for snow activities, stunning views of Pir Panjal range, and paragliding.', location: 'Rohtang Pass', type: 'adventure' },
      { title: 'Solang Valley Adventure', desc: 'Try zorbing, paragliding, and rope-way rides in this adventure-packed valley.', location: 'Solang Valley', type: 'adventure' },
      { title: 'Old Manali Café Hopping', desc: 'Explore quirky cafés, live music spots, and hippie bookshops along the river.', location: 'Old Manali', type: 'relaxation' },
      { title: 'Hadimba Temple', desc: 'Visit the ancient wooden pagoda-style temple surrounded by towering deodar cedar trees.', location: 'Manali Town', type: 'cultural' },
      { title: 'Beas River Rafting', desc: '14km white-water rafting through Grade II-III rapids surrounded by mountains.', location: 'Pirdi to Jhiri', type: 'adventure' },
      { title: 'Jogini Waterfall Trek', desc: 'A scenic 3km trek through pine forests to a spectacular 150ft waterfall.', location: 'Vashisht, Manali', type: 'adventure' },
      { title: 'Vashisht Hot Springs', desc: 'Soak in natural hot water springs inside an ancient stone temple.', location: 'Vashisht Village', type: 'relaxation' },
      { title: 'Great Himalayan National Park', desc: 'UNESCO World Heritage forest with snow leopards, Himalayan brown bears, and 375 fauna species.', location: 'Kullu Valley', type: 'adventure' },
    ],
    foods: [
      { name: 'Siddu & Trout at Lazy Dog', desc: 'Traditional Himachali steamed bun (siddu) and freshwater river trout.', spot: 'Old Manali', cost: 0.03 },
      { name: 'Tibetan Momos at Chopsticks', desc: 'Hand-made steamed dumplings with spicy chutney — Manali\'s specialty.', spot: 'Mall Road', cost: 0.02 },
      { name: 'Thukpa at Johnson\'s Café', desc: 'Piping hot Tibetan noodle soup, perfect after a cold mountain day.', spot: 'Circuit House Road', cost: 0.03 },
      { name: 'Pizza at Drifters\' Inn', desc: 'Wood-fired pizza in a cozy mountain café with river views and live guitar.', spot: 'Old Manali', cost: 0.04 },
    ],
    hotels: { budget: 'Zostel Manali', standard: 'Johnson Lodge', luxury: 'The Himalayan Resort & Spa' },
    coverImage: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800',
  },

  // ==================== JAIPUR ====================
  jaipur: {
    places: [
      { title: 'Amber Fort & Elephant Ride', desc: 'Explore the majestic hilltop fortress with intricate mirror work, gardens, and panoramic views.', location: 'Amer, Jaipur', type: 'cultural' },
      { title: 'Hawa Mahal (Palace of Winds)', desc: 'Iconic pink sandstone façade with 953 small windows, designed for royal women to observe street life.', location: 'Old City, Jaipur', type: 'cultural' },
      { title: 'City Palace Museum', desc: 'Walk through the lavish royal palace with textile galleries, armory, and the world\'s largest silver vessels.', location: 'City Palace, Jaipur', type: 'cultural' },
      { title: 'Jantar Mantar Observatory', desc: 'UNESCO-listed astronomical observation site with the world\'s largest stone sundial.', location: 'Near City Palace', type: 'cultural' },
      { title: 'Nahargarh Fort Sunset', desc: 'Stunning panoramic sunset views over the entire Pink City from the fort walls. Perfect for photography.', location: 'Nahargarh Hills', type: 'relaxation' },
      { title: 'Jal Mahal (Water Palace)', desc: 'Float-like palace in the middle of Man Sagar Lake — stunning at golden hour.', location: 'Man Sagar Lake', type: 'relaxation' },
      { title: 'Hot Air Balloon Ride', desc: 'Soar above the Rajasthani landscape, forts, and villages in a 1-hour balloon flight at sunrise.', location: 'Jaipur Outskirts', type: 'adventure' },
      { title: 'Johari Bazaar Shopping', desc: 'Shop for traditional Rajasthani jewelry, lac bangles, gemstones, and bandhani textiles.', location: 'Johari Bazaar, Old City', type: 'shopping' },
    ],
    foods: [
      { name: 'Dal Baati Churma at LMB', desc: 'Rajasthan\'s signature dish — baked wheat balls with lentils and sweet churma at this 1727 heritage restaurant.', spot: 'Johari Bazaar', cost: 0.03 },
      { name: 'Pyaaz Kachori at Rawat Misthan', desc: 'Jaipur\'s most famous street snack — crispy onion-filled pastry with tangy chutney.', spot: 'Station Road', cost: 0.01 },
      { name: 'Thali at Chokhi Dhani', desc: 'Grand Rajasthani village experience with unlimited thali, folk dances, and puppet shows.', spot: 'Tonk Road', cost: 0.05 },
      { name: 'Lassi at Lassiwala', desc: 'World-famous thick creamy lassi served in earthen pots since 1944.', spot: 'MI Road', cost: 0.01 },
      { name: 'Ghewar at Sodhani Sweets', desc: 'Traditional Rajasthani disc-shaped sweet soaked in sugar syrup — a festive delicacy.', spot: 'Chaura Rasta', cost: 0.02 },
    ],
    hotels: { budget: 'Zostel Jaipur', standard: 'Samode Haveli', luxury: 'Rambagh Palace by Taj' },
    coverImage: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800',
  },

  // ==================== KERALA ====================
  kerala: {
    places: [
      { title: 'Alleppey Houseboat Cruise', desc: 'Overnight cruise on a traditional kettuvallam through the serene backwaters, paddy fields, and village life.', location: 'Alleppey Backwaters', type: 'relaxation' },
      { title: 'Munnar Tea Plantation Walk', desc: 'Walk through endless carpets of emerald-green tea estates at 6,000 ft with misty mountain views.', location: 'Munnar, Idukki', type: 'cultural' },
      { title: 'Periyar Wildlife Safari', desc: 'Boat safari on Periyar Lake to spot wild elephants, bison, and sambar deer in their natural habitat.', location: 'Thekkady', type: 'adventure' },
      { title: 'Varkala Cliff Beach', desc: 'Swim and sunbathe at the dramatic red laterite cliff beach with mineral water springs below.', location: 'Varkala, Trivandrum', type: 'relaxation' },
      { title: 'Kathakali Dance Show', desc: 'Watch the elaborate 4-hour classical dance drama with vibrant costumes and facial expressions.', location: 'Kochi Cultural Centre', type: 'cultural' },
      { title: 'Fort Kochi Heritage Walk', desc: 'Stroll past Chinese fishing nets, St. Francis Church (1503), and the Jewish Synagogue in Mattancherry.', location: 'Fort Kochi', type: 'cultural' },
      { title: 'Athirappilly Waterfalls', desc: 'Kerala\'s Niagara — a 80ft waterfall surrounded by dense tropical rainforest.', location: 'Thrissur', type: 'adventure' },
      { title: 'Ayurvedic Spa Treatment', desc: 'Traditional 90-minute Panchakarma treatment with herbal oils and Shirodhara therapy.', location: 'Kovalam / Varkala', type: 'relaxation' },
    ],
    foods: [
      { name: 'Kerala Sadya at Villa Maya', desc: 'Grand vegetarian feast on banana leaf — 26+ dishes including sambar, avial, payasam.', spot: 'Trivandrum', cost: 0.04 },
      { name: 'Karimeen Pollichathu at Thaff', desc: 'Pearl spot fish marinated in spices, wrapped in banana leaf, and slow-cooked.', spot: 'Alleppey', cost: 0.05 },
      { name: 'Appam & Stew at Kayees Rahmathulla', desc: 'Lacy rice pancakes with creamy coconut vegetable stew — a classic Kerala breakfast.', spot: 'Kochi', cost: 0.02 },
      { name: 'Prawn Curry at Fort House', desc: 'Spicy Malabar prawn curry with fluffy appams, overlooking the Kochi harbor.', spot: 'Fort Kochi', cost: 0.05 },
    ],
    hotels: { budget: 'Zostel Kochi', standard: 'Brunton Boatyard, CGH', luxury: 'Kumarakom Lake Resort' },
    coverImage: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800',
  },

  // ==================== LADAKH / LEH ====================
  ladakh: {
    places: [
      { title: 'Pangong Tso Lake', desc: 'The stunning blue lake from "3 Idiots" — watch the water change from azure to turquoise as clouds drift by.', location: 'Pangong, Ladakh', type: 'relaxation' },
      { title: 'Nubra Valley & Diskit Monastery', desc: 'Ride double-humped Bactrian camels on sand dunes and visit the 14th-century monastery.', location: 'Nubra Valley', type: 'adventure' },
      { title: 'Khardung La Pass', desc: 'Drive through one of the world\'s highest motorable passes at 17,582 ft with breathtaking Karakoram views.', location: 'Khardung La', type: 'adventure' },
      { title: 'Thiksey Monastery', desc: 'A 12-story hilltop gompa resembling Tibet\'s Potala Palace, with morning prayer ceremonies at 6 AM.', location: 'Thiksey, Leh', type: 'cultural' },
      { title: 'Magnetic Hill', desc: 'Experience the gravity-defying optical illusion where vehicles appear to roll uphill on their own.', location: 'Leh-Kargil Road', type: 'cultural' },
      { title: 'Zanskar River Rafting', desc: 'Grade III-IV white-water rafting through dramatic canyons of the Zanskar river.', location: 'Zanskar Valley', type: 'adventure' },
      { title: 'Shanti Stupa Sunset', desc: 'Climb 500 steps to the white-domed Japanese peace pagoda for 360° views of Leh valley at sunset.', location: 'Leh Town', type: 'relaxation' },
      { title: 'Hemis Monastery', desc: 'Ladakh\'s largest and richest monastery, home to the famous Hemis festival and a giant Thangka painting.', location: 'Hemis, Ladakh', type: 'cultural' },
    ],
    foods: [
      { name: 'Thukpa at Tibetan Kitchen', desc: 'Hearty Ladakhi noodle soup with vegetables and yak meat, perfect at high altitude.', spot: 'Main Bazaar, Leh', cost: 0.02 },
      { name: 'Momos at Gesmo Restaurant', desc: 'Steamed and fried momos with fiery red chutney — a Leh institution since decades.', spot: 'Fort Road, Leh', cost: 0.02 },
      { name: 'Butter Tea & Skyu at The Tibetan Kitchen', desc: 'Traditional salt butter tea and Ladakhi pasta stew with root vegetables.', spot: 'Leh Old Town', cost: 0.02 },
      { name: 'Wood-fired Pizza at La Pizzeria', desc: 'Surprisingly authentic Italian pizza at 11,500 ft, run by a local-Italian couple.', spot: 'Changspa Road, Leh', cost: 0.04 },
    ],
    hotels: { budget: 'Zostel Leh', standard: 'The Grand Dragon Ladakh', luxury: 'The Chamba Camp Thiksey' },
    coverImage: 'https://images.unsplash.com/photo-1626015365107-e63e8af4d420?w=800',
  },

  // ==================== UDAIPUR ====================
  udaipur: {
    places: [
      { title: 'City Palace Museum', desc: 'Rajasthan\'s largest palace complex overlooking Lake Pichola, with 11 mahals, courtyards, and museums.', location: 'City Palace, Udaipur', type: 'cultural' },
      { title: 'Lake Pichola Boat Ride', desc: 'Sunset boat cruise past Jag Mandir island palace and the iconic Taj Lake Palace floating on the water.', location: 'Lake Pichola', type: 'relaxation' },
      { title: 'Jagdish Temple', desc: 'Intricately carved Indo-Aryan temple from 1651 dedicated to Lord Vishnu, right in the old city.', location: 'Old City, Udaipur', type: 'cultural' },
      { title: 'Saheliyon Ki Bari', desc: 'Garden of the Maidens — a beautiful garden with marble elephants, fountains, and lotus pools.', location: 'Fateh Sagar Road', type: 'relaxation' },
      { title: 'Kumbhalgarh Fort Day Trip', desc: 'Visit the fort with the world\'s 2nd longest wall (36 km) and 360 temples inside its compound.', location: 'Kumbhalgarh (80 km)', type: 'adventure' },
      { title: 'Bagore Ki Haveli Cultural Show', desc: 'Evening Rajasthani folk dance show with puppetry, fire dancing, and traditional music.', location: 'Gangaur Ghat', type: 'cultural' },
      { title: 'Haldighati & Maharana Pratap Memorial', desc: 'Visit the historic battlefield and the memorial honoring the Rajput warrior king.', location: 'Haldighati (40 km)', type: 'cultural' },
    ],
    foods: [
      { name: 'Dal Baati at Natraj Dining Hall', desc: 'Authentic Mewari dal baati churma served on silver thalis — a Udaipur institution.', spot: 'City Palace Road', cost: 0.03 },
      { name: 'Lakeside Dinner at Ambrai', desc: 'Candlelit dinner overlooking City Palace and Lake Pichola — Udaipur\'s most romantic restaurant.', spot: 'Amet Haveli, Gangaur Ghat', cost: 0.06 },
      { name: 'Street Food at Hathi Pol', desc: 'Sample kachori, mirchi vada, and malpua at Udaipur\'s busiest street food strip.', spot: 'Hathi Pol Bazaar', cost: 0.02 },
      { name: 'Gatta Curry at Shree Ji', desc: 'Rajasthani gram-flour dumplings in tangy yogurt gravy — comfort food at its finest.', spot: 'Sukhadia Circle', cost: 0.03 },
    ],
    hotels: { budget: 'Bunkyard Hostel', standard: 'Amet Haveli', luxury: 'Taj Lake Palace' },
    coverImage: 'https://images.unsplash.com/photo-1597074866923-dc0589150458?w=800',
  },

  // ==================== SHIMLA ====================
  shimla: {
    places: [
      { title: 'The Ridge & Mall Road Walk', desc: 'Stroll along the iconic British-era promenade with stunning views of snow-capped Himalayas.', location: 'The Ridge, Shimla', type: 'relaxation' },
      { title: 'Toy Train to Kalka', desc: 'UNESCO Heritage railway — a 96 km narrow-gauge journey through 102 tunnels and 864 bridges.', location: 'Shimla Railway Station', type: 'cultural' },
      { title: 'Jakhu Temple & Hanuman Statue', desc: 'Trek up to the hilltop temple at 8,500 ft with a 108-ft tall Hanuman statue and monkey encounters.', location: 'Jakhu Hill', type: 'adventure' },
      { title: 'Kufri Adventure Park', desc: 'Horse riding, zip-lining, and go-karting at this hill station 16km from Shimla.', location: 'Kufri', type: 'adventure' },
      { title: 'Christ Church', desc: 'Second-oldest church in North India (1857) with beautiful stained glass windows — iconic Shimla landmark.', location: 'The Ridge', type: 'cultural' },
      { title: 'Viceregal Lodge (IIAS)', desc: 'Explore the stunning Scottish Baronial-style mansion where Indian Independence was decided.', location: 'Observatory Hill', type: 'cultural' },
    ],
    foods: [
      { name: 'Chana Madra at Baljees', desc: 'Traditional Himachali chickpea curry cooked in yogurt gravy — served since 1940.', spot: 'The Mall, Shimla', cost: 0.03 },
      { name: 'Momos at Himalayan Café', desc: 'Steamed and fried momos with spicy Schezwan sauce — a Shimla street staple.', spot: 'Lakkar Bazaar', cost: 0.02 },
      { name: 'Hot Chocolate at Indian Coffee House', desc: 'Colonial-era café with marble tables, turbaned waiters, and the best hot chocolate in town.', spot: 'The Mall', cost: 0.01 },
      { name: 'Tudkiya Bhath at Wake & Bake', desc: 'Himachali spiced rice pulao with lentils and dry fruits in a cozy mountain café.', spot: 'Middle Bazaar', cost: 0.03 },
    ],
    hotels: { budget: 'Zostel Shimla', standard: 'Radisson Hotel Shimla', luxury: 'Wildflower Hall by Oberoi' },
    coverImage: 'https://images.unsplash.com/photo-1597074866923-dc0589150458?w=800',
  },

  // ==================== RISHIKESH ====================
  rishikesh: {
    places: [
      { title: 'Bungee Jumping (83m)', desc: 'India\'s highest bungee jump over a rocky ravine — an adrenaline rush like no other.', location: 'Mohan Chatti', type: 'adventure' },
      { title: 'Ganga Aarti at Triveni Ghat', desc: 'Witness the mesmerizing fire ceremony on the holy Ganges at sunset with chanting and floating diyas.', location: 'Triveni Ghat', type: 'cultural' },
      { title: 'White Water Rafting', desc: '16 km rafting through Grade III-IV rapids like Roller Coaster, Golf Course, and The Wall.', location: 'Shivpuri to Rishikesh', type: 'adventure' },
      { title: 'Beatles Ashram', desc: 'Explore the abandoned Maharishi Mahesh Yogi ashram where the Beatles wrote the White Album in 1968.', location: 'Ram Jhula', type: 'cultural' },
      { title: 'Laxman Jhula Suspension Bridge', desc: 'Walk the iconic 450-ft iron bridge hanging 70 ft above the turquoise Ganges.', location: 'Laxman Jhula', type: 'cultural' },
      { title: 'Neer Garh Waterfall Trek', desc: 'Easy 2 km forest trek to a scenic two-tiered waterfall with natural rock pools.', location: 'Neer Garh', type: 'adventure' },
      { title: 'Yoga at Parmarth Niketan', desc: 'Join a morning yoga and meditation session at one of the largest ashrams on the Ganges.', location: 'Parmarth Niketan Ashram', type: 'relaxation' },
    ],
    foods: [
      { name: 'Thali at Chotiwala', desc: 'Rishikesh\'s most famous pure-veg restaurant since 1958 — unlimited thali with views of Ram Jhula.', spot: 'Ram Jhula', cost: 0.02 },
      { name: 'Israeli Shakshuka at Little Buddha Café', desc: 'Poached eggs in spiced tomato sauce with pita — popular backpacker café above the river.', spot: 'Laxman Jhula', cost: 0.03 },
      { name: 'Banana Pancake at Beatles Café', desc: 'Fluffy pancakes, muesli, and fresh juice with Ganges views — the ultimate hippie breakfast.', spot: 'Laxman Jhula', cost: 0.02 },
      { name: 'Aloo Puri at Madras Café', desc: 'Spicy potato curry with crispy puris and lassi — a filling North Indian breakfast.', spot: 'Tapovan', cost: 0.01 },
    ],
    hotels: { budget: 'Zostel Rishikesh', standard: 'Divine Resort', luxury: 'Aloha on the Ganges' },
    coverImage: 'https://images.unsplash.com/photo-1545389336-cf090694435e?w=800',
  },

  // ==================== VARANASI ====================
  varanasi: {
    places: [
      { title: 'Sunrise Boat Ride on the Ganges', desc: 'Witness the magical sunrise over the 88 ghats of the world\'s oldest living city from a traditional wooden boat.', location: 'Dashashwamedh Ghat', type: 'cultural' },
      { title: 'Ganga Aarti at Dashashwamedh Ghat', desc: 'The grand 45-minute evening fire ceremony with synchronized priests, conch shells, and thousands of diyas.', location: 'Dashashwamedh Ghat', type: 'cultural' },
      { title: 'Kashi Vishwanath Temple', desc: 'One of the 12 Jyotirlingas — the holiest Shiva temple in Hinduism, recently renovated with the Kashi Corridor.', location: 'Vishwanath Gali', type: 'cultural' },
      { title: 'Sarnath Day Trip', desc: 'Visit the sacred Buddhist site where Lord Buddha gave his first sermon. Explore the Dhamek Stupa and museum.', location: 'Sarnath (10 km)', type: 'cultural' },
      { title: 'Silk Weaving Workshop', desc: 'Watch artisans weave the famous Banarasi silk sarees on handlooms, and shop directly from weavers.', location: 'Madanpura, Varanasi', type: 'cultural' },
      { title: 'Old City Walking Tour', desc: 'Navigate narrow alleys past 500-year-old havelis, wrestling akharas, and hidden temples with a local guide.', location: 'Old Varanasi', type: 'cultural' },
    ],
    foods: [
      { name: 'Kachori-Sabzi at Ram Bhandar', desc: 'Legendary crispy kachori with spiced potato curry — Varanasi\'s most iconic breakfast since 1920.', spot: 'Thatheri Bazaar', cost: 0.01 },
      { name: 'Banarasi Paan at Keshav Tambooli', desc: 'The iconic sweet betel leaf stuffed with gulkand, fennel, and silver leaf.', spot: 'Godowlia Chowk', cost: 0.005 },
      { name: 'Thandai & Lassi at Blue Lassi', desc: 'World-famous thick fruit lassi in clay pots and saffron thandai — 80+ year old shop.', spot: 'Kachori Gali', cost: 0.01 },
      { name: 'Chaat at Deena Chat Bhandar', desc: 'Varanasi\'s best tamatar chaat, pani puri, and tikki — queue worth the wait!', spot: 'Godowlia', cost: 0.01 },
    ],
    hotels: { budget: 'Zostel Varanasi', standard: 'BrijRama Palace', luxury: 'Taj Nadesar Palace' },
    coverImage: 'https://images.unsplash.com/photo-1571536802053-4e6b130eae52?w=800',
  },

  // ==================== AGRA ====================
  agra: {
    places: [
      { title: 'Taj Mahal at Sunrise', desc: 'Witness the ivory-white marble mausoleum glow pink and gold at sunrise — a UNESCO World Wonder.', location: 'Taj Mahal, Agra', type: 'cultural' },
      { title: 'Agra Fort', desc: 'Massive 16th-century red sandstone fortress with stunning views of the Taj Mahal from Musamman Burj.', location: 'Agra Fort', type: 'cultural' },
      { title: 'Fatehpur Sikri', desc: 'Abandoned Mughal ghost city with the stunning Buland Darwaza — Asia\'s largest gateway (54m high).', location: 'Fatehpur Sikri (37 km)', type: 'cultural' },
      { title: 'Mehtab Bagh Sunset', desc: 'The best sunset view of the Taj Mahal from across the Yamuna river — a photographer\'s paradise.', location: 'Mehtab Bagh', type: 'relaxation' },
      { title: 'Tomb of Itimad-ud-Daulah', desc: 'The "Baby Taj" — a delicate marble tomb with stunning pietra dura inlay work, predating the Taj.', location: 'Yamuna Bank', type: 'cultural' },
      { title: 'Marble Inlay Workshop', desc: 'Watch master craftsmen create intricate marble inlay (parchin kari) using the same techniques as the Taj.', location: 'Agra Crafts Village', type: 'cultural' },
    ],
    foods: [
      { name: 'Petha at Panchhi Petha', desc: 'Agra\'s iconic translucent pumpkin sweet in 50+ flavors — the city\'s signature souvenir.', spot: 'Noori Gate', cost: 0.01 },
      { name: 'Mughlai at Peshawri (ITC Mughal)', desc: 'Dal Bukhara and kebabs cooked in a tandoor — one of India\'s most awarded restaurants.', spot: 'ITC Mughal Hotel', cost: 0.08 },
      { name: 'Bedai & Jalebi at Deviram', desc: 'Deep-fried puffed bread with spicy aloo curry and hot jalebis — classic Agra breakfast.', spot: 'Kinari Bazaar', cost: 0.01 },
      { name: 'Chaat at Panchi Chaat House', desc: 'Agra\'s best aloo tikki, dahi bhalla, and pani puri — a 60+ year old institution.', spot: 'Sadar Bazaar', cost: 0.01 },
    ],
    hotels: { budget: 'Zostel Agra', standard: 'The Oberoi Amarvilas', luxury: 'ITC Mughal, Agra' },
    coverImage: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800',
  },

  // ==================== MUMBAI ====================
  mumbai: {
    places: [
      { title: 'Gateway of India & Colaba Walk', desc: 'Start at the iconic arch monument, then walk through Colaba Causeway for street shopping and cafés.', location: 'Colaba, Mumbai', type: 'cultural' },
      { title: 'Marine Drive Sunset', desc: 'Walk along the Queen\'s Necklace — the 3.6 km curved seafront promenade glowing at sunset.', location: 'Marine Drive', type: 'relaxation' },
      { title: 'Dharavi Art & Craft Tour', desc: 'Guided walk through Asia\'s most productive slum — pottery, leather, and recycling workshops.', location: 'Dharavi', type: 'cultural' },
      { title: 'Elephanta Caves Day Trip', desc: 'Ferry to the UNESCO cave temples with 1500-year-old rock-cut sculptures of Lord Shiva.', location: 'Elephanta Island', type: 'cultural' },
      { title: 'Dhobi Ghat & Mahalaxmi Tour', desc: 'Watch the world\'s largest open-air laundry in action and visit the nearby Mahalaxmi Temple.', location: 'Mahalaxmi', type: 'cultural' },
      { title: 'Bandra Street Art Walk', desc: 'Discover vibrant murals, graffiti, and indie cafés in Mumbai\'s hippest neighborhood.', location: 'Bandra West', type: 'relaxation' },
      { title: 'Bollywood Studio Tour', desc: 'Go behind the scenes of India\'s film industry at Film City with live set visits.', location: 'Goregaon, Film City', type: 'cultural' },
    ],
    foods: [
      { name: 'Vada Pav at Ashok Vada Pav', desc: 'Mumbai\'s original street burger — spicy potato fritter in pav with chutneys. The city\'s soul food.', spot: 'Kirti College, Dadar', cost: 0.005 },
      { name: 'Pav Bhaji at Sardar', desc: 'Buttery spiced vegetable mash with toasted pav — served fresh since 1953 at Tardeo.', spot: 'Tardeo', cost: 0.02 },
      { name: 'Seafood at Trishna', desc: 'Legendary butter garlic crab and Koliwada prawns — Mumbai\'s finest coastal cuisine.', spot: 'Fort, Mumbai', cost: 0.06 },
      { name: 'Irani Chai & Bun Maska at Kyani & Co', desc: 'Classic Parsi café experience — sweet milky chai with buttered bun in a 1904 café.', spot: 'Marine Lines', cost: 0.01 },
      { name: 'Misal Pav at Aaswad', desc: 'Spicy Maharashtrian sprout curry with pav — fiery, tangy, and unforgettable.', spot: 'Dadar', cost: 0.02 },
    ],
    hotels: { budget: 'Zostel Mumbai', standard: 'Trident Nariman Point', luxury: 'Taj Mahal Palace' },
    coverImage: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800',
  },

  // ==================== DELHI ====================
  delhi: {
    places: [
      { title: 'Red Fort & Chandni Chowk', desc: 'Explore the Mughal emperor\'s fortress then dive into the chaotic, delicious lanes of Old Delhi.', location: 'Old Delhi', type: 'cultural' },
      { title: 'Humayun\'s Tomb', desc: 'The precursor to the Taj Mahal — a stunning Mughal garden tomb and UNESCO World Heritage Site.', location: 'Nizamuddin, Delhi', type: 'cultural' },
      { title: 'Qutub Minar', desc: 'The tallest brick minaret in the world (73m) built in 1192 with intricate carvings.', location: 'Mehrauli', type: 'cultural' },
      { title: 'India Gate & Rashtrapati Bhavan', desc: 'Walk along Rajpath from the war memorial to the stunning Presidential Palace.', location: 'New Delhi', type: 'cultural' },
      { title: 'Hauz Khas Village', desc: 'Trendy urban village with art galleries, boutiques, lakeside ruins, and rooftop bars.', location: 'Hauz Khas', type: 'relaxation' },
      { title: 'Lodhi Art District Walk', desc: 'India\'s first open-air public art district with stunning murals by international street artists.', location: 'Lodhi Colony', type: 'relaxation' },
      { title: 'Jama Masjid', desc: 'India\'s largest mosque built by Shah Jahan in 1656 — climb the minaret for Old Delhi views.', location: 'Old Delhi', type: 'cultural' },
    ],
    foods: [
      { name: 'Chole Bhature at Sita Ram', desc: 'Delhi\'s iconic spiced chickpea curry with fluffy fried bread since 1950 — always a queue!', spot: 'Paharganj', cost: 0.01 },
      { name: 'Butter Chicken at Moti Mahal', desc: 'The restaurant that INVENTED butter chicken and dal makhani in 1947. A pilgrimage for foodies.', spot: 'Daryaganj', cost: 0.04 },
      { name: 'Paratha at Paranthewali Gali', desc: 'A 150-year-old lane with shops serving 40+ stuffed paratha varieties with pickle and curd.', spot: 'Chandni Chowk', cost: 0.01 },
      { name: 'Chaat at Natraj Dahi Bhalle', desc: 'The most famous dahi bhalle in India — crispy, tangy, and perfectly spiced.', spot: 'Chandni Chowk', cost: 0.01 },
      { name: 'Kebabs at Karim\'s', desc: 'Mughlai kebabs and biryani served since 1913, near Jama Masjid. A Delhi food legend.', spot: 'Jama Masjid', cost: 0.03 },
    ],
    hotels: { budget: 'Zostel Delhi', standard: 'The Imperial New Delhi', luxury: 'The Leela Palace' },
    coverImage: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800',
  },

  // ==================== OOTY ====================
  ooty: {
    places: [
      { title: 'Nilgiri Mountain Railway', desc: 'UNESCO Heritage toy train chugging through 16 tunnels, 208 curves, and tea gardens at 7,228 ft.', location: 'Ooty to Coonoor', type: 'cultural' },
      { title: 'Ooty Botanical Gardens', desc: 'A 55-acre garden with 1,000+ plant species, a 20-million-year-old fossilized tree, and a rose garden.', location: 'Ooty Town', type: 'relaxation' },
      { title: 'Doddabetta Peak Viewpoint', desc: 'The highest peak in the Nilgiris (8,650 ft) with a telescope house and panoramic views.', location: 'Doddabetta (10 km)', type: 'adventure' },
      { title: 'Tea Factory Visit', desc: 'Tour a working tea factory, learn the 5-step process, and taste fresh Nilgiri tea blends.', location: 'Coonoor', type: 'cultural' },
      { title: 'Ooty Lake Boating', desc: 'Pedal boat or row boat on the serene artificial lake surrounded by eucalyptus trees.', location: 'Ooty Lake', type: 'relaxation' },
      { title: 'Pykara Waterfalls & Lake', desc: 'Visit the cascading falls and take a motorboat ride on the scenic Pykara Lake.', location: 'Pykara (20 km)', type: 'adventure' },
    ],
    foods: [
      { name: 'Varkey at King Star Bakery', desc: 'Flaky, buttery biscuit unique to Ooty — best paired with hot Nilgiri tea.', spot: 'Commercial Road', cost: 0.01 },
      { name: 'Homemade Chocolate at King\'s Cliff', desc: 'Hand-rolled chocolates in 30+ flavors — Ooty\'s most famous edible souvenir.', spot: 'Charing Cross', cost: 0.02 },
      { name: 'Mutton Biryani at Hyderabad Biryani House', desc: 'Fragrant dum biryani with tender mutton, raita, and salad.', spot: 'Lower Bazaar', cost: 0.03 },
      { name: 'Filter Coffee & Dosa at Shinkow\'s', desc: 'South Indian filter coffee and crispy masala dosa in a 100-year-old Chinese-Indian restaurant.', spot: 'Commissioner\'s Road', cost: 0.02 },
    ],
    hotels: { budget: 'Zostel Ooty', standard: 'Sterling Ooty Elk Hill', luxury: 'Savoy Hotel by ITC' },
    coverImage: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800',
  },

  // ==================== MYSORE ====================
  mysore: {
    places: [
      { title: 'Mysore Palace (Amba Vilas)', desc: 'A stunning Indo-Saracenic palace illuminated by 97,000 bulbs on Sundays — one of India\'s most visited monuments.', location: 'Mysore Palace, City Center', type: 'cultural' },
      { title: 'Chamundi Hills Temple', desc: 'Climb 1,000 steps to the hilltop temple with the 15-ft Nandi Bull statue and panoramic Mysore views.', location: 'Chamundi Hills', type: 'cultural' },
      { title: 'Brindavan Gardens (KRS Dam)', desc: 'Terraced gardens with the famous musical fountain show illuminated in colors at night.', location: 'KRS Dam (19 km)', type: 'relaxation' },
      { title: 'Mysore Zoo', desc: 'One of India\'s oldest and best-maintained zoos with white tigers, gorillas, and rare birds.', location: 'Mysore Zoo', type: 'relaxation' },
      { title: 'Srirangapatna Heritage', desc: 'Explore Tipu Sultan\'s island fortress, summer palace (Daria Daulat Bagh), and his final resting place.', location: 'Srirangapatna (15 km)', type: 'cultural' },
      { title: 'Devaraja Market Walk', desc: 'A 130-year-old bazaar selling Mysore silk, sandalwood, jasmine garlands, and colorful kumkum.', location: 'Devaraja Urs Road', type: 'shopping' },
    ],
    foods: [
      { name: 'Mysore Masala Dosa at Mylari', desc: 'The legendary butter-soaked dosa with a unique potato filling — Mysore\'s most queued restaurant.', spot: 'Nazarbad', cost: 0.01 },
      { name: 'Mysore Pak at Guru Sweet Mart', desc: 'The original ghee-rich gram flour sweet invented in the Mysore Palace kitchens.', spot: 'Sayyaji Rao Road', cost: 0.01 },
      { name: 'Biryani at Hanumanthu Hotel', desc: 'Fragrant Mysorean mutton biryani cooked in a traditional wood-fire pit.', spot: 'Mandi Mohalla', cost: 0.03 },
      { name: 'Filter Coffee at Vinayaka Mylari', desc: 'Strong South Indian filter coffee served in steel tumbler-dabarah — a morning ritual.', spot: 'Nazarbad', cost: 0.005 },
    ],
    hotels: { budget: 'Zostel Mysore', standard: 'Radisson Blu Plaza', luxury: 'Royal Orchid Metropole' },
    coverImage: 'https://images.unsplash.com/photo-1600100397608-61a22df0f91b?w=800',
  },

  // ==================== ANDAMAN ====================
  andaman: {
    places: [
      { title: 'Radhanagar Beach', desc: 'Asia\'s best beach — pristine white sand, turquoise water, and a stunning sunset every single day.', location: 'Havelock Island', type: 'relaxation' },
      { title: 'Scuba Diving at Elephant Beach', desc: 'Dive with vibrant coral reefs, sea turtles, clownfish, and manta rays in crystal-clear waters.', location: 'Havelock Island', type: 'adventure' },
      { title: 'Cellular Jail Sound & Light Show', desc: 'Experience the haunting history of India\'s freedom fighters at this colonial-era prison.', location: 'Port Blair', type: 'cultural' },
      { title: 'Neil Island Cycling Tour', desc: 'Cycle through this tiny island visiting Natural Bridge, Bharatpur Beach, and Laxmanpur sunset point.', location: 'Neil Island', type: 'adventure' },
      { title: 'Ross Island Heritage Walk', desc: 'Explore the ruins of the former British administrative headquarters being reclaimed by nature.', location: 'Ross Island, Port Blair', type: 'cultural' },
      { title: 'Kayaking through Mangroves', desc: 'Paddle through dense mangrove forests spotting exotic birds, mudskippers, and crabs.', location: 'Havelock Island', type: 'adventure' },
      { title: 'Bioluminescence Night Tour', desc: 'Witness the ocean glow electric blue at night as bioluminescent plankton light up with each wave.', location: 'Havelock Island', type: 'adventure' },
    ],
    foods: [
      { name: 'Grilled Lobster at Full Moon Café', desc: 'Fresh-caught lobster grilled with garlic butter, served beachside under the stars.', spot: 'Havelock Island', cost: 0.06 },
      { name: 'Fish Curry Rice at Anju Coco', desc: 'Authentic Andamanese fish curry with coconut milk and steamed rice — simple and divine.', spot: 'Havelock Island', cost: 0.03 },
      { name: 'Prawn Curry at New Lighthouse', desc: 'Spicy local prawn curry with appam — a fusion of South Indian and island cooking.', spot: 'Port Blair', cost: 0.04 },
      { name: 'Coconut Water at the Beach', desc: 'Fresh tender coconut water straight from the tree — the island\'s ultimate refreshment.', spot: 'Any Beach', cost: 0.005 },
    ],
    hotels: { budget: 'Zostel Havelock', standard: 'SeaShell Havelock', luxury: 'Taj Exotica Resort Andamans' },
    coverImage: 'https://images.unsplash.com/photo-1544550581-5f7ceaf7f992?w=800',
  },

  // ==================== DARJEELING ====================
  darjeeling: {
    places: [
      { title: 'Tiger Hill Sunrise', desc: 'Wake at 4 AM to witness the sunrise paint Kanchenjunga (3rd highest peak) in gold and pink.', location: 'Tiger Hill (11 km)', type: 'adventure' },
      { title: 'Darjeeling Himalayan Railway', desc: 'UNESCO Heritage toy train — a 7-hour, 88 km journey through Batasia Loop and dense forests.', location: 'Darjeeling Station', type: 'cultural' },
      { title: 'Happy Valley Tea Estate', desc: 'Tour one of the oldest tea gardens (1854), watch tea processing, and sample first-flush Darjeeling.', location: 'Happy Valley', type: 'cultural' },
      { title: 'Peace Pagoda & Japanese Temple', desc: 'A serene white stupa with gold Buddha statues and panoramic views of the Kanchenjunga range.', location: 'Jalapahar', type: 'relaxation' },
      { title: 'Batasia Loop & War Memorial', desc: 'A spiral railway loop with a Gorkha war memorial garden and 360° mountain views.', location: 'Batasia Loop', type: 'cultural' },
      { title: 'Rock Garden & Ganga Maya Park', desc: 'A terraced garden built on a hillside with waterfalls, rock formations, and flower beds.', location: 'Rock Garden', type: 'relaxation' },
    ],
    foods: [
      { name: 'Momos at Kunga Restaurant', desc: 'The best steamed and fried momos in Darjeeling — must-try pork and cheese varieties.', spot: 'Gandhi Road', cost: 0.02 },
      { name: 'Darjeeling Tea at Glenary\'s', desc: 'First-flush Darjeeling tea with freshly baked scones at this colonial-era bakery since 1911.', spot: 'The Mall', cost: 0.02 },
      { name: 'Thukpa at Dekevas', desc: 'Tibetan noodle soup with vegetables and chicken — perfect comfort food in the cold.', spot: 'Ladenla Road', cost: 0.02 },
      { name: 'Churpi (Yak Cheese) Snack', desc: 'Hard smoked yak cheese — a unique Himalayan snack sold by roadside vendors.', spot: 'Chowrasta', cost: 0.01 },
    ],
    hotels: { budget: 'Zostel Darjeeling', standard: 'Mayfair Darjeeling', luxury: 'Glenburn Tea Estate' },
    coverImage: 'https://images.unsplash.com/photo-1544634076-a90160ddf44e?w=800',
  },

  // ==================== RAJASTHAN (JODHPUR) ====================
  jodhpur: {
    places: [
      { title: 'Mehrangarh Fort', desc: 'One of India\'s largest forts towering 400 ft above the Blue City with lavish palace rooms and ramparts.', location: 'Mehrangarh, Jodhpur', type: 'cultural' },
      { title: 'Blue City Walking Tour', desc: 'Wander through the maze of indigo-painted houses, ancient step wells, and spice markets.', location: 'Old Jodhpur', type: 'cultural' },
      { title: 'Thar Desert Jeep Safari', desc: 'Jeep ride through sand dunes, Bishnoi villages, and spot blackbuck, chinkaras, and migratory birds.', location: 'Thar Desert (30 km)', type: 'adventure' },
      { title: 'Jaswant Thada', desc: 'A stunning white marble cenotaph often called the "Taj Mahal of Marwar" with lake and fort views.', location: 'Near Mehrangarh Fort', type: 'relaxation' },
      { title: 'Zip-lining over Mehrangarh', desc: 'Flying Fox — 6 zip lines over the fort walls, lakes, and Blue City at speeds up to 60 km/h.', location: 'Mehrangarh Fort', type: 'adventure' },
      { title: 'Umaid Bhawan Palace Museum', desc: 'Visit the Art Deco palace (one of world\'s largest private residences) — half is a Taj hotel, half is a museum.', location: 'Umaid Bhawan', type: 'cultural' },
    ],
    foods: [
      { name: 'Mirchi Vada at Shahi Samosa', desc: 'Giant chili stuffed with spiced potato, battered, and deep-fried — Jodhpur\'s signature snack.', spot: 'Nai Sarak', cost: 0.01 },
      { name: 'Laal Maas at On The Rocks', desc: 'Fiery red mutton curry cooked with mathania chilies — Rajasthan\'s most famous non-veg dish.', spot: 'Near Airport', cost: 0.05 },
      { name: 'Makhaniya Lassi at Mishrilal Hotel', desc: 'Thick saffron lassi topped with malai — a Jodhpur legend since 1927.', spot: 'Clock Tower', cost: 0.01 },
      { name: 'Pyaaz ki Kachori at Janta Sweet Home', desc: 'Flaky onion pastry served with tamarind and green chutneys — perfect breakfast.', spot: 'Sojati Gate', cost: 0.01 },
    ],
    hotels: { budget: 'Zostel Jodhpur', standard: 'Ratan Vilas Heritage', luxury: 'Umaid Bhawan Palace by Taj' },
    coverImage: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800',
  },

  // ==================== BANGALORE ====================
  bangalore: {
    places: [
      { title: 'Lalbagh Botanical Garden', desc: 'A 240-acre garden with a glass house, 1000+ plant species, and a 3-billion-year-old rock formation.', location: 'Lalbagh, Bangalore', type: 'relaxation' },
      { title: 'Nandi Hills Sunrise Drive', desc: 'Drive up to 4,851 ft for breathtaking sunrise views above the cloud line — Bangalore\'s favorite getaway.', location: 'Nandi Hills (60 km)', type: 'adventure' },
      { title: 'Bangalore Palace', desc: 'A Tudor-style palace inspired by Windsor Castle, with fortified towers and beautiful woodcarvings.', location: 'Vasanth Nagar', type: 'cultural' },
      { title: 'MG Road & Brigade Road Walk', desc: 'Shopping, pubs, street performers, and bookstores on Bangalore\'s most iconic streets.', location: 'MG Road', type: 'shopping' },
      { title: 'ISKCON Temple', desc: 'One of the largest ISKCON temples in the world with stunning architecture and cultural exhibitions.', location: 'Rajajinagar', type: 'cultural' },
      { title: 'Craft Beer Trail', desc: 'Visit 3-4 of Bangalore\'s famous microbreweries — Toit, Arbor, Windmills — for fresh craft beer.', location: 'Indiranagar / Koramangala', type: 'relaxation' },
    ],
    foods: [
      { name: 'Masala Dosa at Vidyarthi Bhavan', desc: 'Crispy buttery dosa since 1943 — Bangalore\'s most iconic breakfast with a 30-min queue.', spot: 'Gandhi Bazaar, Basavanagudi', cost: 0.01 },
      { name: 'Biryani at Meghana Foods', desc: 'Andhra-style biryani with boneless chicken — Bangalore\'s most popular biryani chain.', spot: 'Multiple Outlets', cost: 0.02 },
      { name: 'Craft Beer at Toit Brewpub', desc: 'India\'s most awarded brewpub — try the Basmati Blonde and Tintin Toit IPA with pizza.', spot: 'Indiranagar', cost: 0.04 },
      { name: 'Filter Coffee at Brahmin\'s Coffee Bar', desc: 'Standing-only café serving idli-vada and the strongest filter coffee in town since 1965.', spot: 'Shankarapuram', cost: 0.005 },
    ],
    hotels: { budget: 'Zostel Bangalore', standard: 'Taj MG Road', luxury: 'The Leela Palace Bangalore' },
    coverImage: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=800',
  },

  // ==================== CHENNAI ====================
  chennai: {
    places: [
      { title: 'Marina Beach Walk', desc: 'Walk along India\'s longest urban beach (13 km), enjoy horse rides, street food, and sunrise.', location: 'Marina Beach', type: 'relaxation' },
      { title: 'Kapaleeshwarar Temple', desc: 'Stunning Dravidian-style temple from the 7th century with a towering 37m gopuram (gateway tower).', location: 'Mylapore', type: 'cultural' },
      { title: 'Mahabalipuram Day Trip', desc: 'UNESCO shore temples, Arjuna\'s Penance rock relief, and the Five Rathas — 7th-century Pallava masterpieces.', location: 'Mahabalipuram (58 km)', type: 'cultural' },
      { title: 'San Thome Basilica', desc: 'A neo-Gothic church built over the tomb of Apostle St. Thomas — one of only 3 basilicas in the world over an apostle\'s tomb.', location: 'San Thome, Mylapore', type: 'cultural' },
      { title: 'Government Museum', desc: 'India\'s second-oldest museum with bronze galleries, archaeological finds, and a natural history section.', location: 'Egmore', type: 'cultural' },
      { title: 'DakshinaChitra Heritage Village', desc: 'Living museum with 18 traditional homes from Tamil Nadu, Kerala, Karnataka, and Andhra Pradesh.', location: 'ECR (25 km)', type: 'cultural' },
    ],
    foods: [
      { name: 'Idli-Sambar at Murugan Idli Shop', desc: 'Soft-as-cloud idlis with 5 varieties of chutney and filter coffee — a Chennai institution.', spot: 'T. Nagar', cost: 0.01 },
      { name: 'Chettinad Chicken at Ponnusamy', desc: 'Fiery Chettinad pepper chicken with hot appam — the best non-veg in Chennai.', spot: 'T. Nagar', cost: 0.03 },
      { name: 'Filter Coffee at Sangeetha', desc: 'Thick frothy filter kaapi in steel tumbler — the authentic South Indian coffee experience.', spot: 'Multiple Outlets', cost: 0.005 },
      { name: 'Kothu Parotta at Hotel Saravana Bhavan', desc: 'Shredded layered parotta tossed with egg, chicken, and spices — Chennai\'s favorite midnight snack.', spot: 'Triplicane', cost: 0.02 },
    ],
    hotels: { budget: 'Zostel Chennai', standard: 'GRT Grand', luxury: 'ITC Grand Chola' },
    coverImage: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800',
  },

  // ==================== HYDERABAD ====================
  hyderabad: {
    places: [
      { title: 'Charminar & Laad Bazaar', desc: 'Climb the 400-year-old monument\'s minarets, then shop for lac bangles and pearls in the bazaar below.', location: 'Charminar, Old City', type: 'cultural' },
      { title: 'Golconda Fort Sound & Light Show', desc: 'Explore the massive fort where a handclap at the gate can be heard 1 km away at the top.', location: 'Golconda (11 km)', type: 'cultural' },
      { title: 'Ramoji Film City', desc: 'World\'s largest film studio complex with live shows, sets, and Bollywood experiences.', location: 'Ramoji (30 km)', type: 'relaxation' },
      { title: 'Salar Jung Museum', desc: 'One of India\'s finest museums with Mughal art, European paintings, and a famous Veiled Rebecca sculpture.', location: 'Near Musi River', type: 'cultural' },
      { title: 'Hussain Sagar Lake Evening', desc: 'Boat ride to the 16m tall Buddha statue in the middle of the lake, followed by Eat Street.', location: 'Tank Bund', type: 'relaxation' },
      { title: 'HITEC City Walk', desc: 'Explore Hyderabad\'s modern tech hub with shopping malls, gaming zones, and nightlife.', location: 'HITEC City', type: 'shopping' },
    ],
    foods: [
      { name: 'Biryani at Paradise', desc: 'Hyderabad\'s most legendary biryani — aromatic basmati with tender goat meat in dum-cooked perfection.', spot: 'Secunderabad', cost: 0.03 },
      { name: 'Haleem at Pista House', desc: 'Slow-cooked wheat and mutton stew, best during Ramadan — awarded GI tag. Rich and divine.', spot: 'Charminar', cost: 0.02 },
      { name: 'Irani Chai & Osmania Biscuit at Nimrah', desc: 'Sweet milky chai with crumbly cardamom biscuit — the iconic Hyderabadi café ritual since 1993.', spot: 'Charminar', cost: 0.01 },
      { name: 'Double Ka Meetha at Shah Ghouse', desc: 'Hyderabadi bread pudding soaked in saffron milk and topped with dry fruits.', spot: 'Tolichowki', cost: 0.02 },
    ],
    hotels: { budget: 'Zostel Hyderabad', standard: 'ITC Kohenur', luxury: 'Taj Falaknuma Palace' },
    coverImage: 'https://images.unsplash.com/photo-1572524279801-cbf6293c47a3?w=800',
  },

  // ==================== KOLKATA ====================
  kolkata: {
    places: [
      { title: 'Victoria Memorial', desc: 'Stunning white marble hall built for Queen Victoria — now a museum with 28,394 artifacts and 25 galleries.', location: 'Maidan', type: 'cultural' },
      { title: 'Howrah Bridge & Flower Market', desc: 'Walk across the iconic cantilever bridge at sunrise, then explore the chaotic Mallick Ghat flower market.', location: 'Howrah', type: 'cultural' },
      { title: 'Kumartuli Potter\'s Colony', desc: 'Watch artisans sculpt magnificent clay idols of Durga and other deities for festivals.', location: 'Kumartuli', type: 'cultural' },
      { title: 'College Street Book Market', desc: 'The world\'s largest secondhand book market — miles of stalls selling rare books and first editions.', location: 'College Street', type: 'cultural' },
      { title: 'Indian Museum', desc: 'India\'s oldest and largest museum (1814) with Egyptian mummies, Gandhara sculptures, and meteorites.', location: 'Park Street', type: 'cultural' },
      { title: 'Park Street Evening', desc: 'Dine, drink, and listen to live jazz at Kolkata\'s most famous nightlife strip.', location: 'Park Street', type: 'relaxation' },
    ],
    foods: [
      { name: 'Kathi Roll at Nizam\'s', desc: 'The original kathi roll inventors since 1932 — flaky paratha wrapped around spiced kebabs.', spot: 'New Market', cost: 0.01 },
      { name: 'Rosogolla at K.C. Das', desc: 'The birthplace of Bengal\'s iconic spongy sweet — soft, syrupy, and life-changing.', spot: 'Esplanade', cost: 0.01 },
      { name: 'Mughlai Paratha at Golbari', desc: 'Egg-stuffed fried bread with spiced meat filling — a North Kolkata breakfast legend since 1923.', spot: 'Dalhousie', cost: 0.02 },
      { name: 'Mishti Doi & Sandesh at Balaram Mullick', desc: 'Sweetened yogurt in clay pots and Bengal\'s finest milk-based sandesh sweets.', spot: 'Bhowanipore', cost: 0.01 },
      { name: 'Puchka at Vivekananda Park', desc: 'Kolkata\'s superior version of golgappa — crispier, tangier, and served with tamarind water.', spot: 'Southern Avenue', cost: 0.005 },
    ],
    hotels: { budget: 'Zostel Kolkata', standard: 'The Oberoi Grand', luxury: 'Taj Bengal' },
    coverImage: 'https://images.unsplash.com/photo-1558431382-27e303142255?w=800',
  },

  // ==================== AMRITSAR ====================
  amritsar: {
    places: [
      { title: 'Golden Temple (Harmandir Sahib)', desc: 'The holiest Sikh shrine — a stunning gold-plated temple reflecting in the sacred Amrit Sarovar pool.', location: 'Golden Temple Complex', type: 'cultural' },
      { title: 'Wagah Border Ceremony', desc: 'The electrifying daily flag-lowering ceremony with synchronized drill, patriotic chanting, and pageantry.', location: 'Wagah Border (28 km)', type: 'cultural' },
      { title: 'Jallianwala Bagh Memorial', desc: 'The poignant memorial garden where 1,000+ civilians were massacred by British troops in 1919.', location: 'Near Golden Temple', type: 'cultural' },
      { title: 'Partition Museum', desc: 'India\'s first museum dedicated to the 1947 Partition — deeply moving personal stories and artifacts.', location: 'Town Hall', type: 'cultural' },
      { title: 'Langar at Golden Temple', desc: 'Experience the world\'s largest free community kitchen feeding 100,000+ people daily — volunteer or eat!', location: 'Golden Temple Complex', type: 'cultural' },
    ],
    foods: [
      { name: 'Amritsari Kulcha at Bharawan Da Dhaba', desc: 'Crispy stuffed kulcha with chole and imli chutney — the city\'s most iconic dish since 1912.', spot: 'Near Town Hall', cost: 0.01 },
      { name: 'Lassi at Ahuja Lassi', desc: 'Giant glasses of creamy thick lassi topped with malai — best consumed standing at the counter.', spot: 'Near Golden Temple', cost: 0.01 },
      { name: 'Fish Fry at Makhan Fish Corner', desc: 'Crispy Amritsari fish fry marinated in ajwain and spices — a legendary street food experience.', spot: 'Majitha Road', cost: 0.02 },
      { name: 'Phirni at A-One Phirni', desc: 'Cold rice pudding in clay pots topped with pistachios and saffron — the perfect Amritsar dessert.', spot: 'Lawrence Road', cost: 0.01 },
    ],
    hotels: { budget: 'Zostel Amritsar', standard: 'Hyatt Amritsar', luxury: 'Taj Swarna Amritsar' },
    coverImage: 'https://images.unsplash.com/photo-1587899897387-091ebd01a0e2?w=800',
  },

  // ==================== PONDICHERRY ====================
  pondicherry: {
    places: [
      { title: 'Auroville Matrimandir', desc: 'Visit the golden sphere meditation center in the universal township — book passes in advance.', location: 'Auroville (12 km)', type: 'cultural' },
      { title: 'French Quarter Walk', desc: 'Stroll through pastel-colored colonial streets, bougainvillea-draped balconies, and artisan boutiques.', location: 'White Town', type: 'relaxation' },
      { title: 'Promenade Beach Sunrise', desc: 'Walk along the 1.5 km seafront promenade with the Gandhi statue, war memorial, and lighthouse.', location: 'Beach Road', type: 'relaxation' },
      { title: 'Paradise Beach by Boat', desc: 'Ferry to a secluded beach — turquoise water, golden sand, and almost no crowds.', location: 'Chunnambar (8 km)', type: 'adventure' },
      { title: 'Sri Aurobindo Ashram', desc: 'Peaceful visit to the spiritual community and the samadhi of Sri Aurobindo and The Mother.', location: 'Marine Street', type: 'cultural' },
      { title: 'Serenity Beach Surfing', desc: 'Take a beginner\'s surf lesson at Pondicherry\'s most popular surfing spot.', location: 'Serenity Beach', type: 'adventure' },
    ],
    foods: [
      { name: 'Croissant at Baker Street', desc: 'Flaky, buttery French croissants and pain au chocolat — Pondy\'s best French bakery.', spot: 'Bussy Street', cost: 0.02 },
      { name: 'Crepes at Café des Arts', desc: 'Sweet and savory French crepes in a charming courtyard café in the French Quarter.', spot: 'Suffren Street', cost: 0.03 },
      { name: 'Thali at Surguru', desc: 'Unlimited South Indian banana leaf thali with sambar, rasam, kootu, and payasam.', spot: 'Mission Street', cost: 0.02 },
      { name: 'Seafood at Le Club', desc: 'French-Tamil fusion seafood with wine, overlooking the Bay of Bengal at sunset.', spot: 'Dumas Street', cost: 0.06 },
    ],
    hotels: { budget: 'Zostel Pondicherry', standard: 'La Villa Pondicherry', luxury: 'Palais de Mahé' },
    coverImage: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800',
  },

  // ==================== MEGHALAYA / SHILLONG ====================
  meghalaya: {
    places: [
      { title: 'Living Root Bridges Trek', desc: 'Hike to the famous double-decker root bridge in Nongriat — a living, growing natural wonder made by the Khasi people.', location: 'Cherrapunji / Nongriat', type: 'adventure' },
      { title: 'Dawki River (Umngot)', desc: 'Boat ride on India\'s clearest river — boats appear to float in mid-air over the crystal-clear water.', location: 'Dawki, India-Bangladesh Border', type: 'adventure' },
      { title: 'Nohkalikai Falls', desc: 'India\'s tallest plunge waterfall (1,115 ft) — a thundering cascade into a turquoise pool below.', location: 'Cherrapunji', type: 'adventure' },
      { title: 'Mawlynnong (Cleanest Village)', desc: 'Asia\'s cleanest village with living root bridges, sky walk, and beautifully maintained gardens.', location: 'Mawlynnong', type: 'cultural' },
      { title: 'Elephant Falls', desc: 'A 3-tiered waterfall surrounded by dense tropical forest — easy access from Shillong.', location: 'Upper Shillong', type: 'relaxation' },
      { title: 'Laitlum Canyons', desc: 'Standing at the edge of a dramatic canyon with misty views stretching endlessly — Meghalaya\'s Grand Canyon.', location: 'Laitlum (25 km from Shillong)', type: 'adventure' },
    ],
    foods: [
      { name: 'Jadoh at Trattoria', desc: 'Khasi red rice cooked with pork — Meghalaya\'s signature comfort dish.', spot: 'Police Bazaar, Shillong', cost: 0.02 },
      { name: 'Pork Momos at ML 05 Café', desc: 'Juicy pork dumplings with fiery Naga chili chutney — a Northeast specialty.', spot: 'Laitumkhrah, Shillong', cost: 0.02 },
      { name: 'Tungrymbai at City Hut', desc: 'Fermented soybean curry — a unique umami-rich Khasi dish you won\'t find elsewhere.', spot: 'Shillong', cost: 0.02 },
      { name: 'Chai & Puri at Dylan\'s Café', desc: 'Bob Dylan-themed café with great chai, live music, and a bookshelf — Shillong\'s indie heart.', spot: 'Laitumkhrah', cost: 0.01 },
    ],
    hotels: { budget: 'Zostel Shillong', standard: 'Ri Kynjai Resort', luxury: 'Vivanta Meghalaya' },
    coverImage: 'https://images.unsplash.com/photo-1598091383021-15ddea10925d?w=800',
  },

  // ==================== KASHMIR / SRINAGAR ====================
  kashmir: {
    places: [
      { title: 'Shikara Ride on Dal Lake', desc: 'Glide on the iconic "Venice of the East" past floating gardens, houseboats, and Mughal terraces.', location: 'Dal Lake, Srinagar', type: 'relaxation' },
      { title: 'Mughal Gardens', desc: 'Visit Shalimar Bagh, Nishat Bagh, and Chashme Shahi — terraced Persian gardens built by Mughal emperors.', location: 'Srinagar', type: 'cultural' },
      { title: 'Gulmarg Gondola & Skiing', desc: 'Ride Asia\'s highest cable car to 14,000 ft for skiing, snowboarding, or stunning Alpine views.', location: 'Gulmarg (50 km)', type: 'adventure' },
      { title: 'Pahalgam Valley Trek', desc: 'Trek through pine forests, along the Lidder River, to the stunning Betaab Valley and Aru Valley.', location: 'Pahalgam (90 km)', type: 'adventure' },
      { title: 'Floating Market (Morning)', desc: 'Wake early to see the floating vegetable market on Dal Lake — vendors in shikaras selling fresh produce.', location: 'Dal Lake', type: 'cultural' },
      { title: 'Shankaracharya Temple', desc: 'Ancient hilltop temple at 1,000 ft offering the best panoramic views of Srinagar and Dal Lake.', location: 'Shankaracharya Hill', type: 'cultural' },
    ],
    foods: [
      { name: 'Wazwan at Ahdoo\'s', desc: 'Grand Kashmiri multi-course feast — Rogan Josh, Gushtaba, Yakhni — served on a shared plate (trami).', spot: 'Residency Road, Srinagar', cost: 0.06 },
      { name: 'Kashmiri Noon Chai', desc: 'Pink salt tea with cream and crushed almonds — a unique Kashmiri ritual served in samovars.', spot: 'Any local teahouse', cost: 0.01 },
      { name: 'Dum Aloo at Mughal Darbar', desc: 'Kashmiri-style baby potatoes in rich yogurt gravy with fennel and dry ginger.', spot: 'Residency Road', cost: 0.03 },
      { name: 'Rogan Josh at Shamyana', desc: 'Slow-cooked lamb in aromatic Kashmiri spices — the most iconic dish of the Valley.', spot: 'Boulevard Road', cost: 0.05 },
    ],
    hotels: { budget: 'Zostel Srinagar', standard: 'Houseboat on Dal Lake', luxury: 'The Lalit Grand Palace' },
    coverImage: 'https://images.unsplash.com/photo-1597074866923-dc0589150458?w=800',
  },
};
