import { useRef } from "react";
import { type MangaProject } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Upload, 
  FileText, 
  Crop, 
  RotateCw, 
  Sliders, 
  Type,
  Download,
  Image as ImageIcon
} from "lucide-react";

interface ToolsSidebarProps {
  projects: MangaProject[];
  selectedTool: string;
  onToolSelect: (tool: string) => void;
  onFileUpload: (file: File) => void;
  onRunOCR: () => void;
  onProjectSelect: (project: MangaProject) => void;
  currentProject: MangaProject | null;
  isLoading: boolean;
}

export default function ToolsSidebar({
  projects,
  selectedTool,
  onToolSelect,
  onFileUpload,
  onRunOCR,
  onProjectSelect,
  currentProject,
  isLoading,
}: ToolsSidebarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const tools = [
    { id: 'ocr', label: 'OCR Detect', icon: FileText },
    { id: 'crop', label: 'Crop', icon: Crop },
    { id: 'rotate', label: 'Rotate', icon: RotateCw },
    { id: 'filter', label: 'Filters', icon: Sliders },
    { id: 'text', label: 'Add Text', icon: Type },
  ];

  return (
    <aside className="w-16 md:w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* File Upload Section */}
      <div className="p-4 border-b border-gray-200">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              onFileUpload(file);
            }
          }}
        />
        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          className="w-full flex items-center justify-center"
        >
          <Upload className="w-4 h-4 mr-2" />
          <span className="hidden md:inline">
            {isLoading ? "Processing..." : "Upload Panel"}
          </span>
        </Button>
        
        {/* Recent Files */}
        {projects.length > 0 && (
          <div className="mt-4 hidden md:block">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Recent Files</h3>
            <ScrollArea className="h-32">
              <div className="space-y-1">
                {projects.slice(0, 5).map((project) => (
                  <button
                    key={project.id}
                    onClick={() => onProjectSelect(project)}
                    className={`flex items-center space-x-2 w-full p-2 rounded text-left hover:bg-gray-50 ${
                      currentProject?.id === project.id ? 'bg-gray-100' : ''
                    }`}
                  >
                    <ImageIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600 truncate">{project.name}</span>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>

      {/* Tools Section */}
      <div className="flex-1 p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3 hidden md:block">Tools</h3>
        <div className="space-y-2">
          {tools.map((tool) => {
            const Icon = tool.icon;
            const isSelected = selectedTool === tool.id;
            return (
              <Button
                key={tool.id}
                variant={isSelected ? "default" : "ghost"}
                onClick={() => {
                  onToolSelect(tool.id);
                  if (tool.id === 'ocr' && currentProject) {
                    onRunOCR();
                  }
                }}
                disabled={tool.id === 'ocr' && !currentProject}
                className="w-full justify-start"
              >
                <Icon className="w-4 h-4 mr-2" />
                <span className="hidden md:inline">{tool.label}</span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Export Section */}
      {currentProject && (
        <>
          <Separator />
          <div className="p-4">
            <Button
              variant="outline"
              className="w-full flex items-center justify-center bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              <Download className="w-4 h-4 mr-2" />
              <span className="hidden md:inline">Export</span>
            </Button>
          </div>
        </>
      )}
    </aside>
  );
}
