# Assets do ParkHub

Este diretório contém todos os assets visuais utilizados na aplicação ParkHub.

## ⚠️ Status Atual

**Todas as imagens foram removidas.** Por favor, consulte `IMAGES_REQUIRED.md` na raiz do projeto para ver a lista completa de imagens que devem ser adicionadas.

## Estrutura de Diretórios Esperada

```
public/images/
├── parking/          # Imagens de estacionamentos
│   ├── modern-parking-garage-entrance.jpg      # OBRIGATÓRIO
│   ├── covered-parking-lot-with-cars.jpg       # Recomendado
│   ├── business-district-parking-structure.jpg # Opcional
│   └── street-level-parking-lot-with-trees.jpg # Opcional
└── logo/             # Logo e ícones do ParkHub
    ├── parkhub-logo.svg       # OBRIGATÓRIO
    └── parkhub-logo.png        # Opcional
```

## Uso no Next.js

No Next.js, arquivos em `public/` são servidos na raiz do site. Para usar as imagens:

```tsx
// Exemplo de uso em componentes
const example = (
  <>
    <img src="/images/logo/parkhub-logo.svg" alt="ParkHub Logo" />
    <img
      src="/images/parking/modern-parking-garage-entrance.jpg"
      alt="Estacionamento moderno"
    />
  </>
);
```

## Referências

- **Lista completa de imagens necessárias**: Ver `IMAGES_REQUIRED.md` na raiz do projeto
- **Diretrizes de marca e logo**: Ver `BRAND_GUIDELINES.md` na raiz do projeto
