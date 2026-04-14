function doArithmetic() {
    let num1 = Number(document.getElementById("num1").value);
    let num2 = Number(document.getElementById("num2").value);
    let op = document.getElementById("operation").value;
    let result = 0;

    if (op === "+") {
        result = num1 + num2;
    } else if (op === "-") {
        result = num1 - num2;
    } else if (op === "*") {
        result = num1 * num2;
    } else if (op === "/") {
        result = num1 / num2;
    } else if (op === "%") {
        result = num1 % num2;
    }

    document.getElementById("result").value = result;
}

document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("num1").addEventListener("input", doArithmetic);
    document.getElementById("num2").addEventListener("input", doArithmetic);
    document.getElementById("operation").addEventListener("change", doArithmetic);
    doArithmetic();
});