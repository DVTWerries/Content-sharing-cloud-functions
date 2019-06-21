import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
// tslint:disable-next-line: no-implicit-dependencies
const cors = require('cors')({ origin: true });

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

exports.searchPosts = functions.https.onRequest((req, res) => {
    return cors(req, res, () => {
        if (req.method !== 'GET') {
            return res.status(404).json({
                message: 'Not allowed'
            })
        }

        if (req.query.searchTerm === '') {
            return res.status(200).json(JSON.stringify([]));
        }

        return admin.database().ref('/').once('value', (dbSnapshot) => {
            console.log('function v1');

            const allResultsArr: [{}] = [{}];
            allResultsArr.pop();

            dbSnapshot.forEach((userSnapshot) => {
                userSnapshot.child('/files').forEach((fileSnapshot) => {
                    let containsAllSearchTerms = true;
                    const postDescription = fileSnapshot.val().description;

                    for (const element of req.query.searchTerm.split(' ')) {
                        if (!postDescription.includes(element)) {
                            containsAllSearchTerms = false;
                            break;
                        }
                    }

                    if (containsAllSearchTerms) {
                        allResultsArr.push({
                            userid: userSnapshot.key,
                            userdisplayname: userSnapshot.val().displayName,
                            useremail: userSnapshot.val().email,
                            postid: fileSnapshot.key,
                            imagename: fileSnapshot.val().imageName,
                            postdescription: postDescription,
                            imageurl: fileSnapshot.val().imageUrl
                        });
                    }
                });
            });

            return res.status(200).json(JSON.stringify(allResultsArr));

        });

    }, (error: { code: number; message: any; }) => {
        res.status(error.code).json({
            message: `Something went wrong. ${error.message}`
        })
    })
})