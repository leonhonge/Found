export type SubmittedTicket = {
  id: string;
  category: string;
  description: string;
  lostAt: string;
  location: string;
  photoUri: string | null;
  submittedAt: string;
};

let tickets: SubmittedTicket[] = [];
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

export function getTickets(): SubmittedTicket[] {
  return tickets;
}

export function addTicket(
  ticket: Omit<SubmittedTicket, "id" | "submittedAt">,
): SubmittedTicket {
  const next: SubmittedTicket = {
    ...ticket,
    id: `${Date.now()}`,
    submittedAt: new Date().toISOString(),
  };
  tickets = [next, ...tickets];
  notify();
  return next;
}

export function subscribeTickets(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
