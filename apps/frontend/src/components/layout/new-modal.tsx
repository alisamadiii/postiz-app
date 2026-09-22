import { create } from 'zustand';
import { makeId } from '@gitroom/nestjs-libraries/services/make.is';
import { useShallow } from 'zustand/react/shallow';
import React, {
  createContext,
  FC,
  memo,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Button } from '@gitroom/react/form/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@gitroom/react/ui/alert-dialog';
import { useHotkeys } from 'react-hotkeys-hook';
import { cn } from '@gitroom/react/helpers/cn';
import { EventEmitter } from 'events';
import { X } from 'lucide-react';

interface OpenModalInterface {
  title?: any;
  closeOnClickOutside?: boolean;
  removeLayout?: boolean;
  fullScreen?: boolean;
  top?: string | number;
  closeOnEscape?: boolean;
  withCloseButton?: boolean;
  askClose?: boolean;
  onClose?: () => void;
  children: ReactNode | ((close: () => void) => ReactNode);
  classNames?: {
    modal?: string;
  };
  size?: string | number;
  maxSize?: string | number;
  height?: string | number;
  id?: string;
}

interface ModalManagerStoreInterface {
  closeById(id: string): void;
  openModal(params: OpenModalInterface): void;
  closeAll(): void;
}

interface State extends ModalManagerStoreInterface {
  modalManager: Array<{ id: string } & OpenModalInterface>;
}

const useModalStore = create<State>((set) => ({
  modalManager: [],
  openModal: (params) => {
    const newId = params.id || makeId(20);
    set((state) => ({
      modalManager: [
        ...state.modalManager,
        ...(!state.modalManager.some((p) => p.id === newId)
          ? [{ id: newId, ...params }]
          : []),
      ],
    }));
  },
  closeById: (id) =>
    set((state) => ({
      modalManager: state.modalManager.filter((modal) => modal.id !== id),
    })),
  closeAll: () => set({ modalManager: [] }),
}));

const CurrentModalContext = createContext({ id: '' });

interface ModalManagerInterface extends ModalManagerStoreInterface {
  closeCurrent(): void;
}

export const useModals = () => {
  const { closeAll, openModal, closeById } = useModalStore(
    useShallow((state) => ({
      openModal: state.openModal,
      closeById: state.closeById,
      closeAll: state.closeAll,
    }))
  );

  const modalContext = useContext(CurrentModalContext);

  return {
    openModal,
    closeAll,
    closeById,
    closeCurrent: () => {
      if (modalContext.id) {
        closeById(modalContext.id);
      }
    },
  } satisfies ModalManagerInterface;
};

