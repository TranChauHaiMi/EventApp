"use client";

import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import SellerEventCard from "./SellerEventCard";

function SellerEventList() {
  const { user } = useUser();
  const events = useQuery(api.events.getSellerEvents, {
    userId: user?.id ?? "",
  });

  if (!events) return null;

  const upcomingEvents = events.filter((e) => e.eventDate > Date.now());
  const pastEvents = events.filter((e) => e.eventDate <= Date.now());


    
  return (
    <div className="mx-auto space-y-8">
      {/* Upcoming Events */}
      <div>
        <h2 className="text-2xl font-bold text-pink-700 mb-4">
          Sự kiện sắp diễn ra
        </h2>
        <div className="grid grid-cols-1 gap-6">
          {upcomingEvents.map((event) => (
            <SellerEventCard key={event._id} event={event} />
          ))}
          {upcomingEvents.length === 0 && (
            <p className="text-gray-500">Không có sự kiện nào sắp diễn ra</p>
          )}
        </div>
      </div>

      {/* Past Events */}
      {pastEvents.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-pink-700 mb-4">Sự kiện đã diễn ra</h2>
          <div className="grid grid-cols-1 gap-6">
            {pastEvents.map((event) => (
              <SellerEventCard key={event._id} event={event} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default SellerEventList

