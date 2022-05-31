const sessionId = 'aksdjakslfjsa';

before(() => {
    cy.intercept('**/api/guardian/session', {
        data: {
            session_id: sessionId
        }
    })
})

describe('My First Test', () => {
    it('Navigate around', () => {
        cy.visit(
            '/about?utm_source=api&utm_medium=facebook&utm_campaign=in_the_forest&utm_term=tos&utm_content=normal_stuff'
        );

        cy.contains('Home').click();
        cy.get('h1').contains('Home');

        cy.contains('About').click();
        cy.get('h1').contains('About');
    });
});