export const Component: FC<{
  closeModal: (id: string) => void;
  zIndex: number;
  isLast: boolean;
  modal: { id: string } & OpenModalInterface;
}> = memo(({ isLast, modal, closeModal, zIndex }) => {
  const decision = useDecisionModal();
  const closeModalFunction = useCallback(async () => {
    if (modal.askClose) {
      const open = await decision.open();
      if (!open) {
        return;
      }
    }
    modal?.onClose?.();
    closeModal(modal.id);
  }, [modal.id, closeModal]);

  const RenderComponent = useMemo(() => {
    return typeof modal.children === 'function'
      ? modal.children(closeModalFunction)
      : modal.children;
  }, [modal, closeModalFunction]);

  useHotkeys(
    'Escape',
    () => {
      if (isLast) {
        closeModalFunction();
      }
    },
    [isLast, closeModalFunction]
  );

  if (modal.removeLayout) {
    return (
      <div
        style={{ zIndex }}
        className={cn(
          !modal.fullScreen
            ? 'pb-[50px] min-w-full min-h-full'
            : 'w-full h-full',
          'fixed flex left-0 top-0 bg-popover transition-all animate-fadeIn overflow-y-auto text-foreground',
          !isLast && '!overflow-hidden'
        )}
      >
        <div className={cn(modal.fullScreen && 'flex', 'relative flex-1')}>
          <div
            className={cn(
              modal.fullScreen
                ? 'flex flex-1'
                : 'absolute top-0 left-0 min-w-full min-h-full'
            )}
          >
            <div
              className={cn(
                modal.fullScreen ? 'w-full h-full flex-1' : 'mx-auto py-[48px]'
              )}
              {...(modal.size && { style: { width: modal.size } })}
            >
              {typeof modal.children === 'function'
                ? modal.children(closeModalFunction)
                : modal.children}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <CurrentModalContext.Provider value={{ id: modal.id }}>
      <div
        onClick={closeModalFunction}
        style={{ zIndex }}
        className={cn(
          'fixed flex left-0 top-0 min-w-full min-h-full bg-popover transition-all animate-fadeIn overflow-y-auto text-foreground',
          !modal.fullScreen && 'pb-[50px]'
        )}
      >
        <div className="relative flex-1">
          <div
            style={
              modal.top
                ? { paddingTop: modal.top, paddingBottom: modal.top }
                : {}
            }
            className={cn(
              'absolute min-w-full',
              !modal.fullScreen
                ? modal.top
                  ? ''
                  : 'min-h-full pt-[100px] pb-[100px]'
                : 'h-screen',
              modal.size && modal.height
                ? 'flex justify-center items-center'
                : 'top-0 left-0'
            )}
          >
            <div
              className={cn(
                !modal.removeLayout && 'gap-[40px] p-[32px]',
                'bg-card mx-auto flex flex-col w-fit rounded-[24px] relative',
                modal.size ? '' : 'min-w-[600px]',
                modal.fullScreen && 'h-full'
              )}
              {...((!!modal.size || !!modal.height || !!modal.maxSize) && {
                style: {
                  ...(modal.size ? { width: modal.size } : {}),
                  ...(modal.height ? { height: modal.height } : {}),
                  ...(modal.maxSize ? { maxWidth: modal.maxSize } : {}),
                },
              })}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center">
                <div className="text-[24px] font-[600] flex-1">
                  {modal.title}
                </div>
                {typeof modal.withCloseButton === 'undefined' ||
                modal.withCloseButton ? (
                  <div className="cursor-pointer">
                    <button
                      className="outline-none absolute end-[20px] top-[20px] mantine-UnstyledButton-root mantine-ActionIcon-root hover:bg-border cursor-pointer mantine-Modal-close mantine-1dcetaa"
                      type="button"
                      onClick={closeModalFunction}
                    >
                      <X width={16} height={16} />
                    </button>
                  </div>
                ) : null}
              </div>
              <div
                className={cn(
                  'whitespace-pre-line',
                  !!modal.height && !!modal.size && 'flex flex-1 flex-col'
                )}
              >
                {RenderComponent}
              </div>
            </div>
          </div>
        </div>
      </div>
    </CurrentModalContext.Provider>
  );
});

export const ModalManagerInner: FC = () => {
  const { closeModal, modalManager } = useModalStore(
    useShallow((state) => ({
      closeModal: state.closeById,
      modalManager: state.modalManager,
    }))
  );

  useEffect(() => {
    if (modalManager.length > 0) {
      document.querySelector('body')?.classList.add('overflow-hidden');
      Array.from(document.querySelectorAll('.blurMe') || []).map((p) =>
        p.classList.add('blur-xs', 'pointer-events-none')
      );
    } else {
      document.querySelector('body')?.classList.remove('overflow-hidden');
      Array.from(document.querySelectorAll('.blurMe') || []).map((p) =>
        p.classList.remove('blur-xs', 'pointer-events-none')
      );
    }
  }, [modalManager]);

  if (modalManager.length === 0) {
    return null;
  }

  return (
    <>
      <style>{`body, html { overflow: hidden !important; }`}</style>
      {modalManager.map((modal, index) => (
        <Component
          isLast={modalManager.length - 1 === index}
          key={modal.id}
          modal={modal}
          zIndex={200 + index}
          closeModal={closeModal}
        />
      ))}
    </>
  );
};
export const ModalManager: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <div>
      <ModalManagerEmitter />
      <ModalManagerInner />
      <div className="transition-all w-full">{children}</div>
    </div>
  );
};

const emitter = new EventEmitter();
export const showModalEmitter = (params: ModalManagerInterface) => {
  emitter.emit('show', params);
};

