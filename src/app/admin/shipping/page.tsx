import { redirect } from "next/navigation";

// Shipping is now a tab inside the main dashboard — one page, no more switching.
export default function ShippingRedirect() {
  redirect("/admin");
}
