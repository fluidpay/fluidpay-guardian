describe('My First Test', () => {
    it('Navigate around', () => {
        cy.visit(
            'http://localhost:3000/about?utm_source=api&utm_medium=facebook&utm_campaign=in_the_forest&utm_term=tos&utm_content=normal_stuff'
        );
        cy.contains('Home').click();
        cy.contains('About').click();
    });
});
