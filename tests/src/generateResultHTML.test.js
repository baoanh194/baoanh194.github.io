const { generateResultHTML } = require('../../source/rabbitmq-analysis');

describe('generateResultHTML', () => {
    test('should generate correct HTML content for readiness', () => {
        expect.assertions(1);
        const readinessMessage = {
            isReady: true,
            message: 'Your RabbitMQ cluster is ready for migration to RabbitMQ 4.0!'
        };
        const analysisResults = [
            { criteria: 'Criteria 1', status: 'Pass', message: 'All good' },
            { criteria: 'Criteria 2', status: 'Pass', message: 'All good' },
            { criteria: 'Criteria 3', status: 'Pass', message: 'All good' }
        ];

        const result = generateResultHTML(readinessMessage, analysisResults);

        expect(result).toBe(
            '<div class="ready">Your RabbitMQ cluster is ready for migration to RabbitMQ 4.0!</div>' +
            '<br><table><tr><th>Criteria</th><th>Reason</th><th>Status</th></tr>' +
            '<tr><td>Criteria 1</td><td>All good</td><td>Pass</td></tr>' +
            '<tr><td>Criteria 2</td><td>All good</td><td>Pass</td></tr>' +
            '<tr><td>Criteria 3</td><td>All good</td><td>Pass</td></tr>' +
            '</table>'
        );
    });

    test('should generate correct HTML content for non-readiness', () => {
        expect.assertions(1);
        const readinessMessage = {
            isReady: false,
            message: 'Your RabbitMQ cluster is not ready for migration to RabbitMQ 4.0.'
        };
        const analysisResults = [
            { criteria: 'Criteria 1', status: 'Pass', message: 'All good' },
            { criteria: 'Criteria 2', status: 'Fail', message: 'Something is wrong' },
            { criteria: 'Criteria 3', status: 'Pass', message: 'All good' }
        ];

        const result = generateResultHTML(readinessMessage, analysisResults);

        expect(result).toBe(
            '<div class="not-ready">Your RabbitMQ cluster is not ready for migration to RabbitMQ 4.0.</div>' +
            '<br><table><tr><th>Criteria</th><th>Reason</th><th>Status</th></tr>' +
            '<tr><td>Criteria 1</td><td>All good</td><td>Pass</td></tr>' +
            '<tr><td>Criteria 2</td><td>Something is wrong</td><td>Fail</td></tr>' +
            '<tr><td>Criteria 3</td><td>All good</td><td>Pass</td></tr>' +
            '</table>'
        );
    });
});
