const { expect, assert } = require("chai");
const { ethers } = require("hardhat");
const { groth16, plonk } = require("snarkjs");

const wasm_tester = require("circom_tester").wasm;

const F1Field = require("ffjavascript").F1Field;
const Scalar = require("ffjavascript").Scalar;
exports.p = Scalar.fromString("21888242871839275222246405745257275088548364400416034343698204186575808495617");
const Fr = new F1Field(exports.p);

describe("HelloWorld", function () {
    this.timeout(100000000);
    let Verifier;
    let verifier;

    beforeEach(async function () {
        // deploy snarkjs-generated Solidity verifier smart-contract
        Verifier = await ethers.getContractFactory("HelloWorldVerifier");
        verifier = await Verifier.deploy();
        await verifier.deployed();
    });

    it("Circuit should multiply two numbers correctly", async function () {
        const circuit = await wasm_tester("contracts/circuits/HelloWorld.circom");

        const INPUT = {
            "a": 2,
            "b": 3
        }

        const witness = await circuit.calculateWitness(INPUT, true);

        // console.log(witness);

        assert(Fr.eq(Fr.e(witness[0]),Fr.e(1)));
        assert(Fr.eq(Fr.e(witness[1]),Fr.e(6)));

    });

    it("Should return true for correct proof", async function () {
        //[assignment] Add comments to explain what each line is doing

        // This generates the proof using input signals a=2, b=3, the witness generating wasm from the compiled circuit, and the zkey file (proving and verification keys)
        const { proof, publicSignals } = await groth16.fullProve({"a":"2","b":"3"}, "contracts/circuits/HelloWorld/HelloWorld_js/HelloWorld.wasm","contracts/circuits/HelloWorld/circuit_final.zkey");

        // Log first (and only) output signal, in this case should be the product of the two input signals above
        console.log('2x3 =',publicSignals[0]);

        // Uses the proof and the output signals to generate the input to the "verifyProof" function
        // of our Solidity verifier smart-contract HelloWorldVerifier.sol, that was generated using snarkjs' solidityverifier function
        // Inputting this variable into the contract's verifyProof function would simulate a verification call
        const calldata = await groth16.exportSolidityCallData(proof, publicSignals);

        // The lines below transform the calldata array's hex values to BigInt representations and use them to verify the proof using the generated smart-contract

        // Parse the calldata string into a flattened array of BigInts transformed into strings
        const argv = calldata.replace(/["[\]\s]/g, "").split(',').map(x => BigInt(x).toString());

        // Create a, b, and c arrays as three arrays with the same elements as what the calldata string represented
        // or "unflatten" the array by transforming it into three arrays, where the hex values are represented as strings of BigInts
        // The last array (Input) is what remains of the flattened array after removing the first 8 elements, so just the 9th element
        const a = [argv[0], argv[1]];
        const b = [[argv[2], argv[3]], [argv[4], argv[5]]];
        const c = [argv[6], argv[7]];
        const Input = argv.slice(8);

        // Call the verifier smart-contract's verifyProof function with the values from calldata to simulate a convinced verifier or valid proof response
        expect(await verifier.verifyProof(a, b, c, Input)).to.be.true;
    });

    // Call the verifier smart-contract's verifyProof function with the 0 values to simulate an unconvinced verifier or invalid proof response
    it("Should return false for invalid proof", async function () {
        let a = [0, 0];
        let b = [[0, 0], [0, 0]];
        let c = [0, 0];
        let d = [0]
        expect(await verifier.verifyProof(a, b, c, d)).to.be.false;
    });
});


describe("Multiplier3 with Groth16", function () {

    this.timeout(100000000);
    let Verifier;
    let verifier;

    beforeEach(async function () {
        //[assignment] insert your script here
        Verifier = await ethers.getContractFactory("Multiplier3Verifier");
        verifier = await Verifier.deploy();
        await verifier.deployed();
    });

    it("Circuit should multiply three numbers correctly", async function () {
        //[assignment] insert your script here
        const circuit = await wasm_tester("contracts/circuits/Multiplier3.circom");

        const INPUT = {
            "a": 2,
            "b": 3,
            "c": 4
        }

        const witness = await circuit.calculateWitness(INPUT, true);

        // console.log(witness);

        assert(Fr.eq(Fr.e(witness[0]),Fr.e(1)));
        assert(Fr.eq(Fr.e(witness[1]),Fr.e(24)));
    });

    it("Should return true for correct proof", async function () {
        //[assignment] insert your script here
        const { proof, publicSignals } = await groth16.fullProve({"a":"2","b":"3","c":"4"}, "contracts/circuits/Multiplier3/Multiplier3_js/Multiplier3.wasm","contracts/circuits/Multiplier3/circuit_final.zkey");

        console.log('2x3x4 =',publicSignals[0]);

        const calldata = await groth16.exportSolidityCallData(proof, publicSignals);

        const argv = calldata.replace(/["[\]\s]/g, "").split(',').map(x => BigInt(x).toString());
        const a = [argv[0], argv[1]];
        const b = [[argv[2], argv[3]], [argv[4], argv[5]]];
        const c = [argv[6], argv[7]];
        const Input = argv.slice(8);

        expect(await verifier.verifyProof(a, b, c, Input)).to.be.true;
    });

    it("Should return false for invalid proof", async function () {
        //[assignment] insert your script here
        let a = [0, 0];
        let b = [[0, 0], [0, 0]];
        let c = [0, 0];
        let d = [0]
        expect(await verifier.verifyProof(a, b, c, d)).to.be.false;
    });
});


describe("Multiplier3 with PLONK", function () {

    this.timeout(100000000);
    let Verifier;
    let verifier;

    beforeEach(async function () {
        //[assignment] insert your script here
        Verifier = await ethers.getContractFactory("Multiplier3Verifier_plonk");
        verifier = await Verifier.deploy();
        await verifier.deployed();
    });

    it("Should return true for correct proof", async function () {
        //[assignment] insert your script here
        const { proof, publicSignals } = await plonk.fullProve({"a":"2","b":"3","c":"4"}, "contracts/circuits/Multiplier3_plonk/Multiplier3_js/Multiplier3.wasm","contracts/circuits/Multiplier3_plonk/circuit_final.zkey");

        console.log('2x3x4 =',publicSignals[0]);

        const calldata = await plonk.exportSolidityCallData(proof, publicSignals);

        const argv = calldata.replace(/["[\]\s]/g, "").split(',').map((x, i) => ((i > 0) ? BigInt(x).toString() : x));
        const calldataProof = argv[0];
        const calldataOutputs = argv.slice(1);

        expect(await verifier.verifyProof(calldataProof, calldataOutputs)).to.be.true;
    });

    it("Should return false for invalid proof", async function () {
        //[assignment] insert your script here
        let calldataProof = 0;
        let calldataOutputs = [0];
        expect(await verifier.verifyProof(calldataProof, calldataOutputs)).to.be.false;
    });
});
