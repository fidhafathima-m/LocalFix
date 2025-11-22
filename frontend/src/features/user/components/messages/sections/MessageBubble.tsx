import { DoneAllOutlined, DoneOutline } from "@mui/icons-material";

interface MessageBubbleProps {
  text: string;
  timestamp: string;
  isSent: boolean;
  isRead?: boolean;
  senderType?: "user" | "technician";
}

export function MessageBubble({
  text,
  timestamp,
  isSent,
  isRead,
  senderType,
}: MessageBubbleProps) {
  return (
    <div className={`flex ${isSent ? "justify-end" : "justify-start"} mb-4`}>
      <div
        className={`max-w-md ${
          isSent
            ? "bg-blue-600 text-white"
            : "bg-gray-100 text-gray-900 border border-gray-200"
        } rounded-lg px-4 py-2`}
      >
        {/* Debug info - you can remove this after testing */}
        {senderType && (
          <div
            className={`text-xs mb-1 ${
              isSent ? "text-blue-200" : "text-gray-400"
            }`}
          >
            From: {senderType} {isSent ? "(You)" : ""}
          </div>
        )}

        <p className="text-sm">{text}</p>
        <div
          className={`flex items-center gap-1 justify-end mt-1 text-xs ${
            isSent ? "text-blue-100" : "text-gray-500"
          }`}
        >
          <span>{timestamp}</span>
          {isSent &&
            (isRead ? (
              <DoneAllOutlined className="w-2 h-2" />
            ) : (
              <DoneOutline className="w-2 h-2" />
            ))}
        </div>
      </div>
    </div>
  );
}
