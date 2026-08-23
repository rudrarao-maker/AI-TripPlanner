export const safeUserSelect = {
  id: true,
  name: true,
  avatar: true,
  email: true, // Only if emails should be public to collaborators
  clerkId: false,
  stripeCustomerId: false,
  stripeSubscriptionId: false,
};
