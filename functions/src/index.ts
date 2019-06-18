import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript

admin.initializeApp();

export const storeMediaInfo = functions.storage.bucket().object().onFinalize((response) => {
    const url = `https://firebasestorage.googleapis.com/v0/b/${response.bucket}/o/${response.name!.replace('\/', '%2F')}?alt=media&token=${response.metadata!.firebaseStorageDownloadTokens}`;
    const path = response.id.split('/');

    // tslint:disable-next-line: no-floating-promises
    admin.database().ref(`${path[1]}/files/${path[2].split('.')[0]}`).update({
        id: path[2].split('.')[0],
        imageName: path[2],
        imageUrl: url,
        fileSize: response.size,
        fileExtention: path[2].split('.').pop(),
        contentType: response.contentType,
    });
});

export const deleteMediaInfo = functions.storage.bucket().object().onDelete((response) => {
    const path = response.id.split('/');
    // tslint:disable-next-line: no-floating-promises
    admin.database().ref(`${path[1]}/files/${path[2].split('.')[0]}`).remove();
});

export const storeUserInfo = functions.auth.user().onCreate((user) => {
    // tslint:disable-next-line: no-floating-promises
    admin.database().ref(user.uid).set({
        email: user.email,
        displayName: user.displayName
    });
});
