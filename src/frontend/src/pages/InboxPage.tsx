import { useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetMessages, useGetUserProfile } from '../hooks/useQueries';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, MessageSquare, AlertCircle } from 'lucide-react';
import type { Message } from '../backend';

interface ConversationPreview {
  otherUserId: string;
  lastMessage: Message;
  unreadCount: number;
}

function MessageListItem({ conversation }: { conversation: ConversationPreview }) {
  const navigate = useNavigate();
  const { data: otherUserProfile } = useGetUserProfile(conversation.otherUserId);

  const timeAgo = (timestamp: bigint) => {
    const now = Date.now();
    const messageTime = Number(timestamp) / 1_000_000; // Convert nanoseconds to milliseconds
    const diff = now - messageTime;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  return (
    <Card
      className="cursor-pointer hover:bg-muted/50 transition-colors"
      onClick={() => navigate({ to: '/conversation/$userId', params: { userId: conversation.otherUserId } })}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold">{otherUserProfile?.name || 'Anonymous Wizard'}</h3>
          <span className="text-xs text-muted-foreground">
            {timeAgo(conversation.lastMessage.timestamp)}
          </span>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {conversation.lastMessage.content}
        </p>
      </CardContent>
    </Card>
  );
}

export default function InboxPage() {
  const { identity } = useInternetIdentity();
  const { data: messages, isLoading } = useGetMessages();

  const conversations = useMemo(() => {
    if (!messages || !identity) return [];

    const currentUserId = identity.getPrincipal().toString();
    const conversationMap = new Map<string, ConversationPreview>();

    messages.forEach((message) => {
      const otherUserId =
        message.from.toString() === currentUserId
          ? message.to.toString()
          : message.from.toString();

      const existing = conversationMap.get(otherUserId);
      if (!existing || Number(message.timestamp) > Number(existing.lastMessage.timestamp)) {
        conversationMap.set(otherUserId, {
          otherUserId,
          lastMessage: message,
          unreadCount: 0, // Could be enhanced to track unread
        });
      }
    });

    return Array.from(conversationMap.values()).sort(
      (a, b) => Number(b.lastMessage.timestamp) - Number(a.lastMessage.timestamp)
    );
  }, [messages, identity]);

  if (!identity) {
    return (
      <div className="container mx-auto px-4 py-20">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please log in to view your messages.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-20 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <MessageSquare className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">No messages yet</h2>
        <p className="text-muted-foreground">
          Start a conversation by contacting a seller from an item page
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-8">Messages</h1>
      <div className="space-y-4">
        {conversations.map((conversation) => (
          <MessageListItem key={conversation.otherUserId} conversation={conversation} />
        ))}
      </div>
    </div>
  );
}
