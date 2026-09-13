import { MessageCircle } from "lucide-react";

/**
 * PLACEHOLDER: replace with the real WhatsApp business number,
 * e.g. https://wa.me/233XXXXXXXXX
 */
const WHATSAPP_URL = "#whatsapp-number-placeholder";

export function WhatsAppButton() {
  return (
    <a
      href={WHATSAPP_URL}
      aria-label="Chat with us on WhatsApp"
      className="fixed right-4 bottom-20 z-30 grid size-11 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 lg:bottom-6"
    >
      <MessageCircle className="size-[1.15rem]" aria-hidden="true" />
    </a>
  );
}
