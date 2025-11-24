import { toast as sonnerToast } from 'sonner';

export function toastSuccess(message: string): void {
  sonnerToast.success(message, {
    duration: 4000,
  });
}

export function toastError(message: string): void {
  sonnerToast.error(message, {
    duration: 5000,
  });
}

export function toastInfo(message: string): void {
  sonnerToast.info(message, {
    duration: 4000,
  });
}

export function toastWarning(message: string): void {
  sonnerToast.warning(message, {
    duration: 4000,
  });
}

export function toastLoading(message: string): {
  dismiss: () => void;
  update: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
} {
  const toastId = sonnerToast.loading(message);

  return {
    dismiss: () => {
      sonnerToast.dismiss(toastId);
    },
    update: (
      newMessage: string,
      type: 'success' | 'error' | 'info' | 'warning' = 'success',
    ) => {
      sonnerToast[type](newMessage, {
        id: toastId,
      });
    },
  };
}
