// generate-jwt.js
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'GCbh4M3h+dDoF97l/REn0nzQDuF6ETGM3LVytJYsc0N3p4iwTV+1kqRUkvbl8IxL4HigTMEVe3sR8d6KAPPv9A==';
const ADMIN_USER_ID = '683bede9-bed2-4ab5-8f89-f4f8f5158ebd';

const payload = {
  sub: ADMIN_USER_ID,
  role: 'admin', // Assuming 'admin' role is checked by the Edge Function
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + (60 * 60) // Token expires in 1 hour
};

const token = jwt.sign(payload, JWT_SECRET, { algorithm: 'HS256' });

console.log(token);
