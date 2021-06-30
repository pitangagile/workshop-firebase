'use strict';

/////////////////////////////////////////////////////////////
////////////////// AUTENTICACAO /////////////////////////////
/////////////////////////////////////////////////////////////

//exemplos firestore: https://firebase.google.com/docs/firestore/quickstart?hl=pt-br
//exemplo de login com o google: https://firebase.google.com/docs/auth/web/google-signin?hl=pt-br

// login
function signIn() {
  // login no firebase usando google como identity provider
  var provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithPopup(provider);
}

// logout da aplicacao
function signOut() {
  // logout do firebase
  firebase.auth().signOut();
}

// funcao para configurar autenticador do firebase
function initFirebaseAuth() {
  // registrando funcao de callback para observar mudanca de estado da autenticacao
  firebase.auth().onAuthStateChanged(authStateObserver);
}

// Dispara quando o estado da autenticacao eh modificado (login/logout)
function authStateObserver(user) {
  if (user) { // usuario esta autenticado
    // armazena nome e foto do usuario autenticado
    var profilePicUrl = getProfilePicUrl();
    var userName = getUserName();

    // Define informacoes do usuario autenticado na interface da aplicacao
    userPicElement.style.backgroundImage = 'url(' + addSizeToGoogleProfilePic(profilePicUrl) + ')';
    userNameElement.textContent = userName;

    // Exibe botao de logout e infos do usuario
    userNameElement.removeAttribute('hidden');
    userPicElement.removeAttribute('hidden');
    signOutButtonElement.removeAttribute('hidden');

    // Esconde o botao de login.
    signInButtonElement.setAttribute('hidden', 'true');

    // tenta recuperar os despachos
    loadDispatches();
    
    // Salva usuario e token.
    saveUserAndDeviceToken();

  } else { // Usuario deslogado
    // Esconde nome, foto e botao de logout
    userNameElement.setAttribute('hidden', 'true');
    userPicElement.setAttribute('hidden', 'true');
    signOutButtonElement.setAttribute('hidden', 'true');

    // Apaga dados de despachos da tabela caso existam
    eraseDataFromTable();

    // Mostra botao de login
    signInButtonElement.removeAttribute('hidden');
  }
}

/////////////////////////////////////////////////////////////
////////////////// FIM AUTENTICACAO /////////////////////////
/////////////////////////////////////////////////////////////


/////////////////////////////////////////////////////////////
////////////////// FUNCOES AUXILIARES ///////////////////////
/////////////////////////////////////////////////////////////
// recupera imagem do usuario autenticado
function getProfilePicUrl() {
  return firebase.auth().currentUser.photoURL || '/images/profile_placeholder.png';
}

// recupera nome do usuario autenticado 
function getUserName() {
  return firebase.auth().currentUser.displayName;
}


// recupera uid do usuario autenticado
function getUid() {
  try {
    return firebase.auth().currentUser.uid;
  } catch (error) {
    return null;
  }
}

// retorna verdadeiro caso o usuario esteja autenticado
function isUserSignedIn() {
  return !!firebase.auth().currentUser;
}

/////////////////////////////////////////////////////////////
////////////////// FIM FUNCOES AUXILIARES ///////////////////
/////////////////////////////////////////////////////////////

// firebase.firestore.FieldValue.serverTimestamp()

// carrega historico de despachos e escuta novos despachos cadastrados.
function loadDispatches() {
  // query para listar despachos
  var query = firebase.firestore()
                  .collection('despachos')
                  .where('responsavel', '==', getUid())
                  // .orderBy('timestamp', 'desc')
                  // .limit(1);
  
  // query para escutar collection de despachos
  query.onSnapshot(function(snapshot) {
    snapshot.docChanges().forEach(function(change) {
      if (change.type === 'removed') {
        deleteDispatch(change.doc.id);
      } else {
        var dispatch = change.doc.data();
        displayDispatch(change.doc.id, dispatch.citado, dispatch.status, dispatch.endereco, dispatch.foto_comprovacao);
      }
    });
  });
}

// Salva imagem de comprovacao do despacho
function saveDispatchImage(file) {
  
}

// Salva usuario e token 
function saveUserAndDeviceToken() {

}

// Solicita permissao para o envio de notificacoes
function requestNotificationsPermissions() {
  
}

// Funcao disparada ao ser selecionada uma imagem para upload
function onMediaFileSelected(event) {
  event.preventDefault();
  var file = event.target.files[0];

  // Checa se o arquivo eh uma imagem
  if (!file.type.match('image.*')) {
    var data = {
      message: 'Você só pode selecionar imagens',
      timeout: 2000
    };
    signInSnackbarElement.MaterialSnackbar.showSnackbar(data);
    return;
  }
  // Checa se o usuario esta autenticado
  if (checkSignedInWithMessage()) {
    saveDispatchImage(file);
  }
}

