const functions = require('firebase-functions');
const fetch = require('isomorphic-fetch');
const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();

//notifica usuário quando um novo despacho é criado pela primeira vez. Esta função é ativada quando um novo despacho é inserido no Firestore.
exports.notify = functions.firestore
  .document('despachos/{docId}')
  .onCreate(async (snap, context) => {
    //coleta o json do novo despacho inserido no firestore
    const newDispatch = snap.data();

    const { responsavel } = newDispatch;

    await sendNotification(responsavel);

    return 'Notificação enviada com sucesso';
  });


async function sendNotification(responsibleUser) {
  //No firestore: Coleta o usuário referenciado no campo responsibleUser
  const doc = await db.collection('users').doc(responsibleUser).get();
  const user = doc.data();
  const fetchConfigs = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'sua Key aqui'
    },
    body: JSON.stringify({
      notification: {
        "title": "Novo despacho!",
        "body": "Você tem um novo despacho disponível para visualização",
        "click_action": "http://localhost:5000"
      },
      to: user.token
    })
  };
  return fetch('https://fcm.googleapis.com/fcm/send', fetchConfigs);
}