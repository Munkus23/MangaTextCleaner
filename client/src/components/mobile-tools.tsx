import { type TextBox } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { 
  FileText, 
  Crop, 
  RotateCw, 
  Sliders, 
  Type,
  X,
  Bold,
  Italic,
  Underline 
} from "lucide-react";

interface MobileToolsProps {
  show: boolean;
  onClose: () => void;
  selectedTool: string;
  onToolSelect: (tool: string) => void;
  selectedTextBox: TextBox | null;
  onTextBoxUpdate: (textBox: TextBox | null) => void;
}

export default function MobileTools({
  show,
  onClose,
  selectedTool,
  onToolSelect,
  selectedTextBox,
  onTextBoxUpdate,
}: MobileToolsProps) {
  const tools = [
    { id: 'ocr', label: 'OCR', icon: FileText },
    { id: 'crop', label: 'Crop', icon: Crop },
    { id: 'rotate', label: 'Rotate', icon: RotateCw },
    { id: 'filter', label: 'Filter', icon: Sliders },
    { id: 'text', label: 'Text', icon: Type },
  ];

  return (
    <Sheet open={show} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[60vh]">
        <SheetHeader className="flex flex-row items-center justify-between">
          <SheetTitle>Tools</SheetTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </SheetHeader>
        
        {!selectedTextBox ? (
          /* Tool Selection */
          <div className="mt-6">
            <div className="grid grid-cols-4 gap-3">
              {tools.map((tool) => {
                const Icon = tool.icon;
                const isSelected = selectedTool === tool.id;
                return (
                  <Button
                    key={tool.id}
                    variant={isSelected ? "default" : "outline"}
                    className="flex flex-col items-center h-20 p-3"
                    onClick={() => onToolSelect(tool.id)}
                  >
                    <Icon className="w-6 h-6 mb-1" />
                    <span className="text-xs">{tool.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>
        ) : (
          /* Text Editing */
          <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Original Text</Label>
              <div className="p-3 bg-gray-50 rounded-lg border text-sm">
                {selectedTextBox.originalText || "No text detected"}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Edit Text</Label>
              <Textarea
                value={selectedTextBox.editedText || ""}
                onChange={(e) => {
                  if (selectedTextBox) {
                    onTextBoxUpdate({
                      ...selectedTextBox,
                      editedText: e.target.value,
                    });
                  }
                }}
                placeholder="Enter replacement text..."
                className="h-20 resize-none"
              />
            </div>

            <div className="flex space-x-2">
              <Button variant="outline" size="sm" className="flex-1">
                <Bold className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                <Italic className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                <Underline className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex space-x-2">
              <Button className="flex-1">Apply Changes</Button>
              <Button variant="destructive" className="flex-1">Delete</Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