// Retorna verdadeiro caso o usuario esteja autenticado, em caso falso apresenta uma mensagem
function checkSignedInWithMessage() {
  // Return true if the user is signed in Firebase
  if (isUserSignedIn()) {
    return true;
  }

  // Mostra mensagem utilizando um toast.
  var data = {
    message: 'Você precisa estar autenticado',
    timeout: 2000
  };
  signInSnackbarElement.MaterialSnackbar.showSnackbar(data);
  return false;
}

// Resets the given MaterialTextField.
function resetMaterialTextfield(element) {
  element.value = '';
  element.parentNode.MaterialTextfield.boundUpdateClassesHandler();
}

// Adds a size to Google Profile pics URLs.
function addSizeToGoogleProfilePic(url) {
  if (url.indexOf('googleusercontent.com') !== -1 && url.indexOf('?') === -1) {
    return url + '?sz=150';
  }
  return url;
}

// Deleta um despacho
function deleteDispatch(id) {
  var row = document.getElementById(id);
  row.remove();
}

function eraseDataFromTable() {
  const tBody = document.getElementById('myTBody');
  tBody.innerHTML = '';
}

function uploadSignature(id) {
  selectedElement = id;
  document.getElementById('mediaCapture_'+id).click();
}

// insere linha na tabela de despachos
function createAndInsertRow(id, citado, status, endereco) {
  const tBody = document.getElementById('myTBody');
  const dispatch = { id, citado, status };
  var row = '<tr id="' + id + '">' +
            '<td class="mdl-data-table__cell--non-numeric identificador"></td>' +
            '<td class="mdl-data-table__cell--non-numeric citado"></td>' +
            '<td id="status_' + id + '" class="mdl-data-table__cell--non-numeric status"></td>' +
            '<td>' + 
              '<a id="submit" style="cursor: pointer;" onclick="openDetailsModal(\''+ id + '\')">'+
                'Detalhes' +
              '</a>' + 
              '<label id="endereco_' + id +'" style="display: none"></label>' + 
              '<label id="assinatura_'+ id+ '" style="display: none"></label>' +
            '</td>' +
            '<td>' +
              '<input hidden id="mediaCapture_'+ id +'" type="file" accept="image/*" capture="camera" onchange="onMediaFileSelected(event)">' +
                '<a id="submitImage" onclick="uploadSignature(\''+ id +'\')" title="Anexar imagem de comprovação" style="cursor: pointer;">' +
                  'Anexar Assinatura'
                '</a>' +
            '</td>' +
          '</tr>';
  
  tBody.insertAdjacentHTML('beforeEnd', row);

  return document.getElementById(id);
}

// Mostra despachos na tela (tabela)
function displayDispatch(id, citado, status, endereco, foto_comprovacao) {
  var row = document.getElementById(id) || createAndInsertRow(id, citado, status);
  row.getElementsByClassName('identificador')[0].innerHTML = id;
  row.getElementsByClassName('citado')[0].innerHTML = citado;
  row.getElementsByClassName('status')[0].innerHTML = status;
  document.getElementById('endereco_' + id).innerHTML = endereco;
  document.getElementById('assinatura_' + id).innerHTML = foto_comprovacao;
}

// Checa as importacoes do sdk do firebase
function checkSetup() {
  if (!window.firebase || !(firebase.app instanceof Function) || !firebase.app().options) {
    window.alert('Erro no SDK do firebase');
  }
}

// Exibe o modal com os detalhes do despacho
function openDetailsModal(id) {
  var row = document.getElementById(id);
  var citado = row.getElementsByClassName('citado')[0].innerHTML
  var status = row.getElementsByClassName('status')[0].innerHTML
  var assinatura = document.getElementById('assinatura_' + id).innerHTML;
  var endereco = document.getElementById('endereco_' + id).innerHTML;

  var dialog = document.querySelector('dialog');
  if (! dialog.showModal) {
    dialogPolyfill.registerDialog(dialog);
  }
  document.getElementById('citado').innerText = "Citado: " + citado;
  document.getElementById('status').innerText = "Status: " + status;
  if (assinatura !== 'undefined') {
    document.getElementById('assinatura').innerText = "Assinatura";
    document.getElementById('assinatura').href = assinatura.replace('&amp;', '&');
  }

  if (endereco !== 'undefined') {
    document.getElementById('endereco').innerText = "Ir para o mapa";
    document.getElementById('endereco').href = 'https://www.google.com/maps/dir/?api=1&travelmode=driving&layer=traffic&destination=' + endereco;
  }
  
  dialog.showModal();
  dialog.querySelector('.close').addEventListener('click', function() {
    dialog.close();
  });
}

// Checa se o firebase foi importado corretamente
checkSetup();

var selectedElement = null;
var userPicElement = document.getElementById('user-pic');
var userNameElement = document.getElementById('user-name');
var signInButtonElement = document.getElementById('sign-in');
var signOutButtonElement = document.getElementById('sign-out');
signOutButtonElement.addEventListener('click', signOut);
signInButtonElement.addEventListener('click', signIn);


// Inicializa a autenticacao do firebase
initFirebaseAuth();

// Carrega despachos e fica escutando novos
loadDispatches();
