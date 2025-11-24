# 🚗 ParkHub Frontend

O **ParkHub Frontend** é a interface web da plataforma, responsável por conectar motoristas e gestores a uma experiência moderna, eficiente e totalmente integrada com a API backend.

Este repositório contém a aplicação web construída em **React** com **TailwindCSS**, comunicando diretamente com o backend.

---

## 🛠️ Tecnologias Utilizadas

Este projeto foi construído utilizando:

- **React**
- **TailwindCSS**
- **Axios**
- **TypeScript**
- **Zod** (validator)
- **Vitest** (testing)

---

## 🚀 Começando

Siga as instruções abaixo para rodar o projeto em ambiente local.

### Pré-requisitos

- Node.js (>= 18)
- npm

> ⚠️ **Importante:** o frontend depende do backend estar rodando localmente.

---

## 📦 Instalação e Execução

### 1. Clone o repositório

```bash
git clone https://github.com/official-parkhub/park-hub-frontend
cd park-hub-frontend
```

### 2. Configure as Variáveis de Ambiente

Copie o arquivo `.env.example` para o `.env.local`:

```bash
cp .env.example .env.local
```

### 3. Instale as Dependências

```bash
npm install
```

### 4. Execute o projeto

```bash
npm run dev
```

A aplicação estará disponível para uso. Verifique a de uso URL através do seu terminal.

## Rodando os testes

### Testes unitários e de integração

Para rodar os testes unitários e de integração, utilize o comando:

```bash
npm run test
```

### Testes end-to-end (E2E)

Para rodar os testes end-to-end, utilize o comando:

```bash
npm run e2e
```

Necessita que o servidor de desenvolvimento esteja rodando para executar os testes E2E.

## 📜 Licença

Este projeto está licenciado sob a [MIT License](./LICENSE).
