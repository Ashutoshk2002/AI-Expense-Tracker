import {
  UtensilsCrossed, // food
  Car, // car
  Heart, // health
  Clapperboard, // entertainment
  ShoppingBag, // shopping
  GraduationCap, // education
  Dumbbell, // sport
  Receipt, // bills
  Sparkles, // beauty
  Phone, // telephone
  Users, // social
  Baby, // baby
  Laptop, // electronics
  Home, // home
  Shirt, // clothing
  Shield, // insurance
  Calculator, // tax
  Bus, // transportation
  Wallet, // default fallback
  type LucideIcon,
} from "lucide-react";

// Map category icon names to Lucide React icons
export const categoryIconMap: Record<string, LucideIcon> = {
  food: UtensilsCrossed,
  car: Car,
  health: Heart,
  entertainment: Clapperboard,
  shopping: ShoppingBag,
  education: GraduationCap,
  sport: Dumbbell,
  bills: Receipt,
  beauty: Sparkles,
  telephone: Phone,
  social: Users,
  baby: Baby,
  electronics: Laptop,
  home: Home,
  clothing: Shirt,
  insurance: Shield,
  tax: Calculator,
  transportation: Bus,
};

// Helper function to get the appropriate icon component
export function getCategoryIcon(iconName: string): LucideIcon {
  return categoryIconMap[iconName.toLowerCase()] || Wallet; // Wallet as fallback
}
