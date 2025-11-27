import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface PDFGeneratorProps {
  element: HTMLElement;
  fileName: string;
  onStart?: () => void;
  onComplete?: () => void;
  onError?: (error: Error) => void;
}

export class PDFGenerator {
  static async generatePDF({
    element,
    fileName,
    onStart,
    onComplete,
    onError,
  }: PDFGeneratorProps): Promise<void> {
    try {
      onStart?.();

      // Create a deep clone of the element
      const clone = element.cloneNode(true) as HTMLElement;

      // Convert Tailwind classes to inline styles instead of removing them
      this.convertTailwindToInlineStyles(clone);

      // Create temporary container
      const tempContainer = document.createElement("div");
      tempContainer.style.position = "fixed";
      tempContainer.style.left = "-9999px";
      tempContainer.style.top = "0";
      tempContainer.style.width = "794px"; // A4 width in pixels
      tempContainer.style.backgroundColor = "#ffffff";
      tempContainer.appendChild(clone);
      document.body.appendChild(tempContainer);

      // Generate canvas with better configuration
      const canvas = await html2canvas(clone, {
        scale: 3, // Higher scale for better quality
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        width: clone.scrollWidth,
        height: clone.scrollHeight,
        windowWidth: clone.scrollWidth,
        windowHeight: clone.scrollHeight,
        removeContainer: true,
        foreignObjectRendering: false, // Avoids oklch issues
      });

      // Clean up
      document.body.removeChild(tempContainer);

      // Create PDF
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const scaledWidth = imgWidth * ratio;
      const scaledHeight = imgHeight * ratio;

      // Center the image on the page
      const x = (pdfWidth - scaledWidth) / 2;
      const y = (pdfHeight - scaledHeight) / 2;

      pdf.addImage(
        canvas.toDataURL("image/png"),
        "PNG",
        x,
        y,
        scaledWidth,
        scaledHeight
      );
      pdf.save(fileName);

      onComplete?.();
    } catch (error) {
      console.error("PDF generation error:", error);
      onError?.(
        error instanceof Error ? error : new Error("PDF generation failed")
      );
    }
  }

