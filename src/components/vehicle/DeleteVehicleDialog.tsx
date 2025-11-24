'use client';

import type { Vehicle } from '@/services/vehicle/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type DeleteVehicleDialogProps = {
  vehicle: Vehicle | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
};

export default function DeleteVehicleDialog({
  vehicle,
  open,
  onOpenChange,
  onConfirm,
}: DeleteVehicleDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open && !!vehicle} onOpenChange={onOpenChange}>
      <AlertDialogContent
        className="max-w-[calc(100%-2rem)] sm:max-w-md rounded-3xl sm:rounded-xl p-5 sm:p-6"
        aria-labelledby="delete-vehicle-title"
        aria-describedby="delete-vehicle-description"
      >
        <AlertDialogHeader className="text-left">
          <AlertDialogTitle id="delete-vehicle-title" className="text-xl sm:text-2xl">
            Confirmar Deleção
          </AlertDialogTitle>
          <div id="delete-vehicle-description" className="text-base space-y-3 pt-3">
            {vehicle && (
              <>
                <AlertDialogDescription className="text-foreground">
                  Tem certeza que deseja deletar o veículo
                  {' '}
                  {vehicle.name
                    ? (
                        <strong className="font-semibold">{vehicle.name}</strong>
                      )
                    : (
                        <strong className="font-semibold">(sem nome)</strong>
                      )}
                  ?
                </AlertDialogDescription>
                <div className="text-sm text-muted-foreground">
                  Placa:
                  {' '}
                  <span className="font-medium text-foreground">
                    {vehicle.plate || 'N/A'}
                  </span>
                </div>
              </>
            )}
            <div className="text-sm text-destructive font-medium">
              Esta ação não pode ser desfeita.
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-3 sm:gap-2 pt-4">
          <AlertDialogCancel
            aria-label="Cancelar deleção"
            className="w-full sm:w-auto h-11 sm:h-10 text-base"
          >
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            variant="outline"
            size="default"
            className="w-full sm:w-auto h-11 sm:h-10 text-base border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50"
            aria-label={
              vehicle
                ? `Confirmar deleção do veículo ${vehicle.name}`
                : 'Confirmar deleção'
            }
          >
            Confirmar Deleção
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
