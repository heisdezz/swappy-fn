import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  type PropsWithChildren,
  type ReactNode,
} from "react";
import { Toaster } from "sonner";
import { X } from "lucide-react";

interface ModalProps extends PropsWithChildren {
  actions?: any;
  actionName?: string;
  title?: ReactNode;
  isOpen?: boolean;
  onClose?: () => void;
  boxClassName?: string;
}

export interface ModalHandle {
  open: () => void;
  close: () => void;
}

const Modal = forwardRef<ModalHandle, ModalProps>(
  (
    {
      children,
      actions,
      actionName: _actionName,
      title,
      isOpen,
      onClose,
      boxClassName = "max-w-2xl",
    },
    ref,
  ) => {
    const modalRef = useRef<HTMLDialogElement>(null);

    useImperativeHandle(ref, () => ({
      open: () => {
        modalRef.current?.showModal();
      },
      close: () => {
        modalRef.current?.close();
      },
    }));

    useEffect(() => {
      if (isOpen === undefined) return;
      const dialog = modalRef.current;
      if (!dialog) return;

      if (isOpen && !dialog.open) {
        dialog.showModal();
      } else if (!isOpen && dialog.open) {
        dialog.close();
      }
    }, [isOpen]);

    const handleClose = () => {
      modalRef.current?.close();
      onClose?.();
    };

    return (
      <dialog
        ref={modalRef}
        className="modal modal-middle sm:modal-middle"
        onClose={onClose}
      >
        <Toaster theme="dark" richColors closeButton />
        <div
          className={`modal-box flex flex-col max-h-[90vh] p-6 rounded-3xl shadow-2xl relative bg-base-100 text-base-content border border-base-300 ${boxClassName}`}
        >
          <div className="flex items-center justify-between gap-4">
            {title &&
              (typeof title === "string" ? (
                <h3 className="font-extrabold text-lg text-base-content">
                  {title}
                </h3>
              ) : (
                <div className="flex-1">{title}</div>
              ))}
            <form method="dialog" className="ml-auto">
              <button
                type="button"
                className="btn btn-sm btn-circle btn-ghost text-base-content/60 hover:text-base-content cursor-pointer"
                onClick={handleClose}
              >
                <X size={20} />
              </button>
            </form>
          </div>
          {children && <div className="my-3 overflow-y-auto">{children}</div>}
          {actions && <div className="ml-auto pt-2">{actions}</div>}
        </div>
        <form method="dialog" className="modal-backdrop">
          <button type="button" onClick={handleClose}>
            close
          </button>
        </form>
      </dialog>
    );
  },
);

Modal.displayName = "Modal";

export default Modal;
export { Modal };
