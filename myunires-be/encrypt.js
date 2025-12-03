import bcrypt from "bcrypt";

const password = "123456"; 

// Jumlah "salt rounds", makin besar makin aman tapi lebih lambat
const saltRounds = 10;

bcrypt.hash(password, saltRounds).then((hash) => {
  console.log("Password asli:", password);
  console.log("Hasil hash bcrypt:", hash);
});
