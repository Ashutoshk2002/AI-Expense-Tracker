import { getCategoryIcon } from "@/lib/categoryIcons";

interface CategoryIconProps {
  iconName: string;
  className?: string;
  size?: number;
}

export function CategoryIcon({
  iconName,
  className = "w-4 h-4",
  size,
}: CategoryIconProps) {
  const IconComponent = getCategoryIcon(iconName);

  return <IconComponent className={className} size={size} />;
}
