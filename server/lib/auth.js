import i18next from 'i18next';

export const verifyAuth = async (req, reply, done) => {
  if (!req.signedIn) {
    req.flash('error', i18next.t('flash.users.authorizationError'));
    reply.code(401).redirect(302, '/');
    return done(new Error('Unauthorized'));
  }
  return done();
};

export const verifyUserCreator = async (req, reply, done) => {
  if (req.currentUser.id !== Number(req.params.id)) {
    req.flash('error', i18next.t('flash.users.accessError'));
    reply.code(403).redirect(302, '/users');
    return done(new Error('Forbidden'));
  }
  return done();
};

export const verifyTaskCreator = async () => {

};
