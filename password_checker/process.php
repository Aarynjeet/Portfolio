<?php

if (!isset($_POST["password"])) {
    echo "ERROR";
    exit();
}

$password = $_POST["password"];

if (strlen($password) < 6) {
    echo "SHORT";
}
elseif (!preg_match('/[A-Z]/', $password)) {
    echo "NO_UPPER";
}
elseif (!preg_match('/[a-z]/', $password)) {
    echo "NO_LOWER";
}
elseif (!preg_match('/[0-9]/', $password)) {
    echo "NO_DIGIT";
}
elseif (!preg_match('/[^a-zA-Z0-9]/', $password)) {
    echo "NO_SYMBOL";
}
else {
    echo "OK";
}

?>