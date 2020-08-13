const admin = require('firebase-admin');

exports.FBAuth = (request, response, next) => {
    let idToken;
    if(request.headers.authorization){
        idToken = request.headers.authorization.split('Bearer ')[1];
    }
    else{
        console.error("No Token found");
        return response
                .status(403)
                .json({ error: 'Unauthorized'});
    }

    admin
        .auth()
        .verifyIdToken(idToken)
        .then(decodedToken => {
            request.user = decodedToken;
            console.log(decodedToken);
            return admin
                    .firestore()
                    .collection('users')
                    .where('userId', '==', request.user.uid)
                    .limit(1)
                    .get();
        })
        .then(data => {
            request.user.handle = data.docs[0].data().handle;
            request.user.imageUrl = data.docs[0].data().imageUrl;
            return next();
        })
        .catch(err => {
            console.error('Error while verifying token', err);
            return response
                    .status(403)
                    .json(err);
        });
};
