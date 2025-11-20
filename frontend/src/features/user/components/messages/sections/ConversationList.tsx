// components/messages/sections/ConversationList.tsx
import React from "react";
import { PersonOutlined } from "@mui/icons-material";

interface Conversation {
  id: string;
  name: string;
  service: string;
  lastMessage: string;
  timestamp: string;
  unread?: number;
  avatar?: string;
  orderId: string;
  recipientId: string;
}

interface ConversationListProps {
  conversations: Conversation[];
  activeId?: string;
  onSelect: (conversationId: string) => void;
}

// components/messages/sections/ConversationList.tsx
export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  activeId,
  onSelect,
}) => {
  return (
    <div className="h-full overflow-y-auto">
      <div className="space-y-2 p-1">
        {conversations.map((conversation) => (
          <div
            key={conversation.id}
            className={`p-4 rounded-lg cursor-pointer transition-colors ${
              activeId === conversation.id
                ? "bg-blue-50 border border-blue-200"
                : "hover:bg-gray-50 border border-transparent"
            }`}
            onClick={() => onSelect(conversation.id)}
          >
            <div className="flex items-start gap-3">
              {/* Profile Picture */}
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  {conversation.avatar ? (
                    <img
                      src={conversation.avatar}
                      alt={conversation.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <PersonOutlined className="w-6 h-6 text-gray-400" />
                  )}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {conversation.name}
                  </h3>
                  <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                    {conversation.timestamp}
                  </span>
                </div>

                <p className="text-sm text-gray-600 mb-1 truncate">
                  {conversation.service}
                </p>

                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500 truncate flex-1 min-w-0 mr-2">
                    {conversation.lastMessage}
                  </p>
                  {conversation.unread && conversation.unread > 0 && (
                    <span className="bg-blue-600 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center px-1 flex-shrink-0">
                      {conversation.unread}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
