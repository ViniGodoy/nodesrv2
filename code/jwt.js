const jwt = require('jwt-simple');
const {ExtractJwt, Strategy} = require('passport-jwt');

const AnonymousStrategy = require('passport-anonymous');

const SECRET = 'c9226a7d-d3bb-403d-abac-9becce154a3c';
const ISSUER = 'PUCPR';

const params = {
    secretOrKey: SECRET,
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    ignoreExpiration: false,
    issuer: ISSUER
};

function clockTimestamp(date = new Date()) {
    return Math.floor(date.getTime() / 1000);
}

module.exports.createToken = function(user) {
    const DAYS = 10;

    const exp = new Date();
    exp.setDate(exp.getDate() + DAYS);

    const payload = {
        iss: ISSUER,
        iat: clockTimestamp(),
        exp: clockTimestamp(exp),
        user: {id: user.id}
    };
    return jwt.encode(payload, SECRET);
}

module.exports.strategy = {}

module.exports.strategy.jwt =
    new Strategy(params, (payload, done) => {
        payload.user.id = parseInt(payload.user.id);
        return done(null, payload.user);
    });

module.exports.strategy.none = new AnonymousStrategy();