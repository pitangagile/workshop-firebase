const functions = require('firebase-functions');
const fetch = require('isomorphic-fetch');
const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();

//notifica usuário quando um novo despacho é criado pela primeira vez. Esta função é ativada quando um novo despacho é inserido no Firestore.
exports.notify = //sua funcao aqui


async function sendNotification(responsibleUser) {
  //No firestore: Coleta o usuário referenciado no campo responsibleUser

  const fetchConfigs = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': '' //seu token aqui
    },
    body: JSON.stringify({
      notification: {
        "title": "Novo despacho!",
        "body": "Você tem um novo despacho disponível para visualização",
        "click_action": "http://localhost:5000"
      },
      to: '' //token do usuario
    })
  };
  return fetch('https://fcm.googleapis.com/fcm/send', fetchConfigs);
}