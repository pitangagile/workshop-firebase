## Firebase Workshop - Instruções e auxílios para rodar o projeto

### O escopo de aprendizado
- Trabalhar com o Cloud Firestore e Cloud Storage enviando dados e arquivos respectivamente
- Autenticar usuários utilizando Firebase Authentication
- Implantar o projeto utilizando Firebase Hosting
- Enviar notificações com o Firebase Cloud Messaging

### O que será necessário
##### 1) Instalar o NodeJS
- [https://github.com/nvm-sh/nvm](https://github.com/nvm-sh/nvm) (Linux e Mac) - Mais fácil para gerenciar as versões do NodeJS na máquina
- [https://nodejs.org/en/](https://nodejs.org/en/) (Windows, Linux e Mac)

##### 2) Instalar IDE para desenvolvimento
- [https://code.visualstudio.com/](https://code.visualstudio.com/)

##### 3) Instalar o NPM (Gerenciador de pacotes do NodeJS)
- [https://www.npmjs.com](https://www.npmjs.com)

##### 4) Uma conta Google para acessar o Firebase
- [https://console.firebase.google.com](https://console.firebase.google.com)

### Produtos do firebase utilizados no projeto
- Firebase Authentication para permitir que seus usuários façam login facilmente em seu aplicativo.
- Cloud Firestore para salvar dados estruturados na nuvem e receber notificação instantânea quando os dados forem alterados
- Cloud Storage para Firebase para salvar arquivos na nuvem
- Firebase Hosting para hospedar e disponibilizar seus ativos
- Firebase Cloud Messaging para enviar notificações push e exibir notificações no pop-up do navegador
- Firebase Cloud Function para implementar regras de backend que são mais customizadas

### Começando
##### 1) Criando o projeto no firebase
- Faça login no Firebase
- No console do Firebase, clique em Adicionar projeto e nomeie seu projeto do Firebase.
- Desmarque Ativar Google Analytics para este projeto
- Clique em Criar projeto 

##### 2) Adicionando app web Firebase ao projeto
- Clique no ícone da web </> para criar um novo app da web do Firebase
- Registre o app com um apelido e marque a caixa para também configurar o Firebase Hosting para esse app
- Clique em registrar app

##### 3) Ativando login do Google para o Firebase Authentication
- Localize a seção "criação" ou "build" do lado esquerdo do painel
- Clique em autenticação e na guia método de login
- Ative o provedor de login do Google e clique em Salvar
- Defina um nome público do app e escolha um e-mail de suporte
- Configure a tela de consentimento OAuth e adicione uma logo

##### 4) Ativando Firestore
- Localize a seção "criação" ou "build" do lado esquerdo do painel
- Clique em Firestore Database
- Clique em criar banco de dados
- Escolha o modo teste
- Defina a região onde os dados do Firestore serão armazenados

##### 5) Habilitando Cloud Storage
- Localize a seção "criação" ou "build" do lado esquerdo do painel
- Clique em Storage
- Clique em primeiros passos
- Clique em avançar
- A região do Cloud Storage é selecionada de acordo com a escolha do banco de dados Firestore
- Clique em concluído

##### 6) Habilitando Cloud Messaging (FCM)
- Localize a seção "criação" ou "build" do lado esquerdo do painel
- Clique na engrenagem
- Clique em configurações do projeto
- Clique na aba Cloud Messaging
- Clique em adicionar chave do servidor

##### 7) Instalando linha de comando do Firebase
- Execute o comando `npm -g install firebase-tools`
- Verifique se foi instalado `firebase --version`
- Autorize o cli `firebase login`

##### 8) Para rodar o projeto
- Navegue até a pasta do projeto
- Associe o app ao projeto `firebase use --add`
- Execute o app localmente `firebase serve --only hosting`
- A app deve estar disponível em [http://localhost:5000/](http://localhost:5000)

### Hora do código
##### 1) Autenticação
- Implementar login com o google e logout

##### 2) Listagem de despachos
- Implementar listagem de despachos

##### 3) Anexar uma assinatura a um despacho
- Implementar anexação de assinatura no despacho

##### 4) Configurar notificação
- Implementar configuracao de notificação

##### 5) Notificação de novos despachos com Cloud Function
- Implementar notificação de novos despachos

##### 6) Deploy da aplicação
- Implantar aplicação
# Utilizando Cloud Functions no Firebase

Para criação de uma Cloud Function no Firebase, é necessário termos instalados no projeto o módulo firebase-functions. Este módulo, juntamente com o módulo firebase-admin são instalados no momento do bootstrap do projeto.

Para acessarmos o Firestore na nossa Cloud Function, precisamos do módulo firebase-admin, para que seja possível instanciar as ferramentas do Firebase, como por exemplo, o banco de dados Firestore.

Em uma Cloud Function, existem vários "gatilhos" que podem startar a função. O que iremos usar, será um gatilho associado ao Firestore. Iremos "escutar" a collection de despachos e, toda vez que um novo registro for inserido nesta collection, a nossa Cloud Function será ativada. Com isso, na nossa Cloud Function, conseguimos enviar uma notificação para o responsável que um novo despacho foi inserido.

## Então:
1. Cloud Functions possuem vários gatilhos. Utilizaremos o firestore. Para mais gatilhos, é possível acessar a documentação: https://firebase.google.com/docs/functions
2. Na nossa Cloud Function, iremos notificar um novo despacho designado para um responsável. Toda vez que um despacho for inserido, a função irá disparar, recebendo o registro inserido no Firestore e assim, efetuarmos uma notificação para o responsável.

## Exemplo de uma Cloud Function que é ativada quando um novo documento em uma collection for inserido:

```
const functions = require('firebase-functions');
exports.minhaCloudFunction = functions.firestore
  .document('despachos/{docId}')
  .onCreate(async (snap, context) => {
    const dadoInserido = snap.data(); //Para acessar os dados inserido no Firestore
    //meu código aqui
  });
```

## Como testar as Cloud Functions na minha máquina?

Para testar as Cloud Functions e outros recursos do Firebase de forma local, precisamos configurar os emuladores. Quando iniciamos um novo projeto com o comando ```firebase init```, nós configuramos estes emuladores.

*Para rodar os emuladores:*
```firebase emulators:start```

*Para rodar os emuladores e ativar o debug:*
```firebase emulators:start --inspect-functions```

*Para rodar os emuladores, ativar o debug e salvar os dados gerados:*
Toda vez que rodamos o emulador, todos os dados são resetados, inclusive os do Firestore.
Para que não precisemos sempre recriar os dados, podemos rodar o comando a seguir:
```firebase emulators:start --import=./emulator-data --export-on-exit=./emulator-data```

No comando ```--export-on-exit=./emulator-data```, estamos dizendo para toda vez que nosso emulador for restartado ou sair, guarde os dados gerados naquela sessão na pasta emulator-data.

No comando ```--import=./emulator-data```, estamos dizendo para, ao iniciar o emulador, ele recupere os dados gravados na pasta emulator-data. Assim, nosso emulador vai iniciar com os dados gerados nos testes anteriores.

* Para usar o emulador, acesse o link: localhost:4000