import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'admin@tripcraft.ai' },
    update: {
      password: hashedPassword,
      role: 'admin',
    },
    create: {
      email: 'admin@tripcraft.ai',
      name: 'Admin User',
      password: hashedPassword,
      role: 'admin',
      verified: true
    },
  });

  console.log(`Created user: ${user.name}`);

  // Seed Hotels
  await prisma.hotel.create({
    data: {
      name: 'Ayana Resort',
      description: 'Luxury resort perched on limestone cliffs',
      location: 'Jimbaran, Bali',
      address: 'Jl. Karang Mas Sejahtera',
      lat: -8.7844,
      lng: 115.1581,
      rating: 4.8,
      reviewCount: 2450,
      pricePerNight: 22000,
      starRating: 5,
      amenities: JSON.stringify(['Pool', 'Spa', 'Wifi', 'Beachfront']),
      images: JSON.stringify(['https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800']),
    }
  });

  // Seed Restaurants
  await prisma.restaurant.create({
    data: {
      name: 'Locavore',
      description: 'Modern European-Indonesian cuisine',
      cuisine: JSON.stringify(['Fine Dining', 'Indonesian']),
      location: 'Ubud, Bali',
      address: 'Jl. Dewesita No. 10',
      lat: -8.5085,
      lng: 115.2631,
      rating: 4.9,
      reviewCount: 1200,
      priceRange: '$$$$',
      openingHours: '12:00 PM - 10:00 PM',
      images: JSON.stringify(['https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800']),
    }
  });

  // Seed Attractions
  await prisma.attraction.create({
    data: {
      name: 'Uluwatu Temple',
      description: 'Ancient sea temple perched on a steep cliff with stunning sunset views.',
      category: 'Temple',
      location: 'Uluwatu',
      address: 'Pecatu, South Kuta, Badung Regency, Bali',
      lat: -8.8291,
      lng: 115.0849,
      rating: 4.7,
      reviewCount: 3200,
      entryFee: 150,
      timings: '07:00 - 19:00',
      duration: '2-3 hours',
      images: JSON.stringify(['https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=800']),
    },
  });

  // Seed Transport
  await prisma.transport.create({
    data: {
      provider: 'Emirates',
      type: 'flight',
      departureTime: new Date(Date.now() + 86400000 * 5), // 5 days from now
      arrivalTime: new Date(Date.now() + 86400000 * 5 + 3600000 * 8), // 8 hour flight
      duration: '8h 00m',
      origin: 'Mumbai (BOM)',
      destination: 'Bali (DPS)',
      price: 25000,
      currency: 'INR',
      comfortLevel: 'economy',
      images: JSON.stringify(['https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800'])
    }
  });

  await prisma.transport.create({
    data: {
      provider: 'Singapore Airlines',
      type: 'flight',
      departureTime: new Date(Date.now() + 86400000 * 5 + 3600000 * 2), // 5 days from now
      arrivalTime: new Date(Date.now() + 86400000 * 5 + 3600000 * 11), // 9 hour flight
      duration: '9h 00m',
      origin: 'Mumbai (BOM)',
      destination: 'Bali (DPS)',
      price: 32000,
      currency: 'INR',
      comfortLevel: 'premium economy',
      images: JSON.stringify(['https://images.unsplash.com/photo-1542296332-2e4473faf563?w=800'])
    }
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
