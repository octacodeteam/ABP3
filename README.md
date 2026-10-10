<p align="center">
  <img src="https://github.com/user-attachments/assets/da2c22a6-1fee-4c20-8ffc-9aa337d1a9ea" alt="gifgithubatualizado">
</p>

<div align="center">
  <strong>🇧🇷 Português</strong>
  <span>&nbsp;&nbsp;|&nbsp;&nbsp;</span>
  <a href="./README.en.md">🇺🇸 English</a>
</div>

<br>

<p align="center">
  <a href="#objetivo">Objetivo do Projeto</a> |
  <a href="#sprints">Sprints</a> |
  <a href="#backlogArtefatos">Backlog & Artefatos</a> |
  <a href="#burndown">Burndown</a> |
  <a href="#visao">Visão do Produto</a> |
  <a href="#metodologia">Metodologia</a> |
  <a href="#autores">Autores</a> |
  <a href="#tecnologias">Tecnologias</a>
</p>

</br>

<span id="objetivo">

## 🎯 Objetivo do Projeto  

Desenvolver uma aplicação web interativa que permita a **agricultores e pesquisadores** visualizar e comparar **dados geoespaciais gratuitos de satélites**.  

O sistema terá como base um **mapa interativo**, onde o usuário poderá selecionar uma área de interesse e:  

- 📌 Listar satélites disponíveis para aquela região, incluindo **resolução espacial**, **temporal** e **variáveis** (ex.: NDVI, umidade do solo, temperatura da superfície).  
- 📊 Consultar e comparar **séries temporais de diferentes satélites** (ex.: NDVI do Sentinel-2 x Landsat-8) em gráficos lado a lado.  
- 🔗 Integrar-se aos serviços **STAC** (catálogo de coleções de imagens) e **WTSS** (séries temporais).  

O foco principal é oferecer uma **ferramenta simples, intuitiva e acessível**, que facilite a análise de dados geoespaciais e apoie a **tomada de decisão no setor agrícola**.  

</span>

<span id="sprints">

## 📅Sprints

