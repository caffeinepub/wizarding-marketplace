import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import type { ExternalBlob } from '../backend';
import { User } from 'lucide-react';

interface UserAvatarProps {
  profilePicture?: ExternalBlob | null;
  size?: 'small' | 'medium' | 'large';
  alt?: string;
}

const sizeMap = {
  small: 'h-8 w-8',
  medium: 'h-16 w-16',
  large: 'h-32 w-32',
};

const iconSizeMap = {
  small: 'h-4 w-4',
  medium: 'h-8 w-8',
  large: 'h-16 w-16',
};

export default function UserAvatar({ profilePicture, size = 'medium', alt = 'User avatar' }: UserAvatarProps) {
  const imageUrl = profilePicture?.getDirectURL();

  return (
    <Avatar className={sizeMap[size]}>
      {imageUrl ? (
        <AvatarImage src={imageUrl} alt={alt} className="object-cover" />
      ) : (
        <AvatarFallback className="bg-gradient-to-br from-primary/20 to-chart-1/20">
          <User className={iconSizeMap[size] + ' text-muted-foreground'} />
        </AvatarFallback>
      )}
    </Avatar>
  );
}
