"use client";

import { useDrag, useDrop } from "react-dnd";
import { Clock, User, Move, Repeat } from "lucide-react";

const ItemTypes = {
  BOOKING: "booking",
};

interface Booking {
  id: string;
  resourceId: string;
  userId: string;
  timeBlockId: string;
  date: string;
  purpose: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  isRecurring?: boolean;
  resource: {
    name: string;
    type: string;
    category: string;
    location: string;
  };
  timeBlock: {
    startTime: string;
    endTime: string;
    label: string;
  };
  user: {
    name: string;
    email: string;
    role: string;
  };
}

interface DraggableBookingProps {
  booking: Booking;
  onEdit: (booking: Booking) => void;
}

export function DraggableBooking({ booking, onEdit }: DraggableBookingProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.BOOKING,
    item: { booking },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className={`cursor-move ${isDragging ? "opacity-50" : ""}`}
      onClick={() => onEdit(booking)}
    >
      <div
        className={`p-2 rounded-md text-xs border-l-4 hover:shadow-md transition-shadow ${
          booking.status === "confirmed"
            ? "bg-green-50 border-green-400 text-green-800"
            : booking.status === "pending"
            ? "bg-yellow-50 border-yellow-400 text-yellow-800"
            : booking.status === "cancelled"
            ? "bg-red-50 border-red-400 text-red-800"
            : "bg-blue-50 border-blue-400 text-blue-800"
        }`}
      >
        <div className="flex items-center gap-1 mb-1">
          <Move className="h-3 w-3" />
          <span className="font-medium">{booking.resource.name}</span>
          {booking.isRecurring && <Repeat className="h-3 w-3" />}
        </div>
        <div className="flex items-center gap-1 text-xs">
          <Clock className="h-3 w-3" />
          <span>
            {booking.timeBlock.startTime} - {booking.timeBlock.endTime}
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs mt-1">
          <User className="h-3 w-3" />
          <span>{booking.user.name}</span>
        </div>
      </div>
    </div>
  );
}

interface DropTargetProps {
  date: Date;
  timeBlockId?: string;
  resourceId?: string;
  onDrop: (
    booking: Booking,
    newDate: Date,
    newTimeBlockId?: string,
    newResourceId?: string
  ) => void;
  children: React.ReactNode;
}

export function DropTarget({
  date,
  timeBlockId,
  resourceId,
  onDrop,
  children,
}: DropTargetProps) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemTypes.BOOKING,
    drop: (item: { booking: Booking }) => {
      onDrop(item.booking, date, timeBlockId, resourceId);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  return (
    <div
      ref={drop}
      className={`min-h-[80px] ${
        isOver ? "bg-blue-100 border-2 border-blue-300 border-dashed" : ""
      }`}
    >
      {children}
    </div>
  );
}

export { ItemTypes };
