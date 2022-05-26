import {connectDB, DATA_STORE} from "../helpers/db";

const sessionId = 'aksdjakslfjsa';

describe('My First Test', () => {
    before(() => {
        cy.intercept('**/api/guardian/session', {
            data: {
                session_id: sessionId
            }
        })
    })
    it('Navigate around', () => {
        cy.visit(
            'http://localhost:3000/about?utm_source=api&utm_medium=facebook&utm_campaign=in_the_forest&utm_term=tos&utm_content=normal_stuff'
        );

        cy.contains('Home').click();
        cy.contains('About').click();

        connectDB().then(async (db) => {
            const storedSessionId = await db.get(DATA_STORE, 'session_id')

            expect(storedSessionId).eq(sessionId)
        })
    });
});
