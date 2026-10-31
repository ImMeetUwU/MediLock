const accountId= 4568
let accountemail="gh@123.in"
 accountPass="123"
accountcity="Jaipur"
let accountState="Bihar"

accountemail="rty@456.in"
accountPass="789"
accountcity="Bhagalpur"
/*
prefer not to use var due to problem in block and Functional Scope
*/
console.log(accountemail);

console.table([accountId, accountemail, accountPass, accountcity,accountState]);