| Links | Período | Status |
|:-----:|:----------:|:---------:|
| [Sprint 1](https://github.com/octacodeteam/ABP3/tree/sprint-1) | 16/09/2025 - 07/10/2025 | Concluído ✅|
| [Sprint 2](https://github.com/octacodeteam/ABP3/tree/sprint-2) | 13/10/2025 - 03/11/2025 | Concluído ✅|
| [Sprint 3](https://github.com/octacodeteam/ABP3/tree/sprint-3) | 06/11/2025 - 24/11/2025 | Concluído ✅|

</span>

<span id="backlogArtefatos">

## 🌲Backlog do Produto
<p align="center">

### Requisitos Funcionais

| ID | Descrição |
|-----------|----------------------------------------------------------------------------|
| 1 | Permitir que os usuários selecionem um ponto de interesse em um mapa interativo, preferencialmente utilizando coordenadas geográficas ou um clique direto. |
| 2 | O sistema deve retornar dinamicamente uma lista de satélites com dados gratuitos disponíveis para a área, detalhando suas resoluções espacial e temporal (ex: 10m, diário, semanal) e as variáveis geoespaciais oferecidas (como NDVI, EVI, temperatura da superfície, umidade do solo, etc.). |
| 3 | Um requisito central é a capacidade de comparação de dados, onde o usuário pode selecionar duas ou mais séries temporais de variáveis similares (ex: NDVI do Sentinel-2 e Landsat-8) para a mesma área, visualizando-as lado a lado em gráficos ou pequenas representações visuais. |
| 4 | A plataforma deve oferecer opções de filtragem por satélite, variável ou período, facilitando a navegação pelos dados e possibilitando a exportação dos metadados e dos dados brutos ou processados (se aplicável e permitido) para análise posterior. |

### Requisitos Não Funcionais

| ID | Descrição |
|-----------|----------------------------------------------------------------------------|
| 1 | A usabilidade será um requisito não funcional crítico, exigindo uma interface intuitiva, clara e de fácil navegação, mesmo para usuários sem experiência prévia em geoprocessamento. |
| 2 | O desempenho da aplicação deve ser otimizado para garantir o carregamento rápido do mapa e dos dados, bem como a interação fluida, mesmo com grandes volumes de informações geoespaciais. |
| 3 | A escalabilidade é outro ponto importante, para que a aplicação possa lidar com um número crescente de usuários e fontes de dados de satélite no futuro. |
| 4 | A confiabilidade é essencial, garantindo que os dados exibidos sejam precisos, atualizados e corretamente atribuídos às suas fontes originais. |

### Restrições do Projeto

| ID | Descrição |
|-----------|----------------------------------------------------------------------------|
| 1 | O uso exclusivo de dados de satélite disponíveis gratuitamente limita as fontes de informação a missões como Landsat, Sentinel, MODIS, entre outras. |
| 2 | O tempo disponível para o desenvolvimento pelos alunos também será um fator restritivo, exigindo uma definição clara do escopo para garantir a conclusão de um produto mínimo viável. |
| 3 | A disponibilidade de recursos computacionais e de armazenamento para o servidor pode ser uma restrição, caso seja necessária uma infraestrutura dedicada para processamento ou cache de dados. |


### Tasks - Sprint 1

| Índice | Título    | Pontuação | Responsável | Condição       | Link |
|--------|-----------|:---------:|-------------|----------------|------|
| 001 a 005 - GA  |Planejamento  |     3     | Toda a equipe                     | ✅ Concluído                       | [🔗 Ver](https://github.com/) |
| 006 a 010 - GA  |Planejamento  |     3     | Toda a equipe                     | ✅ Concluído                       | [🔗 Ver](https://github.com/octacodeteam/ABP3/blob/DOCS/ATA's/ATA%2018-09-25%20(2).pdf) |
| 011 - GA  |Documentação do backlog|    3     | Georgia              | ✅ Concluído                                  | [🔗 Ver](https://github.com/octacodeteam/ABP3/blob/DOCS/Backlog.pdf) |
| 012 - GA  |Criação e organização do trello|     5   | João Pedro    | ✅ Concluído                                  | [🔗 Ver](https://trello.com/b/XUPTasD9/octacode-3sem) | 
| 013 - IH  |Criação do protótipo no figma|     2     | Alisson       | ✅ Concluído                                  | [🔗 Ver](https://www.figma.com/design/q1W0mvIbWcwPwbUqHVlSwf/GeoInsight?node-id=0-1&p=f&t=EugiHkEg9QJdP4oz-0) |
| 014 - DW  |Desenvolver o cabeçalho e rodapé fixos da aplicação web|     5     | Alisson       | ✅ Concluído        | [🔗 Ver](https://github.com/octacodeteam/ABP3/commit/08f347fc7a610c200828901f679bfbbef4982dd2) |
| 015 - DW  |Criação da estrutura de pastas|     3     | Igor Lima| ✅ Concluído                                      | [🔗 Ver](https://github.com/octacodeteam/ABP3/commit/322b0d90c74c90d3ccff631a84aa0c2a9440abff) |
| 016 - TP  |Início da Migração do Consumo de API: de Python para TypeScript|     8     | Igor Lima | ✅ Concluído    | [🔗 Ver](https://github.com/octacodeteam/ABP3/commit/322b0d90c74c90d3ccff631a84aa0c2a9440abff) |
| 017 - GA  |Implementar a lógica para limpeza de campo|     3     | Georgia| ✅ Concluído                            | [🔗 Ver](https://github.com/octacodeteam/ABP3/commit/e15214b1d80725d43a339b9d4452abdfab25bd74) |
| 018 - DW  |Desenvolvimento placeholder|     2     | Gustavo |  ✅ Concluído                                         | [🔗 Ver](https://github.com/) |
| 019 - GA  |Pesquisar a documentação da API STAC|     2     | João Pedro |  ✅ Concluído                             | [🔗 Ver](https://github.com/) |
| 020 - GA  |Criação da planilha de TASKS| 2 | João Pedro | ✅ Concluído                                              | [🔗 Ver](https://github.com/) |
| 021 - DW  |Estruturar a função de chamada para a API STAC| 5 | Georgia | ✅ Concluído                               | [🔗 Ver](https://github.com/octacodeteam/ABP3/commit/14710351d926288a9302263d6318ee8dbd96250e) |
| 022 - DW  |Integrar Leaflet ao código| 5 | Alisson | ✅ Concluído                                                   | [🔗 Ver](https://github.com/octacodeteam/ABP3/commit/98cb469bd7b852d77ddc63660d8e893549168296) |
| 023 - DW  |Adicionar um marcador visual| 3 | Alisson | ✅ Concluído                                                 | [🔗 Ver](https://github.com/octacodeteam/ABP3/commit/98cb469bd7b852d77ddc63660d8e893549168296) |
| 024 - GA  |Criar burndown| 3 | João Pedro | ✅ Concluído                                                            | [🔗 Ver](https://github.com/) |
| 025 - DW  |Tratativa de erros na API| 5 | Alisson | ✅ Concluído                                                    | [🔗 Ver](https://github.com/octacodeteam/ABP3/commit/14710351d926288a9302263d6318ee8dbd96250e) |
| 026 - DW  |Implementar a renderização do mapa base| 5 | Georgia | ✅ Concluído                                      | [🔗 Ver](https://github.com/octacodeteam/ABP3/commit/f35cb7d7ecef29101dd85b596ac7d15ed48f806e) |
| 027 - DW  |Estilizar o mapa e os controles de zoom| 3 | Gustavo | ✅ Concluído                                      | [🔗 Ver](https://github.com/octacodeteam/ABP3/commit/14710351d926288a9302263d6318ee8dbd96250e) |
| 028 - DW  |Exibir a resolução espacial e temporal| 5 | Alisson | ✅ Concluído                                       | [🔗 Ver](https://github.com/octacodeteam/ABP3/commit/14710351d926288a9302263d6318ee8dbd96250e) |
| 029 - TP  |Implementação de graficos para comparação| 3 | Alisson | ✅ Concluído                                    | [🔗 Ver](https://github.com/octacodeteam/ABP3/commit/14710351d926288a9302263d6318ee8dbd96250e) |
| 030 - GA  |Criar a documentação inicial README| 3 | João Pedro | ✅ Concluído                                       | [🔗 Ver](https://github.com/) |
| 031 - GA  |Preparar o ambiente de apresentação da Sprint Review| 2 | João Pedro | ✅ Concluído                      | [🔗 Ver](https://github.com/) |
| 032 - DW  |Refinamento do CSS| 2 | Gustavo | ✅ Concluído                                                           | [🔗 Ver](https://github.com/octacodeteam/ABP3/commit/14710351d926288a9302263d6318ee8dbd96250e) |
| 033 - DW  |Adicionar busca por endereço| 3 | Igor | ✅ Concluído                                                    | [🔗 Ver](https://github.com/octacodeteam/ABP3/commit/0107505868f9f84029d1bea5debc6fdf918f4700) |
| 034 - DW  |Garantir que o projeto esteja estável| 8 | Gustavo | ✅ Concluído                                        | [🔗 Ver](https://github.com/) |
| 035 - IHC |Realizar testes de usabilidade da interface| 5 | Igor | ✅ Concluído                                     | [🔗 Ver](https://github.com/) |

### Tasks - Sprint 2

| Índice | Título    | Pontuação | Responsável | Condição       | Link |
|--------|-----------|:---------:|-------------|----------------|------|
| 036 a 040 - GA  |Planejamento Sprint 2  |     3     | Toda a equipe                                | ✅ Concluído                       | [🔗 Ver](https://github.com/) |
| 041 - TP |Ajustar a exibição dos dados na chamada da API |     3     | Alisson                     | ✅ Concluído                       | [🔗 Ver](https://github.com/octacodeteam/ABP3/commit/0cf7e7a31d820c179175d3254e910812b63a9a67) |
| 042 - TP |Estruturar a função de chamada para a API WTSS |     3     | Alisson                     | ✅ Concluído                       | [🔗 Ver](https://github.com/octacodeteam/ABP3/commit/0cf7e7a31d820c179175d3254e910812b63a9a67) |
| 043 - GA | Atualização do trello e quebra de tasks da 2° Sprint|     3     | Georgia Mantchev      | ✅ Concluído                       | [🔗 Ver](https://github.com/) |
| 044 - GA |Preparar o Github para 2° Sprint |     3     | João Pedro                                | ✅ Concluído                       | [🔗 Ver](https://github.com/) |
| 045 - GA |Preenchimento da planilha |     3     | Georgia Mantchev                                 | ✅ Concluído                       | [🔗 Ver](https://github.com/) |
| 046 - DW |Solucionar erro de uso  da API WTSS |     8     | Alisson, João, Igor, Georgia           | ✅ Concluído                       | [🔗 Ver](https://github.com/) |
| 046.1 - DW |Solucionar erro de uso  da API WTSS |     8     | Alisson, João, Georgia           | ✅ Concluído                       | [🔗 Ver](https://github.com/) |
| 047 - DW | Adicionar um botão "Limpar Filtros" que restaura a visualização original da lista. |     3     | Gustavo Hammes | ✅ Concluído | [🔗 Ver]([https://github.com/](https://github.com/octacodeteam/ABP3/commit/f50b17b77499b139c700b564f5cbc7a914a862ac)) |
| 047.1 - DW | Tratamento do WTSS para retornar dados |     5     | João Pedro | ✅ Concluído | [🔗 Ver](https://github.com/octacodeteam/ABP3/commit/8751bfa9271de258a0d321fb89f7d9d9e837359b) |
| 047.2 - DW | Ajuste WTSS e fazer gráfico |     3     | Gustavo Hammes, Igor | ✅ Concluído | [🔗 Ver](https://github.com/octacodeteam/ABP3/commit/9690ed4deb9150ff45a4567a5e367bacf1603cc8) |
| 048 - DW |Criação de página inicial|     3     | Gustavo Hammes                                    | ✅ Concluído                       | [🔗 Ver](https://github.com/octacodeteam/ABP3/commit/b81b6b7c6e6e48533f1f7b672dcbc71c929c29ee) |
| 049 - GA | Casos de Uso|     3     | Georgia Mantchev                                              | ✅ Concluído  | [🔗 Ver](https://github.com/octacodeteam/ABP3/commit/f6bedb8d9eefcb123ffbfe702b485cb61b2eb954) |
| 050 - GA | Diagrama de Classe |     3     | Georgia Mantchev                           | ✅ Concluído  | [🔗 Ver](https://github.com/octacodeteam/ABP3/commit/0388f549c8e6245aec2026c7971f5ba0adbcfa17) |
| 051 - GA |Diagrama de sequência|     3     | Georgia Mantchev                          | ✅ Concluído  | [🔗 Ver](https://github.com/octacodeteam/ABP3/commit/144510f695e9465a121a9511f6d2c3f8dcac152d) |
| 052 - TP | Função de exportar dados para planilha|     3     | Alisson, Igor                                 | ✅ Concluído  | [🔗 Ver](https://github.com/octacodeteam/ABP3/commit/86dfe36f0c53bb087f644999713141d8ee2f1b48) |
| 053 - GA | Testes e analise do site|     3     | João Pedro, Gustavo                                 | ✅ Concluído  | [🔗 Ver](https://github.com/) |
| 054 - GA | Gravar o vídeo sprint2                                                                    |     3     | João Pedro                                            | ✅ Concluído  | [🔗 Ver](https://youtu.be/iqorYPgTSvY) |

### Tasks - Sprint 3

| Índice | Título    | Pontuação | Responsável | Condição       | Link |
|--------|-----------|:---------:|-------------|----------------|------|
| 055 a 059 - GA  |Planejamento Sprint 3  |     3     | Toda a equipe                         | ✅ Concluído                       | [🔗 Ver](https://github.com/) |
| 60 - IHC  |Melhoria visual exportação dados  |     3     | Gustavo, Igor                    | ✅ Concluído                       | [🔗 Ver](https://github.com/octacodeteam/ABP3/commit/2cf696cb1ed69c4a510457bee9b75e01adf91405) |
| 61 - IHC  |Atualização na interface |     3     | Alisson                                   | ✅ Concluído                       | [🔗 Ver](https://github.com/octacodeteam/ABP3/commit/c7e0d56ba831c02bf2bd879b0314c8839652ad27) |
| 62 - GA  |Organizar trello  |     3     | Georgia                                           | ✅ Concluído                       | [🔗 Ver](https://trello.com/b/XUPTasD9/octacode-3sem) |
| 63 - GA  |Finalizar o GITHUB da 3° sprint  |     3     | João Pedro                         | ✅ Concluído                       | [🔗 Ver](https://github.com/) |
| 64 - DW  |Otimizaqção e melhoria visual  |     3     | Alisson                              | ✅ Concluído                       | [🔗 Ver](https://github.com/octacodeteam/ABP3/commit/c318231d8905ea8a0fe010a6d0f7af412669a29a) |
| 65 - GA  |Analisar quais tasks foram concluidas e marcar  |     3     | Georgia             | ✅ Concluído                       | [🔗 Ver](https://trello.com/b/XUPTasD9/octacode-3sem) |
| 66 - DW  |Revisão do codigo para subir  |     3     | Gustavo                               | ✅ Concluído                       | [🔗 Ver](https://github.com/) |
| 67 - GA  |Roteiro apresentação sprint 3°  |     3     | João Pedro                          | ✅ Concluído                       | [🔗 Ver](https://github.com/) |
| 68 - IHC |Adição de legendas para os atributos  |     3     |João Pedro                     | ✅ Concluído                       | [🔗 Ver](https://github.com/octacodeteam/ABP3/commit/e01c95dac2f9acb8f92ccd86910d206e313bb339) |
| 69 - IHC  |Teste de usabilidade |     3     | Igor, Georgia, Alisson                        | ✅ Concluído                       | [🔗 Ver](https://github.com/) |
| 70 - GA  |Subir o site |     3     | Gustavo                                                | ✅ Concluído                       | [🔗 Ver](https://github.com/) |
| 71 - GA  |Gravar o vídeo 3° sprint |     3     | João Pedro                                 | ✅ Concluído                       | [🔗 Ver](https://github.com/) |


</p>
</span>
<br>

<span id="burndown">

## 🔥Burndown

<p align="center">
  <img src="https://github.com/octacodeteam/ABP3/blob/main/assets/Burndown_Sprint1.png">
</p>

<p align="center">
  <img src="https://github.com/octacodeteam/ABP3/blob/main/assets/burndown_sprint2.jpg">
</p>

<p align="center">
  <img src="https://github.com/octacodeteam/ABP3/blob/main/assets/burndown_sprint3.png">
</p>

</span>
  
<br>

<span id="visao">

## 💡Sobre o Produto


## Passo a Passo para Configurar o Ambiente de Desenvolvimento

1. Clonar o Repositório
Primeiro, é preciso baixar o projeto do GitHub para a máquina local. Abra um terminal e rode o comando:

```bash
git clone <https://github.com/octacodeteam/ABP3.git>
```

Depois, entre na pasta do projeto:
```bash
cd ABP3 
```

2. Instalar as Dependências do Backend
O backend tem suas próprias dependências. Precisamos instalá-las.

### Navegue para a pasta do backend
```bash
cd backend
```
### Instale todas as dependências listadas no package.json
```bash
npm install
```

3. Instalar as Dependências do Frontend
Agora, fazemos o mesmo para o frontend, que também tem suas próprias dependências.

### Volte para a raiz do projeto e entre na pasta do frontend
```bash
cd ../frontend
```

### Instale todas as dependências listadas no package.json
```bash
npm install
```

## Resumo das Dependências 

O comando npm install vai instalar automaticamente tudo que está listado nos arquivos package.json. Para conhecimento, estas são as principais dependências que usamos:

### backend:

Dependências de produção:

express: Para criar o servidor web da API.

axios: Para fazer as chamadas para a API do INPE.

Dependências de desenvolvimento:

typescript: Para poder escrever o código em TypeScript.

ts-node-dev: Para rodar o servidor em modo de desenvolvimento, reiniciando automaticamente.

@types/express: Para o TypeScript entender os tipos do Express.

### frontend:

Dependências de produção:

leaflet: A biblioteca do mapa interativo.

Dependências de desenvolvimento:

vite: O servidor de desenvolvimento do frontend.

typescript: Para poder escrever o código em TypeScript.

@types/leaflet: Para o TypeScript entender os tipos do Leaflet.

@types/geojson: (Opcional, mas recomendado) Para o TypeScript entender o formato dos dados geográficos.

## Como Rodar o Projeto Completo
Depois de instalar tudo, serão necessários dois terminais abertos ao mesmo tempo:

Terminal 1 - Rodar o Backend:
```bash
cd backend
npm run dev
```

Você deve ver a mensagem Servidor backend rodando em http://localhost:3000.

Terminal 2 - Rodar o Frontend:
```bash
cd frontend
npm run dev
```

Você deve ver a mensagem do Vite com o endereço local, como Local: http://localhost:5173/.

Agora é só acessar o endereço do frontend (http://localhost:5173) no navegador para usar a aplicação.

</span>

<span id="metodologia">

## 📚 Metodologia  

O projeto está sendo desenvolvido com a **metodologia ágil**, utilizando o framework **Scrum**.  

- 📌 O trabalho é organizado em **sprints** (ciclos curtos de desenvolvimento).  
- 👥 O time realiza **reuniões rápidas (daily)** para alinhar o progresso.  
- 📝 As tarefas são organizadas no **backlog** e priorizadas pelo Product Owner.  
- ✅ Ao final de cada sprint há uma **review** para apresentar resultados e uma **retrospectiva** para melhorias.  

Essa abordagem garante **entregas contínuas, colaboração do time e adaptação às necessidades do cliente**.  

</span>

<span id="estorias-usuario">

## 👥 Estórias de Usuário

| ID  | Descrição |
|-----|-----------|
| 1   | Como agricultor, quero selecionar minha área no mapa para descobrir quais satélites possuem dados disponíveis, para acompanhar minha lavoura sem buscar manualmente em várias fontes. |
| 2   | Como agricultor, quero visualizar o NDVI (índice de vegetação) ao longo do tempo, para monitorar o desenvolvimento da plantação e identificar problemas como estresse hídrico. |
| 3   | Como agricultor, quero comparar séries temporais de diferentes satélites, para identificar qual oferece informações mais úteis para minha área. |
| 4   | Como pesquisador, quero acessar uma lista detalhada de satélites e variáveis (resolução, período, cobertura), para selecionar a fonte de dados mais adequada à minha pesquisa. |
| 5   | Como pesquisador, quero baixar ou exportar os metadados e séries temporais em formatos abertos, para realizar análises mais avançadas em ferramentas externas. |
| 6   | Como pesquisador, quero filtrar os dados por satélite, variável ou período de tempo, para focar apenas nas informações relevantes ao meu estudo. |
| 7   | Como usuário sem experiência, quero uma interface simples e intuitiva, para conseguir visualizar informações sobre satélites sem precisar de conhecimento técnico. |
| 8   | Como usuário geral, quero clicar em um ponto do mapa e receber resultados rápidos e claros, para entender rapidamente quais dados estão disponíveis para aquela região. |
| 9   | Como usuário geral, quero navegar de forma fluida no mapa e nos gráficos, para não ter dificuldades em usar a ferramenta. |
| 10  | Como usuário, quero que os dados exibidos sejam confiáveis e atualizados, para ter segurança nas análises e decisões. |


</span>

<br>

## 📋 Trello
<p align="center">
  <a href="https://trello.com/b/XUPTasD9/octacode-3sem" target="_blank">
    <img src="https://img.shields.io/badge/Trello-Octacode--Board-026AA7?style=for-the-badge&logo=trello&logoColor=white" alt="Trello Board"/>
  </a>
</p>


## 👨‍💻**Autores**

| Nome | Função | Github |
| :--------------: | :-----------: | :----------------------------------------------------------: |
| Alisson Franco Gritti | Time de Dev | <a href="https://github.com/alissonfatec"><img src="https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white"></a> |
| Georgia Mantchev de Figueiredo Alves do Santos | Product Owner | <a href="https://github.com/Mantchev13"><img src="https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white"></a> |
| Gustavo Henrique Ferreira Hammes | Time de Dev | <a href="https://github.com/GustavoHammes"><img src="https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white"></a> |
| Igor Santos Lima | Time de Dev | <a href="https://github.com/IgorSantosL"><img src="https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white"></a> |
| João Pedro Souza dos Anjos | Scrum Master | <a href="https://github.com/Shynj0"><img src="https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white"></a> |

<span id="tecnologias">

## 🔌**Tecnologias**
> [!NOTE]
> Estas foram as tecnologias utilizadas no desenvolvimento do projeto:

<h4 align="left">
  <img src="https://skillicons.dev/icons?i=html,css,react,figma,vscode,js,ts,postgres,mysql,git,github&perline=14">
</h4>
<br>
</span>
