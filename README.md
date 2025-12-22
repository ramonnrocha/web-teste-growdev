# Clone ChatAI

Projeto desenvolvido para teste de vaga na empresa Growdev.

## 📋 Sobre

Clone ChatAI é uma aplicação web desenvolvida em React que permite criar e gerenciar salas de chat.

## 🛠️ Tecnologias

### Core

- **React** 19.2.0 - Biblioteca JavaScript para construção de interfaces
- **TypeScript** 5.9.3 - Superset do JavaScript com tipagem estática
- **Vite** 7.2.4 - Build tool e dev server

### Roteamento e Estado

- **React Router DOM** 7.11.0 - Roteamento client-side
- **TanStack React Query** 5.90.12 - Gerenciamento de estado de servidor e cache

### Estilização

- **Tailwind CSS** 4.1.18 - Framework CSS utility-first
- **Radix UI** - Componentes acessíveis e não-estilizados
- **Lucide React** - Biblioteca de ícones
- **class-variance-authority** - Gerenciamento de variantes de classes
- **clsx** e **tailwind-merge** - Utilitários para composição de classes

### Ferramentas de Desenvolvimento

- **Biome** - Linter e formatter (configurado com Ultracite)
- **Ultracite** - Configuração de formatação e linting

## 🏗️ Padrões de Projeto

- **Component-Based Architecture** - Componentes React reutilizáveis
- **Path Aliases** - Uso de `@/` para imports absolutos
- **TypeScript Strict Mode** - Tipagem rigorosa habilitada
- **Server State Management** - React Query para dados do servidor
- **Utility-First CSS** - Estilização com Tailwind CSS

## 🚀 Setup e Instalação

### Pré-requisitos

- Node.js (versão 18 ou superior)
- npm ou yarn

### Instalação

1. Clone o repositório:

```bash
git clone <url-do-repositorio>
cd web
```

2. Instale as dependências:

```bash
npm install
```

3. Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`

## 📜 Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Gera build de produção
- `npm run preview` - Preview do build de produção

## 📁 Estrutura do Projeto

```
src/
├── components/     # Componentes reutilizáveis
│   └── ui/        # Componentes de UI (shadcn/ui)
├── pages/         # Páginas da aplicação
├── lib/           # Utilitários e helpers
├── app.tsx        # Componente raiz com rotas
└── main.tsx       # Entry point
```

## ⚙️ Configuração

- **Path Aliases**: Configurado em `vite.config.ts` e `tsconfig.json` para usar `@/` como alias para `./src`
- **Linting**: Biome configurado com extensões Ultracite para React e core
- **Tailwind**: Configurado via plugin do Vite
