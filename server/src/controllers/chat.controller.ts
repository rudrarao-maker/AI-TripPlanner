import { Request, Response } from 'express';
import { sendSuccess } from '../utils/response';

export const chatWithAI = async (req: Request, res: Response) => {
  const { message } = req.body;
  
  // Simulate AI latency
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  let reply = "I'm your AI travel assistant! How can I help you plan your next adventure?";
  
  if (message.toLowerCase().includes('goa')) {
    reply = "Goa is a fantastic choice! The best time to visit is from November to February when the weather is cool and pleasant. Would you like me to find some beachfront resorts?";
  } else if (message.toLowerCase().includes('budget')) {
    reply = "I can help you optimize your travel budget. For a 5-day trip, adjusting your hotel category from 4-star to 3-star could save you around ₹15,000.";
  }

  sendSuccess(res, 200, { reply });
};


