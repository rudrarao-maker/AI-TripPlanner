import { clerkClient } from "@clerk/express";
async function test() {
  const users = await clerkClient.users.getUserList({ limit: 1 });
  console.log(users.data[0].emailAddresses);
}
test();
