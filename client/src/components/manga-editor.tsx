import { useState, useCallback, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { type MangaProject, type TextBox } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpen, Upload, Download, Settings, Wifi, WifiOff } from "lucide-react";
import ToolsSidebar from "@/components/tools-sidebar";
import CanvasEditor from "@/components/canvas-editor";
import PropertiesPanel from "@/components/properties-panel";
import MobileTools from "@/components/mobile-tools";

export default function MangaEditor() {
  const [currentProject, setCurrentProject] = useState<MangaProject | null>(null);
  const [selectedTool, setSelectedTool] = useState<string>("ocr");
  const [selectedTextBox, setSelectedTextBox] = useState<TextBox | null>(null);
  const [showMobileTools, setShowMobileTools] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();

  // Listen for online/offline status
  useState(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    const handleInstallPrompt = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('beforeinstallprompt', handleInstallPrompt);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleInstallPrompt);
    };
  });

  const { data: projects = [] } = useQuery<MangaProject[]>({
    queryKey: ["/api/projects"],
  });

  const { data: textBoxes = [] } = useQuery<TextBox[]>({
    queryKey: ["/api/projects", currentProject?.id, "textboxes"],
    enabled: !!currentProject,
  });

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await apiRequest("POST", "/api/projects", formData);
      return response.json();
    },
    onSuccess: (project) => {
      setCurrentProject(project);
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "Success",
        description: "Image uploaded successfully!",
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

  const ocrMutation = useMutation({
    mutationFn: async (projectId: number) => {
      const response = await apiRequest("POST", `/api/projects/${projectId}/ocr`, null);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", currentProject?.id, "textboxes"] });
      toast({
        title: "OCR Complete",
        description: "Text detection completed successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "OCR Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = useCallback((file: File) => {
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);
    formData.append("name", file.name.replace(/\.[^/.]+$/, ""));
    
    uploadMutation.mutate(formData);
  }, [uploadMutation]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      handleFileUpload(imageFile);
    }
  }, [handleFileUpload]);

  const handleRunOCR = useCallback(() => {
    if (!currentProject) return;
    ocrMutation.mutate(currentProject.id);
  }, [currentProject, ocrMutation]);

  const handleInstallApp = useCallback(() => {
    if (installPrompt) {
      installPrompt.prompt();
      installPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          toast({
            title: "App Installed",
            description: "Manga Editor has been installed to your device!",
          });
        }
        setInstallPrompt(null);
      });
    }
  }, [installPrompt, toast]);

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between relative z-50">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900">Manga Editor</h1>
          </div>
          {currentProject && !isMobile && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>{currentProject.name}</span>
              <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
              <span>{currentProject.width}x{currentProject.height}</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {installPrompt && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleInstallApp}
              className="hidden md:flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Install App</span>
            </Button>
          )}
          
          <div className="flex items-center space-x-1">
            {isOnline ? (
              <>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">Online</span>
              </>
            ) : (
              <>
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Offline</span>
              </>
            )}
          </div>
          
          <Button variant="ghost" size="icon">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <ToolsSidebar
          projects={projects}
          selectedTool={selectedTool}
          onToolSelect={setSelectedTool}
          onFileUpload={handleFileUpload}
          onRunOCR={handleRunOCR}
          onProjectSelect={setCurrentProject}
          currentProject={currentProject}
          isLoading={uploadMutation.isPending || ocrMutation.isPending}
        />

        {/* Main Canvas Area */}
        <main className="flex-1 relative bg-gray-100">
          <CanvasEditor
            project={currentProject}
            textBoxes={textBoxes}
            selectedTool={selectedTool}
            selectedTextBox={selectedTextBox}
            onTextBoxSelect={setSelectedTextBox}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onFileUpload={handleFileUpload}
            isLoading={uploadMutation.isPending || ocrMutation.isPending}
          />

          {/* Mobile FAB */}
          {isMobile && (
            <Button
              className="mobile-fab w-14 h-14 rounded-full shadow-lg"
              onClick={() => setShowMobileTools(true)}
            >
              <Settings className="w-6 h-6" />
            </Button>
          )}
        </main>

        {/* Properties Panel */}
        {(selectedTextBox || selectedTool === 'filter') && !isMobile && (
          <PropertiesPanel
            selectedTextBox={selectedTextBox}
            selectedTool={selectedTool}
            onTextBoxUpdate={setSelectedTextBox}
            onTextBoxDelete={() => setSelectedTextBox(null)}
          />
        )}
      </div>

      {/* Mobile Tools */}
      {isMobile && (
        <MobileTools
          show={showMobileTools}
          onClose={() => setShowMobileTools(false)}
          selectedTool={selectedTool}
          onToolSelect={setSelectedTool}
          selectedTextBox={selectedTextBox}
          onTextBoxUpdate={setSelectedTextBox}
        />
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            handleFileUpload(file);
          }
        }}
      />
    </div>
  );
}
