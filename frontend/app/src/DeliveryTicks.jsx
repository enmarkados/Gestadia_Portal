import React from "react";
import { Check, CheckCheck } from "lucide-react";
export default function DeliveryTicks({ receipt }) {
  if (!receipt || !["sent", "received", "read"].includes(receipt.delivery_status)) return null;
  const status = receipt.delivery_status;
  const label = status === "read" ? "Leído por Gestadia" : status === "received"
    ? receipt.received_by === "agent" ? "Recibido por LidIA" : "Recibido por Gestadia"
    : "Enviado a Gestadia";
  const Icon = status === "sent" ? Check : CheckCheck;
  return <span className={`delivery-ticks ${status}`} role="img" aria-label={label} title={label}>
    <Icon size={17} strokeWidth={2} aria-hidden="true" />
  </span>;
}
