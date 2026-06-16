# Orçamentos

Aplicativo mobile feito com React Native + Expo para criar, gerenciar e acompanhar orçamentos (quotes) de produtos/serviços para clientes.

## Funcionalidades

- Listagem de orçamentos com filtro por status e ordenação (mais recentes, mais antigos, maior valor, menor valor)
- Criação e edição de orçamentos, com itens (descrição, quantidade, preço) e desconto percentual
- Detalhe do orçamento com cálculo automático do total
- Alteração de status do orçamento (`Rascunho`, `Enviado`, `Aprovado`, `Recusado`)
- Duplicação e exclusão de orçamentos
- Persistência local dos dados e dos filtros via `AsyncStorage`

## Tecnologias

- [Expo](https://docs.expo.dev/versions/v56.0.0/) (SDK 56)
- React 19 / React Native 0.85
- React Navigation (native stack)
- AsyncStorage para persistência local
- TypeScript

## Estrutura do projeto

```
src/
  components/   # Componentes de UI (Button, Input, QuoteCard, StatusBadge, EmptyState) e tema
  contexts/      # QuotesContext: estado global dos orçamentos e filtros
  screens/       # Listing, CreateEdit e Detail
  storage/       # Leitura/escrita no AsyncStorage
  types/         # Tipos compartilhados (QuoteDoc, QuoteItem, FilterState, etc.)
  utils/         # Helpers de moeda, data e geração de id
```

## Como executar

Pré-requisitos: Node.js e o app **Expo Go** (ou um emulador Android/iOS) instalados.

```bash
npm install
npm start
```

Outras opções:

```bash
npm run android   # abre no emulador/dispositivo Android
npm run ios       # abre no simulador iOS
npm run web       # abre no navegador
```
