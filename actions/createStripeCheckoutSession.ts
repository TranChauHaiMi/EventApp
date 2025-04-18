"use server";

import { stripe } from "@/lib/stripe";
import { getConvexClient } from "@/lib/convex";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import baseUrl from "@/lib/baseUrl";
import { auth } from "@clerk/nextjs/server";
import { DURATIONS } from "@/convex/constants";

export type StripeCheckoutMetaData = {
    eventId: Id<"events">;
    userId: string;
    waitingListId: Id<"waitingList">;
};

export async function createStripeCheckoutSession({
    eventId,
}: {
    eventId: Id<"events">;
}) {
    const { userId } = await auth();
    if (!userId) throw new Error("Chưa xác thực");

    const convex = getConvexClient();

    // Get event details
    const event = await convex.query(api.events.getById, { eventId });
    if (!event) throw new Error("Không tìm thấy sự kiện");

    // Get waiting list entry
    const queuePosition = await convex.query(api.waitingList.getQueuePosition, {
        eventId,
        userId,
    });

    if (!queuePosition || queuePosition.status !== "offered") {
        throw new Error("Không tìm thấy đặt vé hợp lệ");
    }

    const stripeConnectId = await convex.query(
        api.users.getUsersStripeConnectId,
        {
        userId: event.userId,
        }
    );

    if (!stripeConnectId) {
        throw new Error("Không tìm thấy Stripe Connect ID cho chủ sở hữu sự kiện!");
    }

    if (!queuePosition.offerExpiresAt) {
        throw new Error("Phiếu đặt vé không có ngày hết hạn");
    }

    const metadata: StripeCheckoutMetaData = {
        eventId,
        userId,
        waitingListId: queuePosition._id,
    };

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create(
        {
        payment_method_types: ["card"],
        line_items: [
            {
            price_data: {
                currency: "vnd",
                product_data: {
                name: event.name,
                description: event.description,
                },
                unit_amount: Math.round(event.price), 
            },
            quantity: 1,
            },
        ],
        payment_intent_data: {
            application_fee_amount: Math.round(event.price * 0.01), // 1% fee
        },
        expires_at: Math.floor(Date.now() / 1000) + DURATIONS.TICKET_OFFER / 1000, // 30 minutes (stripe checkout minimum expiration time)
        mode: "payment",
        success_url: `${baseUrl}/tickets/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/event/${eventId}`,
        metadata,
        },
        {
        stripeAccount: stripeConnectId, //Stripe Connect ID for the event owner (Seller)
        }
    );

    return { sessionId: session.id, sessionUrl: session.url };
}