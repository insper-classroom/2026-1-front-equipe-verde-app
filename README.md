# Calculadora Inteligente de Preços de Imóveis

## Sobre o Projeto

Esta aplicação é o frontend da plataforma de precificação de imóveis desenvolvida pela Equipe Verde.

O sistema permite que usuários informem características de um imóvel e obtenham uma estimativa de preço gerada por um modelo de Machine Learning treinado com dados históricos do mercado imobiliário.

A interface foi desenvolvida para ser intuitiva, responsiva e de fácil utilização, permitindo tanto a realização de predições quanto a visualização de métricas e análises do modelo.

---

## Funcionalidades

### Predição de Preços

O usuário pode informar características do imóvel, como:

* Bairro
* Área construída
* Qualidade do imóvel
* Classe da zona urbana
* Número de vagas de garagem
* Características construtivas
* Informações complementares

Após o envio dos dados, a aplicação consulta a API e retorna:

* Valor estimado do imóvel
* Faixa de preço sugerida
* Informações da inferência

---

### Dashboard Analítico

A plataforma também disponibiliza visualizações e métricas sobre:

* Distribuição de preços previstos
* Desempenho do modelo
* Estatísticas por bairro
* Perfil dos imóveis analisados
* Indicadores operacionais da API

---

## Tecnologias Utilizadas

### Frontend

* React 18
* Vite
* JavaScript (ES6+)

### Interface

* Tailwind CSS
* Lucide React

### Visualização de Dados

* Recharts

### Integração

* API REST desenvolvida em FastAPI

---

## Estrutura do Projeto

```text
src/
├── App.jsx          # Tela principal de predição
├── Dashboard.jsx    # Dashboard analítico
├── Root.jsx         # Gerenciamento de rotas/telas
├── main.jsx         # Inicialização da aplicação
└── index.css        # Estilos globais

public/

package.json
vite.config.js
tailwind.config.js
```

---

## Configuração do Ambiente

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_API_URL=http://localhost:8000
```

Em produção:

```env
VITE_API_URL=https://sua-api.com
```

---

## Instalação

### Clonar o Repositório

```bash
git clone <url-do-repositorio>
cd 2026-1-front-equipe-verde-app
```

### Instalar Dependências

```bash
npm install
```

---

## Executando em Desenvolvimento

```bash
npm run dev
```

A aplicação ficará disponível em:

```text
http://localhost:5173
```

---

## Build para Produção

```bash
npm run build
```

Os arquivos gerados ficarão disponíveis na pasta:

```text
dist/
```

---

## Comunicação com a API

A aplicação consome os endpoints disponibilizados pela API de Machine Learning.

Fluxo de funcionamento:

```text
Usuário
   │
   ▼
Frontend React
   │
   ▼
API FastAPI
   │
   ▼
Modelo de Machine Learning
   │
   ▼
Resultado da Predição
```

---

## Interface do Usuário

### Tela de Predição

Permite inserir informações do imóvel e solicitar uma estimativa de valor.

### Dashboard

Exibe indicadores e gráficos relacionados ao comportamento das predições realizadas pela plataforma.

---

## Objetivo Acadêmico

Este projeto foi desenvolvido como parte da Sprint de Ciência de Dados e Engenharia de Software do Insper, com foco na construção de uma solução completa de Machine Learning em produção, contemplando:

* Desenvolvimento do modelo preditivo
* Construção de API
* Interface Web
* Observabilidade
* Deploy em nuvem
* Integração contínua

---

## Equipe

* ESTHEFANNY SOUSA FARIAS
* EMANUEL BENÍCIO APOLINÁRIO POLIDO
* MATHEUS LUCIANO ALVES DE OLIVEIRA SILVA
* NICOLAS VOLF MARTINS DA SILVA
* FELIPE CAMÊLO DA SILVA SANCHEZ

Insper — 2026.1
