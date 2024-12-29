
import { DialogHeader,DialogTitle,Dialog,DialogContent } from "./ui/dialog";
import { Button } from "./ui/button";


interface FileUploadModalProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    loading: boolean;
    files: FileList | null;
    handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    handleUpload: () => void;
  }
  
  export function FileUploadModal({
    isOpen,
    setIsOpen,
    loading,
    files,
    handleFileChange,
    handleUpload
  }: FileUploadModalProps) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Files</DialogTitle>
          </DialogHeader>
          <div className="p-4 border-2 border-dashed border-gray-400 rounded-lg text-center">
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              className="cursor-pointer"
            />
            <p className="text-sm text-gray-400 mt-2">
              Supported formats: PNG, JPEG, PDF, TXT, Markdown
            </p>
          </div>
          
          <div className="mt-4 text-center">
            <Button
              variant="default"
              onClick={handleUpload}
              disabled={loading || !files}
            >
              {loading ? "Uploading..." : "Upload Files"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
  