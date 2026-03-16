import bcrypt from 'bcryptjs';
const password = 'admin123';
const hash = bcrypt.hashSync(password, 10);
console.log('---START_HASH---');
console.log(hash);
console.log('---END_HASH---');
console.log('Verification Success:', bcrypt.compareSync(password, hash));
