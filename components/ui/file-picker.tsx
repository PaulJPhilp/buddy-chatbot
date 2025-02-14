import { useRef } from "react";
import { Button } from "@/components/ui/button";

interface FilePickerProps {
  onFileSelected: (file: File) => void;
}

function FilePicker({ onFileSelected }: FilePickerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelected(file);
    }
  };

  return (
    <div>
      <Button onClick={handleButtonClick}>
        Select File
      </Button>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
    </div>
  );
}

export default FilePicker;
