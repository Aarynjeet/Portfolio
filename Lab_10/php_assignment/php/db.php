<?php
/*
 * db.php — Database connection helper
 * CS 1XD3 Server-side Assignment
 * Author: Aarynjeet Gill
 * Date:   2026-03
 *
 * Returns a PDO connection to the MySQL database.
 * Uses prepared statements throughout the app for security.
 * Throws an exception on connection failure.
 *
 * IMPORTANT: Replace the credentials below with your
 * actual cs1xd3 server credentials before uploading.
 */

/**
 * Open and return a PDO database connection.
 *
 * @return PDO  A connected PDO instance with error mode set to exceptions.
 * @throws PDOException on connection failure.
 */
function getDB() {
    // -------------------------------------------------------
    // Replace these with your actual server credentials
    $host   = "localhost";
    $dbName = "gilla156_db";
    $user   = "gilla156_local";
    $pass   = "KRFI1A&Z";
    // -------------------------------------------------------

    $dsn = "mysql:host={$host};dbname={$dbName};charset=utf8mb4";

    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ];

    return new PDO($dsn, $user, $pass, $options);
}
