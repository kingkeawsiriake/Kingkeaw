import { 
  Utensils, 
  Car, 
  ShoppingBag, 
  Receipt, 
  Home, 
  HeartPulse, 
  Gamepad2, 
  GraduationCap, 
  Dog, 
  MoreHorizontal,
  Briefcase,
  Store,
  Sparkles,
  TrendingUp,
  Gift,
  PlusCircle,
  HelpCircle
} from 'lucide-react';
import { ALL_CATEGORIES } from '../types.ts';

interface CategoryIconProps {
  categoryName: string;
  className?: string;
  size?: number;
}

export function CategoryIcon({ categoryName, className = 'w-5 h-5', size = 20 }: CategoryIconProps) {
  const cat = ALL_CATEGORIES.find(c => c.name === categoryName);
  const iconName = cat?.iconName || 'HelpCircle';

  switch (iconName) {
    case 'Utensils': return <Utensils size={size} className={className} />;
    case 'Car': return <Car size={size} className={className} />;
    case 'ShoppingBag': return <ShoppingBag size={size} className={className} />;
    case 'Receipt': return <Receipt size={size} className={className} />;
    case 'Home': return <Home size={size} className={className} />;
    case 'HeartPulse': return <HeartPulse size={size} className={className} />;
    case 'Gamepad2': return <Gamepad2 size={size} className={className} />;
    case 'GraduationCap': return <GraduationCap size={size} className={className} />;
    case 'Dog': return <Dog size={size} className={className} />;
    case 'Briefcase': return <Briefcase size={size} className={className} />;
    case 'Store': return <Store size={size} className={className} />;
    case 'Sparkles': return <Sparkles size={size} className={className} />;
    case 'TrendingUp': return <TrendingUp size={size} className={className} />;
    case 'Gift': return <Gift size={size} className={className} />;
    case 'PlusCircle': return <PlusCircle size={size} className={className} />;
    case 'MoreHorizontal': return <MoreHorizontal size={size} className={className} />;
    default: return <HelpCircle size={size} className={className} />;
  }
}
