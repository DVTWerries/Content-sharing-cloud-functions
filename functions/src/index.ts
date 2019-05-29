import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript

admin.initializeApp();

export const helloWorld = functions.storage.bucket().object().onFinalize(
    response => {
        const url = `https://firebasestorage.googleapis.com/v0/b/${response.bucket}/o/${response.name!.replace('/', '%2F')}?alt=media&token=${response.metadata!.firebaseStorageDownloadTokens}`;
        const user = response.id.split('/');
        admin.database().ref(user[1].replace(/\./g,'_')).push({
            id: user[3],
            imageUrl: url
        });
    }
);
