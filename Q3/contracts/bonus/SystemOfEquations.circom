pragma circom 2.0.0;

include "../../node_modules/circomlib/circuits/comparators.circom";
include "../../node_modules/circomlib-matrix/circuits/matMul.circom"; // hint: you can use more than one templates in circomlib-matrix to help you

template SystemOfEquations(n) { // n is the number of variables in the system of equations
    signal input x[n]; // this is the solution to the system of equations
    signal input A[n][n]; // this is the coefficient matrix
    signal input b[n]; // this are the constants in the system of equations
    signal output out; // 1 for correct solution, 0 for incorrect solution

    // [bonus] insert your code here

    component mm = matMul(n, n, 1);

    for (var i=0; i < n; i++) {
        for (var j=0; j < n; j++) {
            mm.a[i][j] <== A[i][j];
        }
        mm.b[i][0] <== x[i];
    }

    component isE[n];

    var result = 0;

    for (var k=0; k < n; k++) {
        isE[k] = IsEqual();
        isE[k].in[0] <== mm.out[k][0];
        isE[k].in[1] <== b[k];
        result += (1 - isE[k].out);
    }

    signal inv;
    inv <-- result!=0 ? 1/result : 0;

    out <== -result*inv + 1;

}

component main {public [A, b]} = SystemOfEquations(3);
