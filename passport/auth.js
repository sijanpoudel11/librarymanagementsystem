module.exports = {
  entureauthenticated: function(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    console.log("not authenticated redirect to dashboard");
    return res.redirect("/");
  },
  redirectdashboard: function(req, res, next) {
    if (req.isAuthenticated()) {
      console.log(" authenticated redirected to dashboard");
      return res.redirect("/dashboard");
    }
    return next();
  }
};
