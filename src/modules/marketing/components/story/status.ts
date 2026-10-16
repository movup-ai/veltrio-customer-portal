/** The booking statuses the story passes through, as the company portal names them. */
export type BookingStatusKey =
  "pending" | "confirmed" | "ready" | "onRental" | "completed";

/** Each status in its portal colours: a tinted chip, a solid rule or dot, and plain text. */
export const STATUS_STYLE: Record<
  BookingStatusKey,
  { chip: string; solid: string; text: string }
> = {
  pending: {
    chip: "bg-status-pending-soft text-status-pending",
    solid: "bg-status-pending",
    text: "text-status-pending",
  },
  confirmed: {
    chip: "bg-status-confirmed-soft text-status-confirmed",
    solid: "bg-status-confirmed",
    text: "text-status-confirmed",
  },
  ready: {
    chip: "bg-status-ready-soft text-status-ready",
    solid: "bg-status-ready",
    text: "text-status-ready",
  },
  onRental: {
    chip: "bg-status-rental-soft text-status-rental",
    solid: "bg-status-rental",
    text: "text-status-rental",
  },
  completed: {
    chip: "bg-status-completed-soft text-status-completed",
    solid: "bg-status-completed",
    text: "text-status-completed",
  },
};
