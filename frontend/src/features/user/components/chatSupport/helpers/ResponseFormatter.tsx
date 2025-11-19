export class ResponseFormatter {
  static formatAIResponse(text: string): React.ReactNode {
    if (!text) return text;

    // Split by sections (### Headers)
    const sections = text.split("###").filter((section) => section.trim());

    if (sections.length > 1) {
      return this.renderStructuredResponse(sections);
    }

    // Check for step-by-step format
    if (text.match(/\d+\.\s+\*\*/) || text.includes("Step")) {
      return this.renderStepByStep(text);
    }

    // Default formatting for regular text
    return this.renderFormattedText(text);
  }

  private static renderStructuredResponse(sections: string[]): React.ReactNode {
    return (
      <div className="space-y-4">
        {sections.map((section, index) => {
          const [header, ...content] = section
            .split("\n")
            .filter((line) => line.trim());
          return (
            <div
              key={index}
              className="bg-blue-50 rounded-lg p-4 border border-blue-200"
            >
              <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                {header.replace(/\*\*/g, "").trim()}
              </h4>
              <div className="text-gray-700 space-y-1">
                {content.map((line, lineIndex) => (
                  <div key={lineIndex} className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>{line.replace(/^- /, "").trim()}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  private static renderStepByStep(text: string): React.ReactNode {
    const lines = text.split("\n").filter((line) => line.trim());

    return (
      <div className="space-y-3">
        {lines.map((line, index) => {
          // Match patterns like "1. **Visit**" or "Step 1: Visit"
          const stepMatch =
            line.match(/(\d+)\.\s+\*\*(.*?)\*\*(.*)/) ||
            line.match(/Step\s+(\d+):\s+(.*)/);

          if (stepMatch) {
            return (
              <div
                key={index}
                className="flex gap-3 p-3 bg-white rounded-lg border border-gray-200"
              >
                <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {stepMatch[1]}
                </div>
                <div className="flex-1">
                  <strong className="text-gray-900">{stepMatch[2]}</strong>
                  <span className="text-gray-700">{stepMatch[3]}</span>
                </div>
              </div>
            );
          }

          // Regular list items
          if (line.trim().startsWith("-")) {
            return (
              <div
                key={index}
                className="flex items-start gap-2 ml-9 text-gray-700"
              >
                <span className="text-blue-500 mt-1">•</span>
                <span>{line.replace(/^- /, "").trim()}</span>
              </div>
            );
          }

          // Regular text
          return (
            <p key={index} className="text-gray-700 ml-9">
              {line}
            </p>
          );
        })}
      </div>
    );
  }

  private static renderFormattedText(text: string): React.ReactNode {
    const paragraphs = text.split("\n\n").filter((p) => p.trim());

    return (
      <div className="space-y-3">
        {paragraphs.map((paragraph, index) => {
          // Bold text formatting
          const parts = paragraph.split(/\*\*(.*?)\*\*/g);

          return (
            <p key={index} className="text-gray-700 leading-relaxed">
              {parts.map((part, partIndex) =>
                partIndex % 2 === 1 ? (
                  <strong key={partIndex} className="text-gray-900">
                    {part}
                  </strong>
                ) : (
                  part
                )
              )}
            </p>
          );
        })}
      </div>
    );
  }
}
