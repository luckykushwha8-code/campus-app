import { ShoppingBag } from "lucide-react";
import { ComingSoonPage } from "@/components/utilities/coming-soon-page";

export default function MarketplacePage() {
  return (
    <ComingSoonPage
      eyebrow="Buy & Sell"
      title="Marketplace will open when listings are fully real"
      description="This feature needs real item creation, image storage, moderation, and seller ownership before students can trust it for real transactions. We are keeping it out of the main experience until it reaches that standard."
      icon={ShoppingBag}
      highlights={[
        "Listing creation and editing are not finished yet.",
        "Product images still need proper media storage and moderation.",
        "Real campus buying flow needs safer user-to-user handling before launch.",
      ]}
    />
  );
}
