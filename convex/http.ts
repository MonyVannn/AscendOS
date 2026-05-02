import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { Webhook } from "svix";

const http = httpRouter();

http.route({
  path: "/clerk",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const payloadString = await request.text();
    const headerPayload = request.headers;

    try {
      const svixHeaders = {
        "svix-id": headerPayload.get("svix-id")!,
        "svix-timestamp": headerPayload.get("svix-timestamp")!,
        "svix-signature": headerPayload.get("svix-signature")!,
      };

      const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || "");
      const evt = wh.verify(payloadString, svixHeaders) as any;

      const { id } = evt.data;
      const eventType = evt.type;

      if (eventType === "user.created" || eventType === "user.updated") {
        await ctx.runMutation(internal.users.upsertFromClerk, {
          data: {
            id: evt.data.id,
            email: evt.data.email_addresses?.[0]?.email_address,
          },
        });
      }

      if (eventType === "user.deleted") {
        await ctx.runMutation(internal.users.deleteFromClerk, {
          data: {
            id: evt.data.id,
          },
        });
      }

      return new Response("Webhook processed successfully", {
        status: 200,
      });
    } catch (err) {
      console.error("Error verifying webhook:", err);
      return new Response("Error occured", {
        status: 400,
      });
    }
  }),
});

export default http;
