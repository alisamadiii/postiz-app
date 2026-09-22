import { useDropzone } from 'react-dropzone';
import { FC, ReactNode } from 'react';
import { useT } from '@gitroom/react/translation/get.transation.service.client';
import { cn } from '@gitroom/react/helpers/cn';
import { useToaster } from '@gitroom/react/toaster/toaster';
import { UploadCloud } from 'lucide-react';
export const DropFiles: FC<{
  children: ReactNode;
  className?: string;
  onDrop: (files: File[]) => void;
  disabled?: boolean;
}> = (props) => {
  const t = useT();
  const toaster = useToaster();

  const { getRootProps, isDragActive } = useDropzone({
    onDrop: (files) => {
      if (props.disabled) {
        toaster.show('Upload current in progress, please wait and then try again.', 'warning');
        return ;
      }
      props.onDrop(files);
    },
  });
  return (
    <div {...getRootProps()} className={cn("relative", props.className)}>
      {isDragActive && (
        <div className="absolute start-0 top-0 w-full h-full p-[12px] z-[200] animate-normalFadeIn">
          <div className="w-full h-full flex flex-col items-center justify-center gap-[16px] rounded-[16px] border-2 border-dashed border-primary bg-background/95 backdrop-blur-sm">
            <div className="w-[64px] h-[64px] flex items-center justify-center rounded-full bg-primary/10 text-primary animate-bounce">
              <UploadCloud width={30} height={30} />
            </div>
            <div className="text-[18px] font-[700] text-foreground">
              {t('drop_to_upload', 'Drop to upload')}
            </div>
            <div className="text-[13px] text-foreground/50">
              {t(
                'release_files_to_start_uploading',
                'Release the files to start uploading'
              )}
            </div>
          </div>
        </div>
      )}
      {props.children}
    </div>
  );
};
