/// <reference types="Cypress" />

context('Login and Logout', () => {
    it('sign form show', () => {
        cy.server();
        cy.route({
            method: 'GET',
            url: '/api/accessor',
            status: 401,
            response: {}
        }).as('firstCallAccessor');

        cy.visit('http://localhost:3000');
        cy.wait('@firstCallAccessor');
        cy.contains('Please login');

        cy.route({
            method: 'POST',
            url: '/api/login',
            status: 302,
            response: {}
        }).as('callLogin');
        cy.route({
            method: 'GET',
            url: '/api/accessor',
            status: 200,
            response: {"user": {"username": "user1", "displayName": "Authenticated User", "email": "a@b"}}
        }).as('secondCallAccessor');

        cy.get("[test-data='username']").type('profile');
        cy.get("[test-data='password']").type('123456');
        cy.get('[type=submit]').click();
        cy.wait('@callLogin');

        cy.wait('@secondCallAccessor');
        cy.contains('Authenticated User');


        cy.route({
            method: 'POST',
            url: '/api/logout',
            status: 302,
            response: {}
        }).as('callLogout');
        cy.route({
            method: 'GET',
            url: '/api/accessor',
            status: 401,
            response: {}
        }).as('thirdCallAccessor');

        cy.get("button.logout-button").click();

        cy.wait('@callLogout');
        cy.contains('Please login');
    });
});
