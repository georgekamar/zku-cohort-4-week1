const fs = require("fs");
const solidityRegex = /pragma solidity \^\d+\.\d+\.\d+/

const verifierRegex = /contract Verifier/
const verifierRegexPlonk = /contract PlonkVerifier/

let content = fs.readFileSync("./contracts/HelloWorldVerifier.sol", { encoding: 'utf-8' });
let bumped = content.replace(solidityRegex, 'pragma solidity ^0.8.0');
bumped = bumped.replace(verifierRegex, 'contract HelloWorldVerifier');

fs.writeFileSync("./contracts/HelloWorldVerifier.sol", bumped);

// [assignment] add your own scripts below to modify the other verifier contracts you will build during the assignment

let multiplierContent = fs.readFileSync("./contracts/Multiplier3Verifier.sol", { encoding: 'utf-8' });
let multiplierBumped = multiplierContent.replace(solidityRegex, 'pragma solidity ^0.8.0');
multiplierBumped = multiplierBumped.replace(verifierRegex, 'contract Multiplier3Verifier');

fs.writeFileSync("./contracts/Multiplier3Verifier.sol", multiplierBumped);

let plonkMultiplierContent = fs.readFileSync("./contracts/Multiplier3Verifier_plonk.sol", { encoding: 'utf-8' });
let plonkMultiplierBumped = plonkMultiplierContent.replace(solidityRegex, 'pragma solidity ^0.8.0');
plonkMultiplierBumped = plonkMultiplierBumped.replace(verifierRegexPlonk, 'contract Multiplier3Verifier_plonk');

fs.writeFileSync("./contracts/Multiplier3Verifier_plonk.sol", plonkMultiplierBumped);
