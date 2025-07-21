import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { type TextBox } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Bold, Italic, Underline, Trash2 } from "lucide-react";

interface PropertiesPanelProps {
  selectedTextBox: TextBox | null;
  selectedTool: string;
  onTextBoxUpdate: (textBox: TextBox | null) => void;
  onTextBoxDelete: () => void;
}

export default function PropertiesPanel({
  selectedTextBox,
  selectedTool,
  onTextBoxUpdate,
  onTextBoxDelete,
}: PropertiesPanelProps) {
  const [editedText, setEditedText] = useState("");
  const [fontSize, setFontSize] = useState(14);
  const [fontColor, setFontColor] = useState("#000000");
  const [backgroundColor, setBackgroundColor] = useState("");
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Update local state when selectedTextBox changes
  useEffect(() => {
    if (selectedTextBox) {
      setEditedText(selectedTextBox.editedText || selectedTextBox.originalText || "");
      setFontSize(selectedTextBox.fontSize || 14);
      setFontColor(selectedTextBox.fontColor || "#000000");
      setBackgroundColor(selectedTextBox.backgroundColor || "");
      setIsBold(selectedTextBox.isBold || false);
      setIsItalic(selectedTextBox.isItalic || false);
      setIsUnderline(selectedTextBox.isUnderline || false);
    }
  }, [selectedTextBox]);

  const updateTextBoxMutation = useMutation({
    mutationFn: async (updates: Partial<TextBox>) => {
      if (!selectedTextBox) return null;
      const response = await apiRequest("PATCH", `/api/textboxes/${selectedTextBox.id}`, updates);
      return response.json();
    },
    onSuccess: (updatedTextBox) => {
      if (updatedTextBox) {
        onTextBoxUpdate(updatedTextBox);
        queryClient.invalidateQueries({ 
          queryKey: ["/api/projects", updatedTextBox.projectId, "textboxes"] 
        });
        toast({
          title: "Success",
          description: "Text box updated successfully!",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteTextBoxMutation = useMutation({
    mutationFn: async () => {
      if (!selectedTextBox) return;
      await apiRequest("DELETE", `/api/textboxes/${selectedTextBox.id}`, null);
    },
    onSuccess: () => {
      onTextBoxDelete();
      if (selectedTextBox) {
        queryClient.invalidateQueries({ 
          queryKey: ["/api/projects", selectedTextBox.projectId, "textboxes"] 
        });
      }
      toast({
        title: "Success",
        description: "Text box deleted successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleApplyChanges = () => {
    if (!selectedTextBox) return;
    
    updateTextBoxMutation.mutate({
      editedText,
      fontSize,
      fontColor,
      backgroundColor: backgroundColor || null,
      isBold,
      isItalic,
      isUnderline,
    });
  };

  const handleDeleteTextBox = () => {
    deleteTextBoxMutation.mutate();
  };

  if (!selectedTextBox && selectedTool !== 'filter') {
    return null;
  }

  return (
    <aside className="w-80 bg-white border-l border-gray-200">
      <div className="h-full flex flex-col">
        {/* Panel Header */}
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            {selectedTextBox ? 'Text Properties' : 'Image Filters'}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {selectedTextBox ? 'Edit detected text and styling' : 'Adjust image appearance'}
          </p>
        </div>

        {/* Text Editor */}
        {selectedTextBox && (
          <div className="flex-1 p-4 space-y-6 overflow-y-auto">
            {/* Original Text */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Detected Text</Label>
              <div className="p-3 bg-gray-50 rounded-lg border">
                <p className="text-sm text-gray-800">
                  {selectedTextBox.originalText || "No text detected"}
                </p>
              </div>
              {selectedTextBox.confidence && (
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <span>Confidence:</span>
                  <div className="flex-1">
                    <Progress value={selectedTextBox.confidence} className="h-2" />
                  </div>
                  <span>{selectedTextBox.confidence}%</span>
                </div>
              )}
            </div>

            {/* Edited Text */}
            <div className="space-y-2">
              <Label htmlFor="editedText" className="text-sm font-medium text-gray-700">
                Edit Text
              </Label>
              <Textarea
                id="editedText"
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                placeholder="Enter replacement text..."
                className="h-20 resize-none"
              />
            </div>

            {/* Text Style Options */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-700">Text Style</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs text-gray-600">Font Size</Label>
                  <Select value={fontSize.toString()} onValueChange={(value) => setFontSize(parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10px</SelectItem>
                      <SelectItem value="12">12px</SelectItem>
                      <SelectItem value="14">14px</SelectItem>
                      <SelectItem value="16">16px</SelectItem>
                      <SelectItem value="18">18px</SelectItem>
                      <SelectItem value="20">20px</SelectItem>
                      <SelectItem value="24">24px</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-xs text-gray-600">Text Color</Label>
                  <div className="flex space-x-2">
                    <input
                      type="color"
                      value={fontColor}
                      onChange={(e) => setFontColor(e.target.value)}
                      className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
                    />
                    <Input
                      value={fontColor}
                      onChange={(e) => setFontColor(e.target.value)}
                      className="flex-1 text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button
                  variant={isBold ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIsBold(!isBold)}
                  className="flex-1"
                >
                  <Bold className="w-4 h-4" />
                </Button>
                <Button
                  variant={isItalic ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIsItalic(!isItalic)}
                  className="flex-1"
                >
                  <Italic className="w-4 h-4" />
                </Button>
                <Button
                  variant={isUnderline ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIsUnderline(!isUnderline)}
                  className="flex-1"
                >
                  <Underline className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Background Options */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-700">Background</h3>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant={backgroundColor === "" ? "default" : "outline"}
                  onClick={() => setBackgroundColor("")}
                  className="aspect-square flex items-center justify-center"
                >
                  <span className="text-xs">None</span>
                </Button>
                <Button
                  variant={backgroundColor === "#ffffff" ? "default" : "outline"}
                  onClick={() => setBackgroundColor("#ffffff")}
                  className="aspect-square bg-white border-2"
                />
                <Button
                  variant={backgroundColor === "#000000" ? "default" : "outline"}
                  onClick={() => setBackgroundColor("#000000")}
                  className="aspect-square bg-black border-2"
                />
              </div>
            </div>

            <Separator />

            {/* Actions */}
            <div className="space-y-2">
              <Button 
                onClick={handleApplyChanges}
                disabled={updateTextBoxMutation.isPending}
                className="w-full"
              >
                {updateTextBoxMutation.isPending ? "Applying..." : "Apply Changes"}
              </Button>
              <Button 
                variant="destructive"
                onClick={handleDeleteTextBox}
                disabled={deleteTextBoxMutation.isPending}
                className="w-full flex items-center"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {deleteTextBoxMutation.isPending ? "Deleting..." : "Delete Text Box"}
              </Button>
            </div>
          </div>
        )}

        {/* Filter Panel */}
        {selectedTool === 'filter' && !selectedTextBox && (
          <div className="flex-1 p-4 space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-700">Image Filters</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm text-gray-600">Brightness</Label>
                  <span className="text-sm text-gray-800">0</span>
                </div>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  defaultValue="0"
                  className="w-full"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm text-gray-600">Contrast</Label>
                  <span className="text-sm text-gray-800">0</span>
                </div>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  defaultValue="0"
                  className="w-full"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm text-gray-600">Saturation</Label>
                  <span className="text-sm text-gray-800">0</span>
                </div>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  defaultValue="0"
                  className="w-full"
                />
              </div>

              <Button className="w-full">Apply Filters</Button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
