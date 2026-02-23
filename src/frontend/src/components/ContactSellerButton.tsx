import { Button } from '@/components/ui/button';
import { useNavigate } from '@tanstack/react-router';
import { MessageSquare } from 'lucide-react';
import type { UserId } from '../backend';

interface ContactSellerButtonProps {
  sellerId: UserId;
}

export default function ContactSellerButton({ sellerId }: ContactSellerButtonProps) {
  const navigate = useNavigate();

  const handleContact = () => {
    navigate({ to: '/conversation/$userId', params: { userId: sellerId.toString() } });
  };

  return (
    <Button onClick={handleContact} variant="outline" className="w-full">
      <MessageSquare className="h-4 w-4 mr-2" />
      Contact Seller
    </Button>
  );
}