export const ModalManagerEmitter: FC = () => {
  const { showModal } = useModalStore(
    useShallow((state) => ({
      showModal: state.openModal,
    }))
  );

  useEffect(() => {
    emitter.on('show', (params: OpenModalInterface) => {
      showModal(params);
    });

    return () => {
      emitter.removeAllListeners('show');
    };
  }, []);
  return null;
};

export const DecisionModal: FC<{
  description: string;
  approveLabel: string;
  cancelLabel: string;
  onlyApprove: boolean;
  resolution: (value: boolean) => void;
}> = ({ description, cancelLabel, approveLabel, resolution, onlyApprove }) => {
  const { closeCurrent } = useModals();
  return (
    <div className="flex flex-col">
      <div className="max-w-[600px]">{description}</div>
      <div className="flex gap-[12px] mt-[16px]">
        <Button
          onClick={() => {
            resolution(true);
            closeCurrent();
          }}
        >
          {approveLabel}
        </Button>
        {!onlyApprove && (
          <Button
            onClick={() => {
              resolution(false);
              closeCurrent();
            }}
          >
            {cancelLabel}
          </Button>
        )}
      </div>
    </div>
  );
};

export const decisionModalEmitter = new EventEmitter();

export const areYouSure = ({
  title = 'Are you sure?',
  description = 'Are you sure you want to close this modal?' as any,
  approveLabel = 'Yes',
  cancelLabel = 'No',
} = {}): Promise<boolean> => {
  return new Promise<boolean>((newRes) => {
    decisionModalEmitter.emit('open', {
      title,
      description,
      approveLabel,
      cancelLabel,
      newRes,
    });
  });
};

export const DecisionEverywhere: FC = () => {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState({
    title: 'Are you sure?',
    description: '' as any,
    approveLabel: 'Yes',
    cancelLabel: 'No',
    onlyApprove: false,
  });
  const resolverRef = useRef<((value: boolean) => void) | undefined>(undefined);
  const resolvedRef = useRef(true);

  useEffect(() => {
    const handler = (params: any) => {
      resolverRef.current = params.newRes;
      resolvedRef.current = false;
      setContent({
        title: 'Are you sure?',
        description: '',
        approveLabel: 'Yes',
        cancelLabel: 'No',
        onlyApprove: false,
        ...params,
      });
      setOpen(true);
    };
    decisionModalEmitter.on('open', handler);
    return () => {
      decisionModalEmitter.off('open', handler);
    };
  }, []);

  const resolve = useCallback((value: boolean) => {
    if (!resolvedRef.current) {
      resolvedRef.current = true;
      resolverRef.current?.(value);
    }
    setOpen(false);
  }, []);

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          resolve(false);
        }
      }}
    >
      <AlertDialogContent className="max-w-[360px]">
        <AlertDialogHeader>
          <AlertDialogTitle>{content.title}</AlertDialogTitle>
          {content.description ? (
            <AlertDialogDescription>
              {content.description}
            </AlertDialogDescription>
          ) : null}
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col gap-2 sm:flex-col sm:justify-stretch sm:space-x-0">
          <AlertDialogAction
            onClick={() => resolve(true)}
            className="h-11 w-full text-base"
          >
            {content.approveLabel}
          </AlertDialogAction>
          {!content.onlyApprove && (
            <AlertDialogCancel
              onClick={() => resolve(false)}
              className="mt-0 h-11 w-full text-base"
            >
              {content.cancelLabel}
            </AlertDialogCancel>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export const useDecisionModal = () => {
  const open = useCallback(
    ({
      title = 'Are you sure?',
      description = 'Are you sure you want to close this modal?' as any,
      onlyApprove = false,
      approveLabel = 'Yes',
      cancelLabel = 'No',
      newRes = undefined as any,
    } = {}) => {
      return new Promise<boolean>((res) => {
        decisionModalEmitter.emit('open', {
          title,
          description,
          onlyApprove,
          approveLabel,
          cancelLabel,
          newRes: newRes || res,
        });
      });
    },
    []
  );

  return { open };
};
