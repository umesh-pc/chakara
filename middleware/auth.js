module.exports = {
  ensureAuthenticated: (req, res, next) => {
    if (req.session && req.session.adminId) {
      return next();
    }
    // Set a flash or query message, or just redirect
    res.redirect('/admin/login?error=Unauthorized, please log in.');
  },
  forwardAuthenticated: (req, res, next) => {
    if (req.session && req.session.adminId) {
      return res.redirect('/admin/dashboard');
    }
    next();
  }
};
