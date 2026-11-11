export type SubmittedAdminTicket = {
  id: string;
  category: string;
  description: string;
  lostAt: string;
  location: string;
  photoUri: string | null;
  submittedAt: string;
};

export type SubmittedClientTicket = {
  id: string;
  category: string;
  description: string;
  lostAt: string;
  location: string;
  submittedAt: string;
};

let tickets: SubmittedAdminTicket[] = [];
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

export function getTickets(): SubmittedAdminTicket[] {
  return tickets;
}

let clientTickets: SubmittedClientTicket[] = [];
const clientListeners = new Set<() => void>();

function clientNotify() {
  clientListeners.forEach((listener) => listener());
}

export function getClientTickets(): SubmittedClientTicket[] {
  return tickets;
}

export function addAdminTicket(
  ticket: Omit<SubmittedAdminTicket, "id" | "submittedAt">,
): SubmittedAdminTicket {
  const next: SubmittedAdminTicket = {
    ...ticket,
    id: `${Date.now()}`,
    submittedAt: new Date().toISOString(),
  };
  tickets = [next, ...tickets];
  notify();
  return next;
}

export function addClientTicket(
  ticket: Omit<SubmittedClientTicket, "id" | "submittedAt">,
): SubmittedClientTicket {
  const next: SubmittedClientTicket = {
    ...ticket,
    id: `${Date.now()}`,
    submittedAt: new Date().toISOString(),
  };
  clientTickets = [next, ...clientTickets];
  notify();
  return next;
}

export function subscribeTickets(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
