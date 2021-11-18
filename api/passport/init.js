var login = require('./login');

module.exports = function(passport){
    // Setting up Passport Strategies for Login and SignUp/Registration
    login(passport);

}