  private static convertTailwindToInlineStyles(element: HTMLElement): void {
    const classMappings = {
      // Background colors
      "bg-gray-50": { backgroundColor: "#f9fafb" },
      "bg-white": { backgroundColor: "#ffffff" },
      "bg-blue-600": { backgroundColor: "#2563eb" },
      "bg-blue-700": { backgroundColor: "#1d4ed8" },
      "bg-gray-100": { backgroundColor: "#f3f4f6" },
      "bg-gray-200": { backgroundColor: "#e5e7eb" },
      "bg-gray-400": { backgroundColor: "#9ca3af" },
      "bg-gray-300": { backgroundColor: "#d1d5db" },

      // Text colors
      "text-gray-400": { color: "#9ca3af" },
      "text-gray-600": { color: "#4b5563" },
      "text-gray-700": { color: "#374151" },
      "text-gray-800": { color: "#1f2937" },
      "text-gray-900": { color: "#111827" },
      "text-blue-600": { color: "#2563eb" },
      "text-green-600": { color: "#059669" },
      "text-red-600": { color: "#dc2626" },
      "text-white": { color: "#ffffff" },

      // Border colors
      "border-gray-200": { borderColor: "#e5e7eb" },
      "border-gray-300": { borderColor: "#d1d5db" },
      "border-b": { borderBottom: "1px solid #e5e7eb" },
      "border-t": { borderTop: "1px solid #e5e7eb" },
      border: { border: "1px solid #e5e7eb" },

      // Font weights
      "font-bold": { fontWeight: "bold" },
      "font-semibold": { fontWeight: "600" },
      "font-medium": { fontWeight: "500" },

      // Text sizes
      "text-xs": { fontSize: "12px" },
      "text-sm": { fontSize: "14px" },
      "text-base": { fontSize: "16px" },
      "text-lg": { fontSize: "18px" },
      "text-xl": { fontSize: "20px" },
      "text-2xl": { fontSize: "24px" },
      "text-3xl": { fontSize: "30px" },

      // Padding
      "p-2": { padding: "8px" },
      "p-3": { padding: "12px" },
      "p-4": { padding: "16px" },
      "p-6": { padding: "24px" },
      "p-8": { padding: "32px" },
      "px-4": { paddingLeft: "16px", paddingRight: "16px" },
      "px-6": { paddingLeft: "24px", paddingRight: "24px" },
      "py-2": { paddingTop: "8px", paddingBottom: "8px" },
      "py-3": { paddingTop: "12px", paddingBottom: "12px" },
      "py-4": { paddingTop: "16px", paddingBottom: "16px" },
      "py-6": { paddingTop: "24px", paddingBottom: "24px" },
      "pt-6": { paddingTop: "24px" },

      // Margin
      "mb-1": { marginBottom: "4px" },
      "mb-2": { marginBottom: "8px" },
      "mb-3": { marginBottom: "12px" },
      "mb-4": { marginBottom: "16px" },
      "mb-6": { marginBottom: "24px" },
      "mb-8": { marginBottom: "32px" },
      "mt-4": { marginTop: "16px" },
      "mt-6": { marginTop: "24px" },
      "mr-1": { marginRight: "4px" },

      // Flexbox
      flex: { display: "flex" },
      "items-center": { alignItems: "center" },
      "justify-between": { justifyContent: "space-between" },
      "justify-end": { justifyContent: "flex-end" },
      "space-x-3": { gap: "12px" },

      // Grid
      grid: { display: "grid" },
      "grid-cols-2": { gridTemplateColumns: "repeat(2, minmax(0, 1fr))" },
      "gap-8": { gap: "32px" },
      "gap-6": { gap: "24px" },
      "gap-3": { gap: "12px" },
      "gap-4": { gap: "16px" },

      // Borders
      "rounded-lg": { borderRadius: "8px" },
      "border-collapse": { borderCollapse: "collapse" },
      "border-b-2": { borderBottom: "2px solid #d1d5db" },
      "border-t-2": { borderTop: "2px solid #d1d5db" },

      // Width & Height
      "w-full": { width: "100%" },
      "w-5": { width: "20px" },
      "w-4": { width: "16px" },
      "h-5": { height: "20px" },
      "h-4": { height: "16px" },
      "max-w-4xl": { maxWidth: "896px" },

      // Overflow
      "overflow-y-auto": { overflowY: "auto" },
      "max-h-\\[90vh\\]": { maxHeight: "90vh" },

      // Position
      sticky: { position: "sticky" },
      "top-0": { top: "0" },
      fixed: { position: "fixed" },
      "inset-0": { top: "0", right: "0", bottom: "0", left: "0" },

      // Shadows
      "shadow-xl": {
        boxShadow:
          "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      },
      "shadow-sm": { boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)" },

      // Backdrop
      "backdrop-blur-sm": { backdropFilter: "blur(4px)" },

      // Opacity
      "bg-opacity-30": { backgroundColor: "rgba(0, 0, 0, 0.3)" },

      // Space
      "space-y-1": { "& > * + *": { marginTop: "4px" } },
      "space-y-2": { "& > * + *": { marginTop: "8px" } },
      "space-y-3": { "& > * + *": { marginTop: "12px" } },
      "space-y-4": { "& > * + *": { marginTop: "16px" } },
    };

    const processElement = (el: HTMLElement) => {
      const className = el.getAttribute("class");
      if (className) {
        const classes = className.split(" ").filter((cls) => cls.trim());

        // Apply individual class styles
        classes.forEach((cls) => {
          const mapping = classMappings[cls as keyof typeof classMappings];
          if (mapping) {
            // Handle special cases like space utilities
            if (cls.startsWith("space-y-") || cls.startsWith("space-x-")) {
              // For space utilities, we'd need to handle children
            } else {
              Object.assign(el.style, mapping);
            }
          }
        });

        // Remove the class to prevent oklch parsing
        el.removeAttribute("class");
      }
    };

    // Process all elements including the root
    const allElements = element.querySelectorAll("*");
    allElements.forEach((child) => {
      if (child instanceof HTMLElement) {
        processElement(child);
      }
    });
    processElement(element);
  }
}
