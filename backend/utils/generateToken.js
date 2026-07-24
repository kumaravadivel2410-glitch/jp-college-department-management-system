import jwt from 'jsonwebtoken';

const generateToken = (id, role) => {
  const secret = process.env.JWT_SECRET || 'jp_college_secret_jwt_key_2026';
  return jwt.sign({ id, role }, secret, {
    expiresIn: '30d'
  });
};

export default generateToken;
