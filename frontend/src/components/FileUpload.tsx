import React, { type LabelHTMLAttributes } from "react";

interface FileUploadProps
  extends Omit<LabelHTMLAttributes<HTMLLabelElement>, "onChange"> {
  name: string;
  onFilesSelect: (files: FileList | null) => void;
}

export function FileUpload({
  onFilesSelect,
  name,
  ...labelProps
}: FileUploadProps) {
  return (
    <label {...labelProps}>
      <input type="file" onChange={(e) => onFilesSelect(e.target.files)} />
      {name}
    </label>
  );
}
