'use client';

import type { CompanyImage } from '@/services/company/types';
import { useEffect, useRef, useState } from 'react';
import { getCurrentUser } from '@/services/auth/authService';
import {
  addCompanyImage,
  canManageCompany,
  deleteCompanyImage,
} from '@/services/company/companyService';
import { normalizeImageUrl } from '@/utils/Helpers';
import logger from '@/utils/logger';
import { toastError, toastSuccess } from '@/utils/toast';

type ImageManagerProps = {
  companyId: string;
  images: CompanyImage[];
  onImageAdded: () => void;
  onImageRemoved: () => void;
};

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

const MAX_IMAGES = 10;

export default function ImageManager({
  companyId,
  images,
  onImageAdded,
  onImageRemoved,
}: ImageManagerProps) {
  const [canManage, setCanManage] = useState<boolean | null>(null);
  const [isCheckingPermission, setIsCheckingPermission] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isRemoving, setIsRemoving] = useState<string | null>(null);
  const [isPrimary, setIsPrimary] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const checkPermission = async () => {
      setIsCheckingPermission(true);
      try {
        const userInfo = await getCurrentUser();

        if (!userInfo.organization) {
          setCanManage(false);
          setIsCheckingPermission(false);
          return;
        }

        const hasPermission = await canManageCompany(companyId);
        setCanManage(hasPermission);
      } catch (error) {
        logger.error({ error }, 'Error checking permission');
        setCanManage(false);
      } finally {
        setIsCheckingPermission(false);
      }
    };

    if (companyId) {
      checkPermission();
    }
  }, [companyId]);

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return 'Tipo de arquivo não permitido. Use apenas imagens (JPG, PNG, WEBP).';
    }

    if (file.size > MAX_FILE_SIZE) {
      return `Arquivo muito grande. Tamanho máximo: ${(MAX_FILE_SIZE / (1024 * 1024)).toFixed(0)}MB.`;
    }

    if (images.length >= MAX_IMAGES) {
      return `Limite de ${MAX_IMAGES} imagens atingido. Remova uma imagem antes de adicionar outra.`;
    }

    return null;
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const validationError = validateFile(file);
    if (validationError) {
      toastError(validationError);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    setIsUploading(true);
    try {
      await addCompanyImage(companyId, file, isPrimary);
      toastSuccess('Imagem adicionada com sucesso!');
      onImageAdded();

      setIsPrimary(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      const errorMessage
        = error instanceof Error ? error.message : 'Erro ao adicionar imagem';
      toastError(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteClick = (imageId: string) => {
    setShowConfirmDelete(imageId);
  };

  const handleDeleteCancel = () => {
    setShowConfirmDelete(null);
  };

  const handleDeleteConfirm = async (imageId: string) => {
    setIsRemoving(imageId);
    try {
      await deleteCompanyImage(companyId, imageId);
      toastSuccess('Imagem removida com sucesso!');
      onImageRemoved();
      setShowConfirmDelete(null);
    } catch (error) {
      const errorMessage
        = error instanceof Error ? error.message : 'Erro ao remover imagem';
      toastError(errorMessage);
    } finally {
      setIsRemoving(null);
    }
  };

  if (isCheckingPermission || canManage === false) {
    return null;
  }

  if (canManage === null) {
    return null;
  }

  const isLimitReached = images.length >= MAX_IMAGES;

  return (
    <div className="bg-card rounded-3xl shadow-xl p-6 sm:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-semibold text-card-foreground">
          Gerenciar Imagens
        </h2>
        <span className="text-sm text-muted-foreground">
          {images.length}
          {' '}
          /
          {MAX_IMAGES}
          {' '}
          imagens
        </span>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileSelect}
            disabled={isUploading || isLimitReached}
            className="hidden"
            id="image-upload-input"
            aria-label="Selecionar imagem para upload"
          />
          <label
            htmlFor="image-upload-input"
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 cursor-pointer ${
              isUploading || isLimitReached
                ? 'bg-muted text-muted-foreground cursor-not-allowed'
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
            }`}
          >
            {isUploading
              ? (
                  <>
                    <div
                      className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"
                      role="status"
                      aria-label="Enviando imagem"
                    >
                      <span className="sr-only">Enviando...</span>
                    </div>
                    <span>Enviando...</span>
                  </>
                )
              : (
                  <>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    <span>Adicionar Imagem</span>
                  </>
                )}
          </label>

          {isLimitReached && (
            <p className="text-sm text-muted-foreground">
              Limite de
              {' '}
              {MAX_IMAGES}
              {' '}
              imagens atingido. Remova uma imagem para adicionar
              outra.
            </p>
          )}

          {!isLimitReached && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isPrimary}
                onChange={e => setIsPrimary(e.target.checked)}
                disabled={isUploading}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary focus:ring-offset-0"
                aria-label="Marcar como imagem principal"
              />
              <span className="text-sm text-card-foreground">
                Marcar como imagem principal
              </span>
            </label>
          )}
        </div>
      </div>

      {images.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-card-foreground">
            Imagens Cadastradas
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {images.map(image => (
              <div
                key={image.id}
                className="relative group rounded-lg overflow-hidden border-2 border-border hover:border-primary transition-colors"
              >
                <img
                  src={normalizeImageUrl(image.url) || ''}
                  alt={`Imagem ${image.id}`}
                  className="w-full h-32 object-cover"
                  loading="lazy"
                />
                {image.is_primary && (
                  <div className="absolute top-2 left-2 px-2 py-1 bg-primary text-primary-foreground text-xs font-medium rounded z-10">
                    Principal
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => handleDeleteClick(image.id)}
                  disabled={isRemoving === image.id}
                  className="absolute top-2 right-2 w-8 h-8 bg-background/90 backdrop-blur-sm hover:bg-background border border-border hover:border-destructive rounded-full flex items-center justify-center shadow-md transition-all duration-200 hover:scale-110 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 z-10"
                  aria-label={`Remover imagem ${image.id}`}
                  title="Remover imagem"
                >
                  {isRemoving === image.id
                    ? (
                        <div
                          className="w-4 h-4 border-2 border-destructive border-t-transparent rounded-full animate-spin"
                          role="status"
                          aria-label="Removendo imagem"
                        >
                          <span className="sr-only">Removendo...</span>
                        </div>
                      )
                    : (
                        <svg
                          className="w-4 h-4 text-destructive"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2.5}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {showConfirmDelete && (
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-confirm-title"
          onClick={handleDeleteCancel}
        >
          {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */}
          <div
            className="bg-card rounded-2xl shadow-xl p-6 max-w-md w-full space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <h3
              id="delete-confirm-title"
              className="text-xl font-semibold text-card-foreground"
            >
              Confirmar Remoção
            </h3>
            <p className="text-muted-foreground">
              Tem certeza que deseja remover esta imagem? Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={handleDeleteCancel}
                className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
                aria-label="Cancelar remoção"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleDeleteConfirm(showConfirmDelete)}
                disabled={isRemoving === showConfirmDelete}
                className="px-4 py-2 rounded-lg border-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-destructive"
                aria-label="Confirmar remoção"
              >
                {isRemoving === showConfirmDelete ? 'Removendo...' : 'Remover'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
