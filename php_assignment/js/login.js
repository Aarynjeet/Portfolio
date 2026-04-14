/*
 * login.js — Email validation for the Memory Match login page
 * CS 1XD3 Server-side Assignment
 * Author: Aarynjeet Gill
 * Date:   2026-03-30
 */

document.addEventListener("DOMContentLoaded", function () {

    var form       = document.getElementById("login-form");
    var emailInput = document.getElementById("email");
    var dateInput  = document.getElementById("birthdate");
    var emailError = document.getElementById("email-error");
    var dateError  = document.getElementById("date-error");

    /**
     * Validate the email address.
     * Rules:
     *   - Must have characters before @
     *   - Must have @ symbol
     *   - Domain part must contain at least one dot
     *   - The dot must be surrounded by alphanumeric characters
     *     e.g. "a@b.c" passes, "a@.c" or "a@b." fail
     *
     * @param  {string} email - The value to validate
     * @return {string}       - Error message, or empty string if valid
     */
    function validateEmail(email) {
        email = email.trim();

        if (email.length === 0) {
            return "Email address is required.";
        }

        var atIndex = email.indexOf("@");

        // Must contain @
        if (atIndex === -1) {
            return "Email must contain an @ symbol.";
        }

        var localPart  = email.substring(0, atIndex);
        var domainPart = email.substring(atIndex + 1);

        // Local part must not be empty
        if (localPart.length === 0) {
            return "Email must have characters before the @.";
        }

        // Domain part must contain a dot separating alphanumeric characters
        // Regex: at least one alphanum, then a dot, then at least one alphanum
        var domainPattern = /[a-zA-Z0-9]\.[a-zA-Z0-9]/;
        if (!domainPattern.test(domainPart)) {
            return "Email domain must contain a dot between characters (e.g. name@domain.com).";
        }

        return ""; // valid
    }

    /**
     * Validate the birth date field.
     * @return {string} Error message or empty string
     */
    function validateDate() {
        if (!dateInput.value) {
            return "Birth date is required.";
        }
        return "";
    }

    // Live feedback as the user types in the email field
    emailInput.addEventListener("input", function () {
        var msg = validateEmail(emailInput.value);
        emailError.textContent = msg;
        if (msg) {
            emailInput.classList.add("input-error");
        } else {
            emailInput.classList.remove("input-error");
        }
    });

    // Live feedback on date field blur
    dateInput.addEventListener("blur", function () {
        var msg = validateDate();
        dateError.textContent = msg;
        if (msg) {
            dateInput.classList.add("input-error");
        } else {
            dateInput.classList.remove("input-error");
        }
    });

    // Block form submission if validation fails
    form.addEventListener("submit", function (event) {
        var emailMsg = validateEmail(emailInput.value);
        var dateMsg  = validateDate();

        emailError.textContent = emailMsg;
        dateError.textContent  = dateMsg;

        if (emailMsg) {
            emailInput.classList.add("input-error");
        } else {
            emailInput.classList.remove("input-error");
        }

        if (dateMsg) {
            dateInput.classList.add("input-error");
        } else {
            dateInput.classList.remove("input-error");
        }

        // Prevent submission if any error exists
        if (emailMsg || dateMsg) {
            event.preventDefault();

            // Focus the first invalid field
            if (emailMsg) {
                emailInput.focus();
            } else {
                dateInput.focus();
            }
        }
    });

});
