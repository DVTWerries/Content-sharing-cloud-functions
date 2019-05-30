import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript

admin.initializeApp();

export const storeMediaInfo = functions.storage.bucket().object().onFinalize((response) => {
    const url = `https://firebasestorage.googleapis.com/v0/b/${response.bucket}/o/${response.name!.replace('\/', '%2F')}?alt=media&token=${response.metadata!.firebaseStorageDownloadTokens}`;
    const path = response.id.split('/');
    admin.database().ref(path[1] + '/files').push({
        id: path[3],
        imageUrl: url
    });
});

export const storeUserInfo = functions.auth.user().onCreate((user) => {
    // tslint:disable-next-line: no-floating-promises
    admin.database().ref(user.uid).set({
        email: user.email,
        displayName: user.displayName
    });
});
