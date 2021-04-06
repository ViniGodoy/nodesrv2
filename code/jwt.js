const jwt = require('jwt-simple');
const passportJwt = require('passport-jwt');

const ExtractJwt = passportJwt.ExtractJwt;
const Strategy = passportJwt.Strategy;
const AnonymousStrategy = require('passport-anonymous').Strategy;

const SECRET = '8zhDPzuaZTn7C9DxL84aKo45UQintAeT';
const ISSUER = "PUCPR";

const params = {
    secretOrKey: SECRET,
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    ignoreExpiration: true,
    issuer: ISSUER
}

function clockTimestamp(date = new Date()) {
    return Math.floor(date.getTime() / 1000);
}

module.exports.createToken = (user) => {
    const DAYS = 10;

    let exp = new Date();
    exp.setDate(exp.getDate() + DAYS);

    const payload = {
        iss: ISSUER,
        iat: clockTimestamp(),
        exp,
        user: { id: user.id }
    };
    return jwt.encode(payload, SECRET);
}

module.exports.strategy = {}

module.exports.strategy.jwt = new Strategy(params, (payload, done) => {
    payload.user.id = parseInt(payload.user.id);
    done(null, payload.user);
});

module.exports.strategy.none = new AnonymousStrategy();